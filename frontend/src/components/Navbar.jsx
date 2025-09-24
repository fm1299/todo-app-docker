"use client"

export default function Navbar({ onLogout }) {
    return (
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h1 className="text-xl font-bold text-white">TaskFlow</h1>
                </div>

                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </header>
    )
}
