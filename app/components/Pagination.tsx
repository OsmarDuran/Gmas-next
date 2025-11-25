import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams?: Record<string, string>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <div className="flex items-center justify-center space-x-2 mt-6">
            <Link
                href={createPageUrl(currentPage - 1)}
                className={clsx(
                    "p-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                    currentPage <= 1 && "pointer-events-none opacity-50"
                )}
            >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
            </span>

            <Link
                href={createPageUrl(currentPage + 1)}
                className={clsx(
                    "p-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                    currentPage >= totalPages && "pointer-events-none opacity-50"
                )}
            >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
        </div>
    );
}
