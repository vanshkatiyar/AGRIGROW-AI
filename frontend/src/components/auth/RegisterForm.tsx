import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface RegisterFormProps { onSwitchToLogin: () => void; }
interface IRegisterForm { name: string; email: string; password: string; confirmPassword: string; location: string; }

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<IRegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: IRegisterForm) => {
    setError('');
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, location: data.location });
      navigate('/select-role');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-slide-in-bottom">
      <div className="text-center"><h2 className="text-3xl font-bold bg-gradient-nature bg-clip-text text-transparent mb-2">Join the Community</h2><p className="text-muted-foreground">Create your AgriGrow account</p></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative"><User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input id="name" placeholder="Ravi Kumar" className="input-nature pl-11" {...register('name', { required: 'Name is required' })} /></div>
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative"><Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input id="email" type="email" placeholder="your.email@example.com" className="input-nature pl-11" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} /></div>
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative"><Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" className="input-nature pl-11 pr-11" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be 6+ characters' } })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff /> : <Eye />}</button></div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative"><Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input id="confirmPassword" type="password" placeholder="Confirm password" className="input-nature pl-11" {...register('confirmPassword', { required: 'Please confirm password', validate: value => value === password || 'Passwords do not match' })} /></div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="btn-nature w-full" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
      <div className="text-center text-sm"><span className="text-muted-foreground">Already have an account? </span><button type="button" onClick={onSwitchToLogin} className="text-primary hover:text-primary-glow font-medium">Sign in</button></div>
    </form>
  );
};