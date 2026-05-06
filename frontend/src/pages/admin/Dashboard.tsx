import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DollarSign,
    ShoppingBag,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from "lucide-react";
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
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await ordersAPI.getStats();
                setStats(data);
            } catch (err: any) {
                toast({ title: "Error fetching dashboard stats", description: err.message, variant: "destructive" });
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Overview of your store's performance.</p>
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
                                {stats?.recentOrders?.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{order._id.slice(-6)}</td>
                                        <td className="px-4 py-3">{order.user?.display_name || 'Guest'}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.product_id?.name}</td>
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
                                        <td className="px-4 py-3 text-right font-medium">₹{order.total_amount?.toLocaleString()}</td>
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
