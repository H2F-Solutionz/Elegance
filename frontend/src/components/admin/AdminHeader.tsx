import { Bell, Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface AdminHeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const AdminHeader = ({ setSidebarOpen }: AdminHeaderProps) => {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-zinc-950 sm:px-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open sidebar</span>
                </Button>

                <div className="hidden md:flex relative max-w-md w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search admin, orders, products..."
                        className="w-full bg-gray-100/50 pl-9 md:w-[300px] lg:w-[400px] dark:bg-zinc-900 focus-visible:ring-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute flex h-2 w-2 top-2 right-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                    </span>
                    <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 hover:text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 dark:hover:bg-pink-900/60 transition-colors">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Admin menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-1">
                        <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/admin/settings" className="cursor-pointer font-medium">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/" className="cursor-pointer">View Storefront</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => {
                                localStorage.removeItem('sparkle_token');
                                window.location.href = '/';
                            }}
                            className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                        >
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default AdminHeader;
