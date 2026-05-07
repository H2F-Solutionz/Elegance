import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { authAPI, setToken } from '@/lib/api';
import { Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const AdminRoute: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await authAPI.me();
        if (user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authAPI.login(loginForm.email, loginForm.password);
      if (res.user.role === 'admin') {
        setToken(res.session.access_token);
        setIsAdmin(true);
        toast({ title: "Admin Login Successful" });
      } else {
        toast({ title: "Access Denied", description: "You do not have admin privileges.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'bg\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:rgb(253,245,247);stop-opacity:1\' /%3E%3Cstop offset=\'50%25\' style=\'stop-color:rgb(255,255,255);stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:rgb(245,243,255);stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23bg)\' /%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'30\' fill=\'none\' stroke=\'%23d4a574\' stroke-width=\'0.5\' opacity=\'0.3\' /%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'20\' fill=\'none\' stroke=\'%23d4a574\' stroke-width=\'0.5\' opacity=\'0.2\' /%3E%3Cpath d=\'M 30 30 Q 40 20 50 30 T 70 30\' fill=\'none\' stroke=\'%23d4a574\' stroke-width=\'0.8\' opacity=\'0.15\' /%3E%3Cpath d=\'M 30 70 Q 40 80 50 70 T 70 70\' fill=\'none\' stroke=\'%23d4a574\' stroke-width=\'0.8\' opacity=\'0.15\' /%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
      }}>
        <div className="w-full max-w-md bg-card rounded-xl p-6 sm:p-8 shadow-soft mx-4 sm:mx-0">
          <div className="text-center mb-6 sm:mb-8">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Lock className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-2">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-10"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="gold" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
