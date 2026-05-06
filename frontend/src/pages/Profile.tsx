import React, { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { authAPI, setToken, clearToken, userAPI, productsAPI } from '@/lib/api';
import { User, Mail, Phone, Lock, LogOut, ShoppingBag, Heart, Package, Settings, ChevronRight, Star, Clock, MapPin, Camera } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '@/data/products';

type ProfileOrder = {
  _id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_address?: string;
};

type ProfileUser = {
  id?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  wishlist?: Product[];
  cart?: unknown[];
};

type DashboardData = {
  user: ProfileUser;
  orders: ProfileOrder[];
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ display_name: '', avatar_url: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authAPI.me();
        // Redirect admin users to admin panel
        if (user.role === 'admin') {
          navigate('/admin');
          return;
        }
        setUserProfile(user);
        setIsLoggedIn(true);
        fetchDashboard();
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getDashboard();
      setDashboardData(data);
      setUserProfile(data.user);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authAPI.login(loginForm.email, loginForm.password);
      // Redirect admin users to admin panel
      if (res.user.role === 'admin') {
        setToken(res.session.access_token);
        toast({
          title: "Admin Login",
          description: "Redirecting to admin panel...",
        });
        navigate('/admin');
        return;
      }
      setToken(res.session.access_token);
      setUserProfile(res.user);
      setIsLoggedIn(true);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.register(registerForm.email, registerForm.password, registerForm.name);
      setToken(res.session.access_token);
      setUserProfile(res.user);
      setIsLoggedIn(true);
      toast({
        title: "Account created!",
        description: "Welcome to Sparkle Bangles.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred during registration.";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setUserProfile(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await authAPI.updateProfile(editProfileData);
      setUserProfile(updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not update profile.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData({ ...editProfileData, avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = () => {
    setEditProfileData({
      display_name: userProfile?.display_name || '',
      avatar_url: userProfile?.avatar_url || '',
    });
    setIsEditing(true);
    setActiveTab('settings');
  };

  if (!isLoggedIn) {
    return (
      <>
        <SEO title="Login / Register" />

        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-md px-4">
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-bold mb-2">Welcome</h1>
                <p className="font-sans text-muted-foreground">
                  Sign in to your account or create a new one
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-soft">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 overflow-x-auto sm:overflow-visible">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, password: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          className="font-sans text-sm text-primary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-name"
                            placeholder="John Doe"
                            className="pl-10"
                            value={registerForm.name}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, name: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="pl-10"
                            value={registerForm.phone}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, phone: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={registerForm.password}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, password: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-confirm"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={registerForm.confirmPassword}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="My Dashboard" />

      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full gradient-gold p-1 shadow-gold">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-primary" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  Welcome back, {userProfile?.display_name || 'Customer'}!
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {userProfile?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-xl font-bold">{dashboardData?.orders?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wishlist</p>
                <p className="text-xl font-bold">{dashboardData?.user?.wishlist?.length || 0}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cart Items</p>
                <p className="text-xl font-bold">{dashboardData?.user?.cart?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden lg:sticky lg:top-24">
                <div className="p-4 border-b bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">Dashboard Menu</h3>
                </div>
                <div className="p-2 space-y-1">
                  {[
                    { id: 'dashboard', label: 'Summary', icon: Settings },
                    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    { id: 'settings', label: 'Account Settings', icon: User },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                        activeTab === item.id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === item.id ? 'translate-x-1' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border shadow-sm min-h-[500px]">
                {activeTab === 'dashboard' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                    {isLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                      <div className="space-y-6">
                        {/* Recent Order */}
                        <div className="border rounded-xl p-4">
                          <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Latest Order
                          </h3>
                          {dashboardData?.orders?.[0] ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-lg">Order #{dashboardData.orders[0]._id.slice(-6)}</p>
                                <p className="text-sm text-muted-foreground">{new Date(dashboardData.orders[0].created_at).toLocaleDateString()}</p>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                                {dashboardData.orders[0].status}
                              </span>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm italic">No recent orders found.</p>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Link to="/categories/women" className="group p-4 border rounded-xl hover:border-primary transition-colors">
                            <h3 className="font-medium group-hover:text-primary transition-colors">Continue Shopping</h3>
                            <p className="text-sm text-muted-foreground">Browse our latest collections</p>
                          </Link>
                          <button onClick={() => setActiveTab('settings')} className="text-left group p-4 border rounded-xl hover:border-primary transition-colors">
                            <h3 className="font-medium group-hover:text-primary transition-colors">Update Profile</h3>
                            <p className="text-sm text-muted-foreground">Manage your personal information</p>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Order History</h2>
                    {isLoading ? (
                       <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
                    ) : dashboardData?.orders?.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.orders.map((order) => (
                          <div key={order._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap justify-between gap-4 mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Order ID</p>
                                <p className="font-medium">#{order._id}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Date</p>
                                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total</p>
                                <p className="font-bold text-primary">LKR {order.total_amount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Status</p>
                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {order.delivery_address}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">You haven't placed any orders yet.</p>
                        <Link to="/"><Button variant="gold" className="mt-4">Start Shopping</Button></Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
                    {isLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
                    ) : dashboardData?.user?.wishlist?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {dashboardData.user.wishlist.map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Your wishlist is empty.</p>
                        <Link to="/"><Button variant="gold" className="mt-4">Explore Products</Button></Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                    <div className="max-w-xl">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Display Name</Label>
                          <Input
                            id="edit-name"
                            placeholder="Your Name"
                            value={editProfileData.display_name}
                            onChange={(e) => setEditProfileData({ ...editProfileData, display_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label>Profile Picture</Label>
                          <div className="flex items-center gap-6 p-4 border rounded-xl bg-gray-50">
                            <div className="h-20 w-20 rounded-full bg-white border-2 border-primary/20 overflow-hidden shadow-inner flex items-center justify-center relative group">
                              {editProfileData.avatar_url ? (
                                <img src={editProfileData.avatar_url} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-10 w-10 text-gray-300" />
                              )}
                              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <Camera className="h-6 w-6 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                              </label>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">Upload a new photo</p>
                              <p className="text-xs text-muted-foreground mb-3">JPG, PNG or GIF. Max size 2MB.</p>
                              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                Select File
                                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-avatar">Or use an Image URL</Label>
                          <Input
                            id="edit-avatar"
                            placeholder="https://example.com/avatar.jpg"
                            value={editProfileData.avatar_url}
                            onChange={(e) => setEditProfileData({ ...editProfileData, avatar_url: e.target.value })}
                          />
                        </div>
                        <Button type="submit" variant="gold" className="px-8 shadow-gold" disabled={isLoading}>
                          {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                          Save Profile Changes
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Profile;
