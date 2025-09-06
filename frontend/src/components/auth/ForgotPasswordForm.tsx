import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps { onSwitchToLogin: () => void; }

export const ForgotPasswordForm = ({ onSwitchToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 animate-fade-in-scale">
        <div className="w-16 h-16 mx-auto bg-gradient-secondary rounded-full flex items-center justify-center animate-pulse-glow"><Mail className="h-8 w-8 text-secondary-foreground" /></div>
        <div><h2 className="text-3xl font-bold bg-gradient-nature bg-clip-text text-transparent mb-2">Check Your Email</h2><p className="text-muted-foreground">Password recovery instructions sent to <br /><span className="font-medium text-foreground">{email}</span></p></div>
        <button onClick={onSwitchToLogin} className="flex items-center justify-center gap-2 text-primary hover:text-primary-glow font-medium w-full"><ArrowLeft className="h-4 w-4" />Back to Login</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-in-bottom">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-nature bg-clip-text text-transparent mb-2">Reset Password</h2>
        <p className="text-muted-foreground">We'll send you a link to reset your password</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email Address</Label>
        <div className="relative"><Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="input-nature pl-11" required /></div>
      </div>
      <Button type="submit" className="btn-nature w-full">Send Reset Link</Button>
      <div className="text-center">
        <button type="button" onClick={onSwitchToLogin} className="flex items-center justify-center gap-2 text-primary hover:text-primary-glow font-medium w-full"><ArrowLeft className="h-4 w-4" />Back to Login</button>
      </div>
    </form>
  );
};