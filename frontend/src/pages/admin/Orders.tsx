import { useState, useEffect } from "react";
import { Search, Filter, Eye, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ordersAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Orders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const data = await ordersAPI.getAll();
            setOrders(data.orders || []);
        } catch (err: any) {
            toast({ title: "Error fetching orders", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await ordersAPI.update(id, { status: newStatus });
            toast({ title: "Order updated successfully" });
            fetchOrders();
        } catch (err: any) {
            toast({ title: "Failed to update order", description: err.message, variant: "destructive" });
        }
    };

    const exportToCSV = () => {
        if (filteredOrders.length === 0) {
            toast({ title: "No data to export", description: "There are no orders to export.", variant: "destructive" });
            return;
        }

        const headers = ["Order ID", "Customer Name", "Email", "Total Amount", "Status", "Date"];
        const csvData = filteredOrders.map((order) => [
            order._id || "",
            order.user?.display_name || order.user_id || "",
            order.email || "",
            `LKR ${order.total_amount?.toLocaleString() || "0"}`,
            order.status || "",
            new Date(order.created_at).toLocaleDateString(),
        ]);

        // Combine headers and data
        const csvContent = [
            headers.join(","),
            ...csvData.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `orders-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "CSV exported successfully", description: `Exported ${filteredOrders.length} orders.` });
    };

    // Filter orders based on search and status
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Orders</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track customer orders here.</p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto bg-white dark:bg-zinc-950" onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by order ID or customer..."
                            className="pl-9 bg-white dark:bg-zinc-950"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                            <Button
                                key={status}
                                size="sm"
                                className="whitespace-nowrap"
                                variant={selectedStatus === status ? "secondary" : "ghost"}
                                onClick={() => setSelectedStatus(status)}
                            >
                                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                        <Button variant="outline" size="icon" className="ml-2 shrink-0">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-900/50 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Items</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">#{order._id?.slice(-6)}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">{order.user?.display_name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">{order.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : ''}
                      ${order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                    `}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{order.quantity || 1}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300">LKR {order.total_amount?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStatus(order._id, 'delivered')}>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20" onClick={() => {}}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Orders;
