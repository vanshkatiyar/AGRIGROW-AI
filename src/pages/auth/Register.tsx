import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
}

const Register = () => {
  const [error, setError] = useState('');
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const password = watch('password');

  // If user is already logged in, they shouldn't be on this page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        location: data.location,
      });
      // On success, the AuthProvider handles setting the user and token.
      // We can now redirect to the next step.
      navigate('/select-role'); 
    } catch (err: any) {
      // Catch errors from the backend (e.g., "Email already in use")
      // and display them to the user.
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <p className="text-muted-foreground mt-2">Join the farming community</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Step 1: Basic Information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Ravi Kumar" 
                    {...register('name', { required: 'Name is required' })} 
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Punjab, India" 
                    {...register('location', { required: 'Location is required' })} 
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  {...register('email', { 
                    required: 'Email is required', 
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } 
                  })} 
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Create password" 
                    {...register('password', { 
                      required: 'Password is required', 
                      minLength: { value: 6, message: 'Password must be at least 6 characters' } 
                    })} 
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm password" 
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password', 
                      validate: value => value === password || 'Passwords do not match' 
                    })} 
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-glow" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Continue'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;