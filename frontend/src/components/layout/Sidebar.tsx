import { Home, Users, ShoppingBag, CloudSun, TrendingUp, Sparkles, Wallet, Stethoscope } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const homeNav = { name: 'Home', href: '/', icon: Home };
const baseNavigation = [
  { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
  { name: 'Crop Doctor', href: '/crop-doctor', icon: Stethoscope },
  { name: 'Feed', href: '/feed', icon: Users },
  { name: 'Market Prices', href: '/market-prices', icon: TrendingUp },
  { name: 'Weather', href: '/weather', icon: CloudSun },
];
const marketplaceNav = { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag };
const farmerExpenseNav = { name: 'Farm Finances', href: '/farmer-expenses', icon: Wallet };
const buyerExpenseNav = { name: 'Business Finances', href: '/buyer-expenses', icon: Wallet };
const expertExpenseNav = { name: 'Earnings & Expenses', href: '/expert-expenses', icon: Wallet };

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user } = useAuth();

  const navigation = [
    homeNav,
    ...baseNavigation,
    ...(user?.role === 'farmer' || user?.role === 'buyer' ? [marketplaceNav] : []),
    ...(user?.role === 'farmer' ? [farmerExpenseNav] : []),
    ...(user?.role === 'buyer' ? [buyerExpenseNav] : []),
    ...(user?.role === 'expert' ? [expertExpenseNav] : []),
  ].sort((a, b) => {
    if (a.name === 'Home') return -1;
    if (b.name === 'Home') return 1;
    return a.name.localeCompare(b.name);
  });

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
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};