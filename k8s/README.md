## Deploy to Kind (3-node) with kubectl

Prereqs: Docker, Kind, kubectl, Node 20+, Python 3.11+ (for local builds).

1) Create the 3-node Kind cluster

```bash
kind create cluster --name todo --config k8s/kind-3node.yaml
```

2) Build images locally

```bash
# From repo root
docker build -t todo-backend:local ./backend
docker build -t todo-frontend:local --build-arg VITE_API_URL=http://localhost:8000 ./frontend
```

3) Load images into the Kind cluster

```bash
kind load docker-image todo-backend:local --name todo
kind load docker-image todo-frontend:local --name todo
```

4) Apply Kubernetes manifests

```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

5) Access services

- Backend Service: `backend:8000` inside cluster
- Frontend Service (NodePort): run `kubectl get svc frontend -o wide` and open `http://localhost:<nodePort>`

Notes
- The backend points to Postgres Service `postgres` using `DATABASE_URL`.
- For production, change the `SECRET_KEY` Secret and tighten resource limits.


