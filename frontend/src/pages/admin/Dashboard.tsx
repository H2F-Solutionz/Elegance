import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DollarSign,
    ShoppingBag,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";
import { useState, useEffect } from "react";
import { ordersAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type DashboardOrder = {
    _id: string;
    created_at: string;
    user_id?: {
        display_name?: string;
        email?: string;
    };
    user?: {
        display_name?: string;
    };
    product_id?: {
        name?: string;
    };
    product?: {
        name?: string;
    };
    status: string;
    total_amount?: number;
    email?: string;
};

type DashboardStats = {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    recentOrders: DashboardOrder[];
};

const salesData = [
    { name: "Jan", total: 4000 },
    { name: "Feb", total: 3000 },
    { name: "Mar", total: 2000 },
    { name: "Apr", total: 2780 },
    { name: "May", total: 1890 },
    { name: "Jun", total: 2390 },
    { name: "Jul", total: 3490 },
];

const revenueData = [
    { name: "Mon", revenue: 1200 },
    { name: "Tue", revenue: 900 },
    { name: "Wed", revenue: 1600 },
    { name: "Thu", revenue: 1400 },
    { name: "Fri", revenue: 2100 },
    { name: "Sat", revenue: 2600 },
    { name: "Sun", revenue: 2200 },
];

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const exportToCSV = async () => {
        try {
            toast({ title: "Preparing export...", description: "Fetching all order data." });
            const data = await ordersAPI.getAll({ limit: 1000 });
            const allOrders: DashboardOrder[] = data.orders || [];

            if (!allOrders.length) {
                toast({ title: "No data", description: "There are no orders to export.", variant: "destructive" });
                return;
            }

            const headers = ["Order ID", "Date", "Customer", "Email", "Product", "Status", "Amount"];
            const csvRows = allOrders.map((order) => [
                `#${order._id}`,
                new Date(order.created_at).toLocaleDateString(),
                order.user_id?.display_name || "Guest",
                order.user_id?.email || "N/A",
                order.product_id?.name || "N/A",
                order.status,
                `LKR ${order.total_amount}`
            ]);

            const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `all_orders_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "CSV Exported", description: `Full report with ${allOrders.length} orders is ready.` });
        } catch (err: unknown) {
            toast({
                title: "Export failed",
                description: err instanceof Error ? err.message : "Unable to export orders.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await ordersAPI.getStats();
                setStats(data);
            } catch (err: unknown) {
                toast({
                    title: "Error fetching dashboard stats",
                    description: err instanceof Error ? err.message : "Unable to load dashboard data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Overview of your store's performance.</p>
                </div>
                <Button variant="outline" onClick={exportToCSV} className="bg-white dark:bg-zinc-950">
                    <Download className="mr-2 h-4 w-4" /> Export All Orders
                </Button>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">LKR {stats?.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +0%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalOrders}</div>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +0%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +0%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalOrders}</div>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Updated just now
                            </span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Monthly revenue for the current year</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Weekly Revenue</CardTitle>
                        <CardDescription>Revenue generated in the past 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        hide
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest transactions from your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-900/50 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Order ID</th>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Product</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {stats?.recentOrders?.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{order._id.slice(-6)}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{order.user_id?.display_name || order.user?.display_name || 'Guest'}</div>
                                            <div className="text-[10px] text-gray-500">{order.user_id?.email || order.email || ''}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {order.product_id?.name || order.product?.name || 'Product'}
                                        </td>
                                       <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : ''}
                        ${order.status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                      `}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">LKR {order.total_amount?.toLocaleString()}</td>
                                   </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
