import { useState, useEffect } from "react";
import { Search, Filter, Eye, Download, Loader2, CheckCircle2, MoreVertical, Package, User, Mail, Phone, MapPin, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ordersAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const Orders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState("all");

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
            toast({ title: "Order updated successfully", description: `Order status changed to ${newStatus}` });
            fetchOrders();
            if (selectedOrder && selectedOrder._id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (err: any) {
            toast({ title: "Failed to update order", description: err.message, variant: "destructive" });
        }
    };

    const openOrderDetails = (order: any) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const exportToCSV = () => {
        if (filteredOrders.length === 0) {
            toast({ title: "No data to export", description: "There are no orders to export.", variant: "destructive" });
            return;
        }

        const headers = ["Order ID", "Customer Name", "Email", "Total Amount", "Status", "Date"];
        const csvData = filteredOrders.map((order) => [
            order._id || "",
            order.user_id?.display_name || order.user_id || "Guest",
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
            order.user_id?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;

        const orderDate = new Date(order.created_at);
        const now = new Date();
        const matchesDate = (() => {
            if (dateFilter === "all") return true;
            if (dateFilter === "today") {
                return orderDate.toDateString() === now.toDateString();
            }
            if (dateFilter === "yesterday") {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                return orderDate.toDateString() === yesterday.toDateString();
            }
            if (dateFilter === "last7") {
                const last7 = new Date(now);
                last7.setDate(now.getDate() - 7);
                return orderDate >= last7;
            }
            return true;
        })();

        return matchesSearch && matchesStatus && matchesDate;
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className={`ml-2 shrink-0 ${dateFilter !== "all" ? "text-pink-600 border-pink-200 bg-pink-50" : ""}`}>
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDateFilter("all")}>All Time</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDateFilter("today")}>Today</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDateFilter("yesterday")}>Yesterday</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDateFilter("last7")}>Last 7 Days</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                            <div className="font-medium text-gray-900 dark:text-gray-200">{order.user_id?.display_name || 'Guest'}</div>
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
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-pink-600 dark:text-pink-400 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20" 
                                                onClick={() => openOrderDetails(order)}
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Status</div>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'pending')} disabled={order.status === 'pending'}>
                                                        Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'processing')} disabled={order.status === 'processing'}>
                                                        Processing
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'shipped')} disabled={order.status === 'shipped'}>
                                                        Shipped
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'delivered')} disabled={order.status === 'delivered'}>
                                                        Delivered
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUpdateStatus(order._id, 'cancelled')} 
                                                        disabled={order.status === 'cancelled'}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        Cancel Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl">Order Details</DialogTitle>
                            {selectedOrder && (
                                <Badge variant="outline" className={`
                                    ${selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                    ${selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                                    ${selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                    ${selectedOrder.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : ''}
                                    ${selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                `}>
                                    {selectedOrder.status?.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                        <DialogDescription>
                            Detailed information for order #{selectedOrder?._id?.slice(-8)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="grid gap-6 py-4">
                            {/* Order Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date
                                    </div>
                                    <div className="text-sm font-semibold">{new Date(selectedOrder.created_at).toLocaleString()}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" /> Total Amount
                                    </div>
                                    <div className="text-sm font-bold text-pink-600">LKR {selectedOrder.total_amount?.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="space-y-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-800">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <User className="h-4 w-4" /> Customer Information
                                </h3>
                                <div className="grid gap-2">
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="font-medium min-w-[80px]">Name:</div>
                                        <div>{selectedOrder.user_id?.display_name || 'Guest'}</div>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <Mail className="h-4 w-4 mt-0.5 text-gray-400" />
                                        <div>{selectedOrder.email || 'N/A'}</div>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <Phone className="h-4 w-4 mt-0.5 text-gray-400" />
                                        <div>{selectedOrder.phone || 'Not provided'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Information */}
                            <div className="space-y-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-800">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Shipping Address
                                </h3>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {selectedOrder.delivery_address || 'No address provided'}
                                </div>
                            </div>

                            {/* Product Information */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Order Items
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-zinc-800">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Product</th>
                                                <th className="px-4 py-2 text-center font-medium">Qty</th>
                                                <th className="px-4 py-2 text-right font-medium">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{selectedOrder.product_id?.name || 'Unknown Product'}</div>
                                                    <div className="text-xs text-gray-500">ID: {selectedOrder.product_id?._id || selectedOrder.product_id}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">{selectedOrder.quantity || 1}</td>
                                                <td className="px-4 py-3 text-right">LKR {selectedOrder.product_id?.price?.toLocaleString() || selectedOrder.total_amount?.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex sm:justify-between gap-2">
                        <div className="flex gap-2">
                            {selectedOrder?.status !== 'delivered' && selectedOrder?.status !== 'cancelled' && (
                                <Button 
                                    variant="outline" 
                                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                                >
                                    Mark as Delivered
                                </Button>
                            )}
                        </div>
                        <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
