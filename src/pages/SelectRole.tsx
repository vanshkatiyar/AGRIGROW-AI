import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Sprout, ShoppingCart, GraduationCap } from 'lucide-react';

const SelectRole = () => {
  const navigate = useNavigate();
  const { updateUserRole, user } = useAuth();

  const handleRoleSelect = (role: 'farmer' | 'buyer' | 'expert') => {
    updateUserRole(role);

    // Redirect to the appropriate dashboard
    switch (role) {
      case 'farmer':
        navigate('/farmer-dashboard');
        break;
      case 'buyer':
        navigate('/buyer-dashboard');
        break;
      case 'expert':
        navigate('/expert-dashboard');
        break;
      default:
        navigate('/'); // Fallback to home
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          To personalize your experience, please tell us who you are.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => handleRoleSelect('farmer')}
          >
            <CardHeader className="items-center">
              <Sprout className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>I am a Farmer</CardTitle>
              <CardDescription>I grow crops and want to sell my produce and connect with the community.</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => handleRoleSelect('buyer')}
          >
            <CardHeader className="items-center">
              <ShoppingCart className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>I am a Buyer</CardTitle>
              <CardDescription>I am looking to source fresh agricultural products directly from farmers.</CardDescription>
            </CardHeader>
          </Card>
          
          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => handleRoleSelect('expert')}
          >
            <CardHeader className="items-center">
              <GraduationCap className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>I am an Expert</CardTitle>
              <CardDescription>I am an agricultural scientist or consultant offering my expertise.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;