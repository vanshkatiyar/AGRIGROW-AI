import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

interface ILoginForm {
  email: string;
  password: string;
}

export const LoginForm = ({ onSwitchToRegister, onSwitchToForgot }: LoginFormProps) => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<ILoginForm>();

  const onSubmit = async (data: ILoginForm) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in-scale">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-nature bg-clip-text text-transparent mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to your AgriGrow account</p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative"><Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input id="email" type="email" placeholder="your.email@example.com" className="input-nature pl-11" {...register('email', { required: 'Email is required' })}/></div>
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="input-nature pl-11 pr-11" {...register('password', { required: 'Password is required' })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><span className="sr-only">Toggle password visibility</span>{showPassword ? <EyeOff /> : <Eye />}</button>
          </div>
          {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
        </div>
      </div>

      <Button type="submit" className="btn-nature w-full" disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</Button>
      
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onSwitchToForgot} className="text-primary hover:text-primary-glow font-medium">Forgot password?</button>
        <button type="button" onClick={onSwitchToRegister} className="text-muted-foreground hover:text-foreground">Create account</button>
      </div>
    </form>
  );
};