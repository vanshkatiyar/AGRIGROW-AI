import { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
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
  const { login, isAuthenticated, isLoading, user } = useAuth(); // Get user from auth
  const { toast } = useToast();
  const location = useLocation();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const from = location.state?.from?.pathname || '/';

  // --- CHANGE: Handle redirection after successful login ---
  if (isAuthenticated) {
    // If the user has a role, go to the intended page.
    // If not, redirect to role selection.
    if (user && !user.role) {
      return <Navigate to="/select-role" replace />;
    }
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      // --- CHANGE: Added try/catch block for error handling ---
      await login(data.email, data.password);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // The redirection is now handled by the effect above.
      
    } catch (err: any) {
      // This will now catch errors like "Invalid email or password" from the backend
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">SmartFarm Hub</h1>
          <p className="text-muted-foreground mt-2">Connect with the farming community</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@smartfarm.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password', { 
                    required: 'Password is required',
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;