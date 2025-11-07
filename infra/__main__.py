import pulumi
import pulumi_gcp as gcp
import pulumi_kubernetes as k8s
from google.auth import default
from google.auth.transport import requests

# Authenticate with ADC (Application Default Credentials)
credentials, active_project = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
credentials.refresh(requests.Request())
access_token = credentials.token

# Get Pulumi configs
config = pulumi.Config()
gcp_config = pulumi.Config("gcp")
project = gcp_config.get("project") or active_project
region = gcp_config.get("region") or "us-central1"
zone = gcp_config.get("zone") or "us-central1-a"

cluster_name = config.get("cluster-name") or "todo-app-cluster"
node_count = config.get_int("node-count") or 3
db_user = config.get("db-user") or "todo_user"
db_password = config.require_secret("db-password")
db_name = config.get("db-name") or "todo_db"
jwt_secret = config.require_secret("jwt-secret-key")

# Create GKE cluster
cluster = gcp.container.Cluster(
    cluster_name,
    name=cluster_name,
    location=zone,
    initial_node_count=node_count,
    deletion_protection=False,
    node_config=gcp.container.ClusterNodeConfigArgs(
        machine_type="e2-medium",
        oauth_scopes=[
            "https://www.googleapis.com/auth/compute",
            "https://www.googleapis.com/auth/devstorage.read_only",
            "https://www.googleapis.com/auth/logging.write",
            "https://www.googleapis.com/auth/monitoring",
        ],
    ),
)


# Generate kubeconfig from cluster output (no gke-gcloud-auth-plugin)
kubeconfig = pulumi.Output.all(cluster.name, cluster.endpoint, cluster.master_auth).apply(
    lambda args: f"""apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: {args[2]["cluster_ca_certificate"]}
    server: https://{args[1]}
  name: {args[0]}
contexts:
- context:
    cluster: {args[0]}
    user: {args[0]}
  name: {args[0]}
current-context: {args[0]}
kind: Config
preferences: {{}}
users:
- name: {args[0]}
  user:
    token: {access_token}
"""
)

# Create Kubernetes provider
k8s_provider = k8s.Provider("gke-k8s", kubeconfig=kubeconfig)

# PostgreSQL Secret
postgres_secret = k8s.core.v1.Secret(
    "postgres-secret",
    metadata={"name": "postgres-secret"},
    string_data={
        "POSTGRES_USER": db_user,
        "POSTGRES_PASSWORD": db_password,
        "POSTGRES_DB": db_name,
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# PostgreSQL PVC
postgres_pvc = k8s.core.v1.PersistentVolumeClaim(
    "postgres-pvc",
    metadata={"name": "postgres-pvc"},
    spec={
        "accessModes": ["ReadWriteOnce"],
        "resources": {"requests": {"storage": "10Gi"}},
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# PostgreSQL Deployment
postgres_deployment = k8s.apps.v1.Deployment(
    "postgres",
    metadata={"name": "postgres"},
    spec={
        "replicas": 1,
        "selector": {"matchLabels": {"app": "postgres"}},
        "template": {
            "metadata": {"labels": {"app": "postgres"}},
            "spec": {
                "containers": [
                    {
                        "name": "postgres",
                                        # Allow overriding the Postgres image via Pulumi config.
                                        # Set `postgres_image` to your Artifact Registry path (e.g.
                                        # us-central1-docker.pkg.dev/<project>/<repo>/todo-db:tag)
                                        "image": config.get("postgres_image") or "postgres:16",
                        "ports": [{"containerPort": 5432}],
                        "envFrom": [{"secretRef": {"name": "postgres-secret"}}],
                        "volumeMounts": [
                            {"name": "data", "mountPath": "/var/lib/postgresql/data", "subPath": "postgres"}
                        ],
                    }
                ],
                "volumes": [
                    {"name": "data", "persistentVolumeClaim": {"claimName": "postgres-pvc"}}
                ],
            },
        },
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider, depends_on=[postgres_pvc, postgres_secret]),
)

# PostgreSQL Service
postgres_service = k8s.core.v1.Service(
    "postgres-service",
    metadata={"name": "postgres"},
    spec={
        "selector": {"app": "postgres"},
        "ports": [{"name": "postgres", "port": 5432, "targetPort": 5432}],
        "type": "ClusterIP",
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# Backend ConfigMap
backend_config = k8s.core.v1.ConfigMap(
    "backend-config",
    metadata={"name": "backend-config"},
    data={"ACCESS_TOKEN_EXPIRE_MINUTES": "60"},
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# Backend Secret
backend_secret = k8s.core.v1.Secret(
    "backend-secret",
    metadata={"name": "backend-secret"},
    string_data={"SECRET_KEY": jwt_secret},
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# Database URL
database_url = pulumi.Output.concat(
    "postgresql://", db_user, ":", db_password, "@postgres:5432/", db_name
)

# Backend Deployment
backend_deployment = k8s.apps.v1.Deployment(
    "backend",
    metadata={"name": "backend"},
    spec={
        "replicas": 3,
        "selector": {"matchLabels": {"app": "backend"}},
        "template": {
            "metadata": {"labels": {"app": "backend"}},
            "spec": {
                "containers": [
                    {
                        "name": "backend",
                        # Allow overriding the image via Pulumi config (useful when images
                        # are already pushed to Artifact Registry). Set `backend_image`
                        # in the stack config to a full image path like
                        # us-central1-docker.pkg.dev/<project>/<repo>/todo-backend:tag
                        "image": config.get("backend_image") or pulumi.Output.format(
                            "gcr.io/{0}/todo-backend:latest", project
                        ),
                        "ports": [{"containerPort": 8000}],
                        "resources": {
                            "requests": {"cpu": "100m", "memory": "128Mi"},
                            "limits": {"cpu": "500m", "memory": "512Mi"},
                        },
                        "env": [{"name": "DATABASE_URL", "value": database_url}],
                        "envFrom": [
                            {"configMapRef": {"name": "backend-config"}},
                            {"secretRef": {"name": "backend-secret"}},
                        ],
                    }
                ]
            },
        },
    },
    # Ensure the backend deployment waits for Postgres resources to be created
    opts=pulumi.ResourceOptions(provider=k8s_provider, depends_on=[postgres_deployment, postgres_service, backend_config, backend_secret]),
)

# Backend Service
# Reserve a regional static IP for the backend LoadBalancer so the frontend can point to a stable address
backend_static_ip = gcp.compute.Address(
    "backend-static-ip",
    region=region,
    address_type="EXTERNAL",
)

# Backend Service (exposed via LoadBalancer using the reserved static IP)
backend_service = k8s.core.v1.Service(
    "backend-service",
    metadata={"name": "backend"},
    spec={
        "selector": {"app": "backend"},
        "ports": [{"name": "http", "port": 8000, "targetPort": 8000}],
        "type": "LoadBalancer",
        # Request the reserved static IP
        "loadBalancerIP": backend_static_ip.address,
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# Frontend Deployment
frontend_deployment = k8s.apps.v1.Deployment(
    "frontend",
    metadata={"name": "frontend"},
    spec={
        "replicas": 3,
        "selector": {"matchLabels": {"app": "frontend"}},
        "template": {
            "metadata": {"labels": {"app": "frontend"}},
            "spec": {
                "containers": [
                    {
                        "name": "frontend",
                        # Allow overriding the image via Pulumi config (set `frontend_image`)
                        # Example Artifact Registry path:
                        # us-central1-docker.pkg.dev/<project>/<repo>/todo-frontend:tag
                        "image": config.get("frontend_image") or pulumi.Output.format(
                            "gcr.io/{0}/todo-frontend:latest", project
                        ),
                        "ports": [{"containerPort": 80}],
                    }
                ]
            },
        },
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# Frontend Service
frontend_service = k8s.core.v1.Service(
    "frontend-service",
    metadata={"name": "frontend"},
    spec={
        "selector": {"app": "frontend"},
        "ports": [{"name": "http", "port": 80, "targetPort": 80}],
        "type": "LoadBalancer",
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

# Export outputs
pulumi.export("cluster_name", cluster.name)
pulumi.export("cluster_endpoint", cluster.endpoint)
pulumi.export(
    "frontend_ip",
    frontend_service.status.apply(
        lambda s: s.load_balancer.ingress[0].ip
        if s and s.load_balancer and s.load_balancer.ingress
        else "pending"
    ),
)
# Export the reserved backend static IP (it will be available after allocation)
pulumi.export(
    "backend_ip",
    backend_static_ip.address,
)

# Horizontal Pod Autoscaler for the backend Deployment (scale by CPU)
# Scales between minReplicas and maxReplicas based on target CPU utilization.
backend_hpa = k8s.autoscaling.v2.HorizontalPodAutoscaler(
    "backend-hpa",
    metadata={"name": "backend-hpa"},
    spec={
        "scaleTargetRef": {"apiVersion": "apps/v1", "kind": "Deployment", "name": "backend"},
        "minReplicas": 3,
        "maxReplicas": 10,
        "metrics": [
            {
                "type": "Resource",
                "resource": {
                    "name": "cpu",
                    "target": {"type": "Utilization", "averageUtilization": 50},
                },
            }
        ],
    },
    opts=pulumi.ResourceOptions(provider=k8s_provider, depends_on=[backend_deployment]),
)
