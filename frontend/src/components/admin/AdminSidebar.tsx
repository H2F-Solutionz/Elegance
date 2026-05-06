import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    X,
    LogOut,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
    const location = useLocation();

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform flex-col justify-between border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-zinc-950 sm:w-72 lg:static lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600">
                            <span className="text-lg font-bold text-white">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Panel</span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close sidebar</span>
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-4">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                                            isActive
                                                ? "text-pink-600 dark:text-pink-400"
                                                : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                    <button
                        onClick={() => {
                            localStorage.removeItem('sparkle_token');
                            window.location.href = '/';
                        }}
                        className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 dark:text-gray-300 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200"
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                        Exit Admin
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
