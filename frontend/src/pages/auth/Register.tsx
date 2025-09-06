import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';
import { AuthBrandingPanel } from '@/components/common/AuthBrandingPanel';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
}

const Register = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const password = watch('password');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, location: data.location });
      navigate('/select-role'); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthBrandingPanel />
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <img src="/AgriGro-Logo.png" alt="AgriGrow Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AgriGrow</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
            <p className="text-muted-foreground">Join the AgriGrow community today</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative"><User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" /><Input id="name" placeholder="Ravi Kumar" {...register('name', { required: 'Name is required' })} /></div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative"><MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" /><Input id="location" placeholder="Punjab, India" {...register('location', { required: 'Location is required' })} /></div>
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative"><Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" /><Input id="email" type="email" placeholder="your.email@example.com" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })} /></div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Must be at least 6 characters' } })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative"><Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" /><Input id="confirmPassword" type="password" placeholder="Confirm password" {...register('confirmPassword', { required: 'Please confirm password', validate: value => value === password || 'Passwords do not match' })} /></div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
          </form>
          <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div></div>
          <div className="text-center">
            <Link to="/auth/login" className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                Already have an account? <span className="text-primary font-medium">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;