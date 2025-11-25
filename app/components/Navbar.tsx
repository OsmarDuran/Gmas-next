export function Navbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard</h2>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    A
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
            </div>
        </header>
    );
}
