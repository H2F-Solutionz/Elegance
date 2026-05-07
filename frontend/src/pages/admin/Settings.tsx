import { useState, useEffect, useRef } from "react";
import { Save, Store, CreditCard, BellRing, Settings as SettingsIcon, Palette, Check, LayoutDashboard, Plus, Pencil, Trash2, Eye, EyeOff, Image as ImageIcon, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme, ColorTheme, Theme, Radius } from "@/contexts/ThemeContext";
import { adminAPI, slidesAPI } from "@/lib/api";

// ─── Slide form shape ────────────────────────────────────────────────────
const EMPTY_SLIDE = {
    title: '',
    subtitle: '',
    description: '',
    image: '',
    cta: 'Shop Now',
    link: '/',
    active: true,
};

const Settings = () => {
    const { toast } = useToast();
    const { theme, setTheme, color, setColor, radius, setRadius } = useTheme();
    const [isSaving, setIsSaving] = useState(false);

    // ── Slides state ──────────────────────────────────────────────────────
    const [slides, setSlides] = useState<any[]>([]);
    const [slidesLoading, setSlidesLoading] = useState(true);
    const [showSlideForm, setShowSlideForm] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any | null>(null);
    const [slideForm, setSlideForm] = useState({ ...EMPTY_SLIDE });
    const [slideImagePreview, setSlideImagePreview] = useState('');
    const [isSlideSaving, setIsSlideSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load slides
    const loadSlides = async () => {
        setSlidesLoading(true);
        try {
            const data = await slidesAPI.getAll();
            setSlides(data);
        } catch (err) {
            console.error('Failed to load slides:', err);
        } finally {
            setSlidesLoading(false);
        }
    };

    useEffect(() => { loadSlides(); }, []);

    // Open Add form
    const openAddSlide = () => {
        setEditingSlide(null);
        setSlideForm({ ...EMPTY_SLIDE });
        setSlideImagePreview('');
        setShowSlideForm(true);
    };

    // Open Edit form
    const openEditSlide = (slide: any) => {
        setEditingSlide(slide);
        setSlideForm({
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            description: slide.description || '',
            image: slide.image || '',
            cta: slide.cta || 'Shop Now',
            link: slide.link || '/',
            active: slide.active !== false,
        });
        setSlideImagePreview(slide.image || '');
        setShowSlideForm(true);
    };

    // Handle image file pick → base64
    const handleSlideImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            setSlideForm(prev => ({ ...prev, image: result }));
            setSlideImagePreview(result);
        };
        reader.readAsDataURL(file);
    };

    // Handle URL paste
    const handleSlideImageUrl = (url: string) => {
        setSlideForm(prev => ({ ...prev, image: url }));
        setSlideImagePreview(url);
    };

    // Save slide (create or update)
    const handleSaveSlide = async () => {
        if (!slideForm.title.trim()) {
            toast({ title: 'Validation Error', description: 'Slide title is required.', variant: 'destructive' });
            return;
        }
        if (!slideForm.image.trim()) {
            toast({ title: 'Validation Error', description: 'Slide image is required.', variant: 'destructive' });
            return;
        }
        setIsSlideSaving(true);
        try {
            if (editingSlide) {
                await slidesAPI.update(editingSlide._id, slideForm);
                toast({ title: 'Slide updated', description: 'The slide has been saved successfully.' });
            } else {
                await slidesAPI.create(slideForm);
                toast({ title: 'Slide created', description: 'New slide added to the carousel.' });
            }
            setShowSlideForm(false);
            loadSlides();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to save slide.', variant: 'destructive' });
        } finally {
            setIsSlideSaving(false);
        }
    };

    // Toggle active
    const handleToggleSlide = async (slide: any) => {
        try {
            await slidesAPI.update(slide._id, { active: !slide.active });
            loadSlides();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    // Delete slide
    const handleDeleteSlide = async (id: string) => {
        if (!window.confirm('Delete this slide? This cannot be undone.')) return;
        try {
            await slidesAPI.delete(id);
            toast({ title: 'Slide deleted' });
            loadSlides();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    // General Settings State
    const [generalSettings, setGeneralSettings] = useState({
        storeName: "Sparkle Bangles Shop",
        storeEmail: "support@sparklebangles.com",
        storePhone: "+1 (555) 123-4567",
        currency: "USD",
        storeDescription: "Sparkle Bangles Shop offers high-quality jewelry for all occasions.",
        address: "123 Jewelry Lane\nFashion District\nNY 10001, United States",
    });

    // Payment Settings State
    const [paymentSettings, setPaymentSettings] = useState({
        stripe: true,
        cod: true,
    });

    // Load payment methods from backend
    useEffect(() => {
        const loadPaymentMethods = async () => {
            try {
                const methods = await adminAPI.getPaymentMethods();
                setPaymentSettings(methods);
            } catch (err) {
                console.error('Failed to load payment methods:', err);
                // Use default settings if fetch fails
            }
        };
        loadPaymentMethods();
    }, []);

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        orderPlaced: true,
        lowStock: true,
        newCustomer: false,
    });

    // Advanced Settings State
    const [advancedSettings, setAdvancedSettings] = useState({
        maintenanceMode: false,
    });

    // Handle General Settings Change
    const handleGeneralChange = (field: string, value: string) => {
        setGeneralSettings(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle Payment Settings Change
    const handlePaymentChange = (field: string, value: boolean) => {
        setPaymentSettings(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle Notification Settings Change
    const handleNotificationChange = (field: string, value: boolean) => {
        setNotificationSettings(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Save General Settings
    const handleSaveGeneral = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Store settings saved",
                description: "Your store information has been updated successfully.",
            });
        }, 1000);
    };

    // Save Payment Settings
    const handleSavePayments = async () => {
        setIsSaving(true);
        try {
            await adminAPI.updatePaymentMethods(paymentSettings);
            toast({
                title: "Payment methods updated",
                description: "Your payment configuration has been saved successfully.",
            });
        } catch (err: any) {
            console.error('Error saving payment settings:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to save payment settings.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Save Notification Settings
    const handleSaveNotifications = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Notification preferences saved",
                description: "Your alert preferences have been updated.",
            });
        }, 1000);
    };

    // Toggle Maintenance Mode
    const handleToggleMaintenance = () => {
        setAdvancedSettings(prev => ({
            ...prev,
            maintenanceMode: !prev.maintenanceMode,
        }));
        toast({
            title: advancedSettings.maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled",
            description: advancedSettings.maintenanceMode
                ? "Your store is now open to customers."
                : "Your store is now under maintenance.",
        });
    };

    // Delete Store Data
    const handleDeleteData = () => {
        if (window.confirm("Are you absolutely sure? This action cannot be undone. All products, orders, and customer data will be permanently deleted.")) {
            toast({
                title: "Data deletion initiated",
                description: "All store data is being permanently removed.",
            });
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Settings saved",
                description: "Your changes have been saved successfully.",
            });
        }, 1000);
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl px-3 sm:px-0">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Manage your store configuration and preferences.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full mb-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-5xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg p-1 h-auto flex-wrap gap-1">
                    <TabsTrigger value="general" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-300 py-2 px-2 sm:py-2.5 sm:px-3 rounded-md transition-all text-xs sm:text-sm">
                        <Store className="mr-1 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                        <span className="sm:hidden">Store</span>
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-300 py-2 px-2 sm:py-2.5 sm:px-3 rounded-md transition-all text-xs sm:text-sm">
                        <CreditCard className="mr-1 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Payments</span>
                        <span className="sm:hidden">Pay</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-300 py-2 px-2 sm:py-2.5 sm:px-3 rounded-md transition-all text-xs sm:text-sm">
                        <BellRing className="mr-1 sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Alerts</span>
                        <span className="sm:hidden">Alert</span>
                    </TabsTrigger>
                    <TabsTrigger value="ui-settings" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-300 py-2 px-2 sm:py-2.5 sm:px-3 rounded-md transition-all text-xs sm:text-sm hidden sm:flex">
                        <LayoutDashboard className="mr-1 sm:mr-2 h-4 w-4" />
                        <span className="hidden md:inline">UI Settings</span>
                        <span className="md:hidden">UI</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-300 py-2 px-2 sm:py-2.5 sm:px-3 rounded-md transition-all text-xs sm:text-sm hidden sm:flex">
                        <Palette className="mr-1 sm:mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Appearance</span>
                        <span className="md:hidden">Look</span>
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/30 dark:data-[state=active]:text-pink-300 py-2 px-2 sm:py-2.5 sm:px-3 rounded-md transition-all text-xs sm:text-sm hidden lg:flex">
                        <SettingsIcon className="mr-1 sm:mr-2 h-4 w-4" />
                        <span>Advanced</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                            <CardDescription>
                                Update your store's basic details and contact information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName">Store Name</Label>
                                    <Input 
                                        id="storeName" 
                                        value={generalSettings.storeName}
                                        onChange={(e) => handleGeneralChange('storeName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeEmail">Contact Email</Label>
                                    <Input 
                                        id="storeEmail" 
                                        type="email" 
                                        value={generalSettings.storeEmail}
                                        onChange={(e) => handleGeneralChange('storeEmail', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storePhone">Phone Number</Label>
                                    <Input 
                                        id="storePhone" 
                                        type="tel" 
                                        value={generalSettings.storePhone}
                                        onChange={(e) => handleGeneralChange('storePhone', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <select
                                        id="currency"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={generalSettings.currency}
                                        onChange={(e) => handleGeneralChange('currency', e.target.value)}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            <div className="space-y-2">
                                <Label htmlFor="storeDescription">Store Description</Label>
                                <Textarea
                                    id="storeDescription"
                                    placeholder="Enter a brief description of your store..."
                                    value={generalSettings.storeDescription}
                                    onChange={(e) => handleGeneralChange('storeDescription', e.target.value)}
                                    rows={4}
                                />
                                <p className="text-[0.8rem] text-gray-500 dark:text-gray-400">
                                    Brief description for your store. This appears in search engine results.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Store Address</Label>
                                <Textarea
                                    id="address"
                                    placeholder="123 Jewelry Lane..."
                                    value={generalSettings.address}
                                    onChange={(e) => handleGeneralChange('address', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-4">
                            <Button onClick={handleSaveGeneral} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto">
                                {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>
                                Configure how your store accepts payments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-zinc-950">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm font-medium leading-none text-gray-900 dark:text-white">Credit Card Processing (Stripe)</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Accept major credit cards securely.</span>
                                </div>
                                <Switch 
                                    checked={paymentSettings.stripe}
                                    onCheckedChange={(checked) => handlePaymentChange('stripe', checked)}
                                    id="stripe" 
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-zinc-950">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm font-medium leading-none text-gray-900 dark:text-white">Cash on Delivery (COD)</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Allow customers to pay when items are delivered.</span>
                                </div>
                                <Switch 
                                    checked={paymentSettings.cod}
                                    onCheckedChange={(checked) => handlePaymentChange('cod', checked)}
                                    id="cod" 
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-4">
                            <Button onClick={handleSavePayments} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto">
                                <Save className="mr-2 h-4 w-4" /> Save Payments Configuration
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose what events you want to be notified about.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="order-placed" className="flex flex-col space-y-1">
                                            <span>New Orders</span>
                                            <span className="font-normal text-xs text-gray-500">Receive an email when a new order is placed.</span>
                                        </Label>
                                        <Switch 
                                            id="order-placed" 
                                            checked={notificationSettings.orderPlaced}
                                            onCheckedChange={(checked) => handleNotificationChange('orderPlaced', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="low-stock" className="flex flex-col space-y-1">
                                            <span>Low Stock Alerts</span>
                                            <span className="font-normal text-xs text-gray-500">Get notified when product inventory falls below 5.</span>
                                        </Label>
                                        <Switch 
                                            id="low-stock" 
                                            checked={notificationSettings.lowStock}
                                            onCheckedChange={(checked) => handleNotificationChange('lowStock', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="new-customer" className="flex flex-col space-y-1">
                                            <span>New Customer Registration</span>
                                            <span className="font-normal text-xs text-gray-500">Receive an email when a new user creates an account.</span>
                                        </Label>
                                        <Switch 
                                            id="new-customer" 
                                            checked={notificationSettings.newCustomer}
                                            onCheckedChange={(checked) => handleNotificationChange('newCustomer', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-4">
                            <Button onClick={handleSaveNotifications} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto">
                                <Save className="mr-2 h-4 w-4" /> Save Preferences
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="mt-0">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Appearance Settings</CardTitle>
                            <CardDescription>
                                Customize the store's global aesthetic and dark mode preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Theme Selection */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium leading-none text-gray-900 dark:text-white mb-2">Theme Preference</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Select the background theme for the application.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 pt-6 bg-white hover:bg-gray-50 hover:text-gray-900 ${theme === 'light' ? 'border-primary' : 'border-gray-200 dark:border-zinc-800'} transition-all`}
                                    >
                                        <div className="space-y-2 w-full">
                                            <div className="p-2 w-full rounded-sm bg-gray-100 flex items-center justify-center">
                                                <div className="w-4/5 h-16 rounded-sm bg-white border border-gray-200 shadow-sm"></div>
                                            </div>
                                        </div>
                                        <span className="block w-full text-center mt-4 font-semibold text-sm">Light</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 pt-6 bg-zinc-950 hover:bg-zinc-900 hover:text-white ${theme === 'dark' ? 'border-primary' : 'border-gray-200 dark:border-zinc-800'} transition-all`}
                                    >
                                        <div className="space-y-2 w-full">
                                            <div className="p-2 w-full rounded-sm bg-zinc-800 flex items-center justify-center">
                                                <div className="w-4/5 h-16 rounded-sm bg-zinc-900 border border-zinc-700 shadow-sm"></div>
                                            </div>
                                        </div>
                                        <span className="block w-full p-2 text-center mt-2 font-semibold text-sm text-white">Dark</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("system")}
                                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 pt-6 bg-gradient-to-br from-white to-zinc-950 hover:opacity-90 ${theme === 'system' ? 'border-primary' : 'border-gray-200 dark:border-zinc-800'} transition-all`}
                                    >
                                        <div className="space-y-2 w-full flex gap-2">
                                            <div className="p-2 w-1/2 rounded-sm bg-gray-100 flex items-center justify-center">
                                                <div className="w-full h-16 rounded-sm bg-white border border-gray-200 shadow-sm"></div>
                                            </div>
                                            <div className="p-2 w-1/2 rounded-sm bg-zinc-800 flex items-center justify-center">
                                                <div className="w-full h-16 rounded-sm bg-zinc-900 border border-zinc-700 shadow-sm"></div>
                                            </div>
                                        </div>
                                        <span className="block w-full p-2 text-center mt-2 font-semibold text-sm bg-white/80 dark:bg-zinc-950/80 rounded">System</span>
                                    </button>
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            {/* Color Selection */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium leading-none text-gray-900 dark:text-white mb-2">Primary Color</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose the main accent color that reflects your brand.</p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {(["pink", "violet", "emerald", "gold"] as ColorTheme[]).map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all ${color === c ? 'border-primary shadow-md scale-110' : 'border-transparent hover:scale-105 hover:shadow-sm'
                                                }`}
                                        >
                                            <span
                                                className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
                                                style={{
                                                    backgroundColor:
                                                        c === 'pink' ? 'hsl(330 80% 55%)' :
                                                            c === 'violet' ? 'hsl(260 80% 60%)' :
                                                                c === 'emerald' ? 'hsl(150 70% 45%)' :
                                                                    'hsl(43 74% 49%)'
                                                }}
                                            >
                                                {color === c && <Check className="h-5 w-5 text-white" />}
                                            </span>
                                            <span className="sr-only">Set color sequence to {c}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-800" />

                            {/* Radius Selection */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium leading-none text-gray-900 dark:text-white mb-2">Corner Radius</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose the roundness of buttons, inputs, and cards globally.</p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Button
                                        variant={radius === "0" ? "default" : "outline"}
                                        className="rounded-none w-32"
                                        onClick={() => setRadius("0")}
                                    >
                                        Sharp Base
                                    </Button>
                                    <Button
                                        variant={radius === "0.5" ? "default" : "outline"}
                                        className="rounded-md w-32"
                                        onClick={() => setRadius("0.5")}
                                    >
                                        Rounded Box
                                    </Button>
                                    <Button
                                        variant={radius === "1.0" ? "default" : "outline"}
                                        className="rounded-full w-32"
                                        onClick={() => setRadius("1.0")}
                                    >
                                        Pill Shaped
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── UI Settings Tab ───────────────────────────────── */}
                <TabsContent value="ui-settings" className="mt-0">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Hero Slideshow</CardTitle>
                                    <CardDescription>Manage the banner slides shown on the homepage carousel.</CardDescription>
                                </div>
                                <Button onClick={openAddSlide} className="bg-pink-600 hover:bg-pink-700 text-white gap-2">
                                    <Plus className="h-4 w-4" /> Add Slide
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* ── Inline Slide Form ──────────────────── */}
                            {showSlideForm && (
                                <div className="mb-6 rounded-xl border border-pink-200 dark:border-pink-900/40 bg-pink-50/50 dark:bg-pink-950/20 p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{editingSlide ? 'Edit Slide' : 'New Slide'}</h3>
                                        <button onClick={() => setShowSlideForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                                    </div>

                                    {/* Image */}
                                    <div className="space-y-2">
                                        <Label>Slide Image</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Paste image URL…"
                                                value={slideForm.image.startsWith('data:') ? '' : slideForm.image}
                                                onChange={e => handleSlideImageUrl(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1 shrink-0">
                                                <ImageIcon className="h-4 w-4" /> Upload
                                            </Button>
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSlideImageFile} />
                                        </div>
                                        {slideImagePreview && (
                                            <div className="relative rounded-lg overflow-hidden h-36 bg-gray-100 dark:bg-zinc-800">
                                                <img src={slideImagePreview} alt="preview" className="w-full h-full object-cover" />
                                                <button onClick={() => { setSlideImagePreview(''); setSlideForm(p => ({ ...p, image: '' })); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Title *</Label>
                                            <Input value={slideForm.title} onChange={e => setSlideForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Timeless Elegance" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Subtitle</Label>
                                            <Input value={slideForm.subtitle} onChange={e => setSlideForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="e.g. Wedding Collection" />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <Label>Description</Label>
                                            <Textarea value={slideForm.description} onChange={e => setSlideForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Short description shown on the slide" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Button Text (CTA)</Label>
                                            <Input value={slideForm.cta} onChange={e => setSlideForm(p => ({ ...p, cta: e.target.value }))} placeholder="Shop Now" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Button Link</Label>
                                            <Input value={slideForm.link} onChange={e => setSlideForm(p => ({ ...p, link: e.target.value }))} placeholder="/hot-sales" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Switch checked={slideForm.active} onCheckedChange={v => setSlideForm(p => ({ ...p, active: v }))} id="slide-active" />
                                        <Label htmlFor="slide-active">Visible on homepage</Label>
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <Button onClick={handleSaveSlide} disabled={isSlideSaving} className="bg-pink-600 hover:bg-pink-700 text-white gap-2">
                                            <Save className="h-4 w-4" />{isSlideSaving ? 'Saving…' : 'Save Slide'}
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowSlideForm(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Slide List ─────────────────────────── */}
                            {slidesLoading ? (
                                <div className="py-12 text-center text-gray-400">Loading slides…</div>
                            ) : slides.length === 0 ? (
                                <div className="py-12 text-center">
                                    <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No slides yet. Click <strong>Add Slide</strong> to create your first one.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {slides.map((slide, i) => (
                                        <div key={slide._id} className={`flex items-center gap-4 rounded-xl border p-3 transition-all ${
                                            slide.active
                                                ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900'
                                                : 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900/50 opacity-60'
                                        }`}>
                                            {/* Thumbnail */}
                                            <div className="h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-800">
                                                <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">{slide.title}</p>
                                                {slide.subtitle && <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>}
                                                <p className="text-xs text-gray-400 mt-0.5">CTA: <span className="font-medium">{slide.cta}</span> → <span className="font-medium">{slide.link}</span></p>
                                            </div>

                                            {/* Badge */}
                                            <span className={`hidden sm:inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                                                slide.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800'
                                            }`}>
                                                {slide.active ? 'Live' : 'Hidden'}
                                            </span>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => handleToggleSlide(slide)} title={slide.active ? 'Hide slide' : 'Show slide'}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                                    {slide.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                                <button onClick={() => openEditSlide(slide)} title="Edit slide"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteSlide(slide._id)} title="Delete slide"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advanced" className="mt-0">
                    <Card className="border-red-200 dark:border-red-900/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible and destructive actions. Proceed with caution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                                <div className="space-y-1 pr-4">
                                    <h4 className="font-medium text-red-900 dark:text-red-300">Maintenance Mode</h4>
                                    <p className="text-sm text-red-700 dark:text-red-400">Display a "Store under maintenance" message to all visitors.</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="text-red-600 border-red-200 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40"
                                    onClick={handleToggleMaintenance}
                                >
                                    {advancedSettings.maintenanceMode ? "Disable" : "Enable"}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                                <div className="space-y-1 pr-4">
                                    <h4 className="font-medium text-red-900 dark:text-red-300">Delete Store Data</h4>
                                    <p className="text-sm text-red-700 dark:text-red-400">Permanently remove all products, orders, and customer data.</p>
                                </div>
                                <Button 
                                    variant="destructive"
                                    onClick={handleDeleteData}
                                >
                                    Delete All Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
};

export default Settings;
