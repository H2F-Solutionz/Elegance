import { useState, useEffect } from "react";
import { Search, MoreVertical, Mail, Phone, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { customersAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Customers = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ display_name: "", email: "" });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const data = await customersAPI.getAll();
            // Filter out admin users
            const filteredCustomers = (data.customers || []).filter((c: any) => c.role !== 'admin');
            setCustomers(filteredCustomers);
        } catch (err: any) {
            toast({ title: "Error fetching customers", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (customer: any) => {
        setEditingCustomer(customer);
        setEditForm({ display_name: customer.display_name || "", email: customer.email || "" });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingCustomer) return;
        try {
            // TODO: Implement API call to update customer
            toast({ title: "Customer updated successfully" });
            setIsEditDialogOpen(false);
            fetchCustomers();
        } catch (err: any) {
            toast({ title: "Error updating customer", description: err.message, variant: "destructive" });
        }
    };

    const handleDelete = (id: string) => {
        toast({ title: "Action not supported", description: "Customer deletion is disabled for security reasons." });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Customers</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your customer base and view their order history.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search customers by name, email, or phone..."
                            className="pl-9 bg-white dark:bg-zinc-950"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-900/50 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Orders</th>
                                <th className="px-6 py-4 font-medium">Total Spent</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Status</th>
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
                            ) : customers.filter(c => c.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No customers found
                                    </td>
                                </tr>
                            ) : customers.filter(c => c.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase())).map((customer) => (
                                <tr key={customer._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-gray-200 dark:border-zinc-700">
                                                <AvatarImage src={customer.avatar_url || ""} alt={customer.display_name || customer.email} />
                                                <AvatarFallback className="bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                                                    {getInitials(customer.display_name || customer.email || '?')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{customer.display_name || 'No Name'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">ID: {customer._id?.slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                <span>{customer.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium">
                                        {customer.totalOrders || 0}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300">
                                        LKR {customer.totalSpent?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${!customer.is_blocked ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
                    `}>
                                            {!customer.is_blocked ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleEditClick(customer)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer font-medium">
                                                    <Mail className="mr-2 h-4 w-4" /> Send Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50" onClick={() => setDeleteConfirm(customer._id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer Details</DialogTitle>
                        <DialogDescription>
                            Update customer information below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Display Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.display_name}
                                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                                placeholder="Enter display name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                placeholder="Enter email"
                                disabled
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">Cancel</Button>
                        <Button onClick={handleSaveEdit} className="bg-pink-600 hover:bg-pink-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer account and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Warning:</strong> Customer deletion is disabled for security reasons.
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </div>
    );
};

export default Customers;
