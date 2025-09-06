import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { AuthBrandingPanel } from '@/components/common/AuthBrandingPanel';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const loggedInUser = await login(data.email, data.password);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      
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
    <div className="min-h-screen flex">
      <AuthBrandingPanel />

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <img src="/AgriGro-Logo.png" alt="AgriGrow Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AgriGrow</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your AgriGrow account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="your.email@example.com" {...register('email', { required: 'Email is required' })}/>
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" {...register('password', { required: 'Password is required' })}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div className="text-right">
                <button
                    type="button"
                    onClick={() => navigate('/auth/forgot-password')}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    Forgot Password?
                </button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In'}</Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <div className="text-center">
            <button onClick={() => navigate('/auth/register')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              Don't have an account? <span className="text-primary font-medium">Sign up</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;