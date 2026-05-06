import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { productsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type ProductFormItem = {
    _id?: string;
    id?: string;
    name: string;
    category: string;
    price: number;
    stock?: number;
    image: string;
    description: string;
    material?: string;
    isHotSale?: boolean;
    isLatestArrival?: boolean;
    inStock?: boolean;
};

const Products = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<ProductFormItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductFormItem | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "women",
        price: "",
        stock: "",
        image: "",
        description: "",
        material: "",
        isHotSale: false,
        isLatestArrival: false
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productsAPI.getAll();
            setProducts(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to fetch products.";
            toast({ title: "Error fetching products", description: message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await productsAPI.delete(id);
            toast({ title: "Product deleted successfully" });
            setDeleteConfirm(null);
            fetchProducts();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to delete product.";
            toast({ title: "Error deleting product", description: message, variant: "destructive" });
        }
    };

    const handleOpenDialog = (product: ProductFormItem | null = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || "",
                category: product.category || "",
                price: String(product.price || ""),
                stock: String(product.stock || "0"),
                image: product.image || "",
                description: product.description || "",
                material: product.material || "",
                isHotSale: !!product.isHotSale,
                isLatestArrival: !!product.isLatestArrival
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                category: "women",
                price: "",
                stock: "",
                image: "",
                description: "",
                material: "",
                isHotSale: false,
                isLatestArrival: false
            });
        }
        setIsDialogOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                inStock: parseInt(formData.stock) > 0
            };

            if (editingProduct) {
                await productsAPI.update(editingProduct._id || editingProduct.id, productData);
                toast({ title: "Product updated successfully" });
            } else {
                await productsAPI.create(productData);
                toast({ title: "Product created successfully" });
            }
            setIsDialogOpen(false);
            fetchProducts();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to save product.";
            toast({ title: "Error saving product", description: message, variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Products</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your store's inventory.</p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9 bg-white dark:bg-zinc-950"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto bg-white dark:bg-zinc-950">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-900/50 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                    </td>
                                </tr>
                            ) : products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            ) : products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                                <tr key={product._id || product.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-100">
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.category}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300">LKR {product.price}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${product.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
                    `}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleOpenDialog(product)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                                                    onClick={() => setDeleteConfirm(product._id || product.id || "")}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination stub */}
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 sm:px-6">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-400">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">97</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <Button variant="outline" size="sm" className="rounded-r-none relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-zinc-800">
                                    <span className="sr-only">Previous</span>
                                    &larr;
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-none relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-white dark:ring-gray-700 dark:hover:bg-zinc-800 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 z-10 border-pink-600/20">
                                    1
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-none relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-white dark:ring-gray-700 dark:hover:bg-zinc-800">
                                    2
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-none relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-white dark:ring-gray-700 dark:hover:bg-zinc-800">
                                    3
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-l-none relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-zinc-800">
                                    <span className="sr-only">Next</span>
                                    &rarr;
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                            Enter the details for the product. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                            <Label htmlFor="name" className="sm:text-right">Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                            <Label htmlFor="category" className="sm:text-right">Category</Label>
                            <select 
                                id="category" 
                                value={formData.category} 
                                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                required
                            >
                                <option value="women">Women</option>
                                <option value="men">Men</option>
                                <option value="kids">Kids</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                            <Label htmlFor="description" className="sm:text-right sm:mt-2">Description</Label>
                            <textarea 
                                id="description" 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                            <Label htmlFor="price" className="sm:text-right">Price (LKR)</Label>
                            <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                            <Label htmlFor="stock" className="sm:text-right">Stock</Label>
                            <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
                            <Label className="sm:text-right sm:mt-2">Image</Label>
                            <div className="col-span-3 space-y-2">
                                <Input id="image" placeholder="Image URL" value={formData.image.startsWith('data:') ? 'Uploaded Base64 Image' : formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">OR</span>
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        Upload File
                                    </Button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>
                                {formData.image && (
                                    <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                            <Label htmlFor="material" className="sm:text-right">Material</Label>
                            <Input id="material" value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                            <Label className="sm:text-right">Features</Label>
                            <div className="col-span-3 flex gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={formData.isHotSale} onChange={(e) => setFormData({...formData, isHotSale: e.target.checked})} />
                                    Hot Sale
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={formData.isLatestArrival} onChange={(e) => setFormData({...formData, isLatestArrival: e.target.checked})} />
                                    Latest
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Warning:</strong> This will permanently remove the product from your store.
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Products;
