import { useState } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [error, setError] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate(); // --- CHANGE: Add useNavigate hook ---
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    // This part is fine, it prevents logged-in users from seeing the login page
    return <Navigate to={from} replace />;
  }

  // --- CHANGE: Updated onSubmit function with explicit navigation ---
  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const loggedInUser = await login(data.email, data.password);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      
      // Explicitly navigate based on the user's role
      if (loggedInUser && !loggedInUser.role) {
        navigate('/select-role', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/AgriGro-Logo.png" 
            alt="AgriGrow Logo" 
            className="w-16 h-16 mx-auto mb-4" 
          />
          <h1 className="text-3xl font-bold text-primary">AgriGrow</h1>
          <p className="text-muted-foreground mt-2">Connect with the farming community</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader><CardTitle>Welcome back</CardTitle><CardDescription>Sign in to your account to continue</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" autoComplete="off" {...register('email', { required: 'Email is required' })}/>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter password" autoComplete="off" {...register('password', { required: 'Password is required' })}/>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-glow" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">Don't have an account?{' '}<Link to="/auth/register" className="text-primary hover:underline font-medium">Sign up</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;