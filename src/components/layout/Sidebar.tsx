import { Home, Users, ShoppingBag, CloudSun, TrendingUp, Sparkles, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const baseNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Feed', href: '/feed', icon: Users },
  { name: 'Weather', href: '/weather', icon: CloudSun },
  { name: 'Market Prices', href: '/market-prices', icon: TrendingUp },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
  { name: 'Expense Tracker', href: '/expense-tracker', icon: Wallet },
];

const marketplaceNav = { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag };

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user } = useAuth();

  // Conditionally build the navigation list based on user role
  const navigation = [
    ...baseNavigation,
    ...(user?.role === 'farmer' || user?.role === 'buyer' ? [marketplaceNav] : [])
  ].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically for consistent order

  return (
    <div className={cn('flex flex-col h-full bg-card border-r border-border', className)}>
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full">
          Create Post
        </Button>
      </div>
    </div>
  );
};