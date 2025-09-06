import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';
import { AuthBrandingPanel } from '@/components/common/AuthBrandingPanel';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Email address is required.');
      return;
    }
    setIsLoading(true);

    // --- In a real app, you would make an API call here ---
    // For now, we'll just simulate a successful request.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast({
      title: "Password Reset Email Sent",
      description: "If an account exists for this email, you will receive reset instructions.",
    });
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h2>
            <p className="text-muted-foreground">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;