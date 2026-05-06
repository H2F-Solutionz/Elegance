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
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md bg-card rounded-xl p-8 shadow-soft">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground text-sm mt-2">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
