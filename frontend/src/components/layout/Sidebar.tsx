import { Home, Users, ShoppingBag, CloudSun, TrendingUp, Sparkles, Wallet, Stethoscope, History, Wrench, Map } from 'lucide-react';
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
  { name: 'Interactive Map', href: '/interactive-map', icon: Map },
];
const marketplaceNav = { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag };
const farmerExpenseNav = { name: 'Farm Finances', href: '/farmer-expenses', icon: Wallet };
const buyerExpenseNav = { name: 'Business Finances', href: '/buyer-expenses', icon: Wallet };
const expertExpenseNav = { name: 'Earnings & Expenses', href: '/expert-expenses', icon: Wallet };
const expertHistoryNav = { name: 'Consultation History', href: '/consultation-history', icon: History };
const serviceProviderDashboardNav = { name: 'Service Dashboard', href: '/service-provider-dashboard', icon: Wrench };
const offerServiceNav = { name: 'Offer Service', href: '/offer-service', icon: Wrench };

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user } = useAuth();

  const filteredBaseNavigation =
    user?.role === 'serviceProvider'
      ? baseNavigation.filter(
          (item) =>
            !['AI Assistant', 'Crop Doctor', 'Market Prices'].includes(item.name)
        )
      : baseNavigation;

  const navigation = [
    homeNav,
    ...filteredBaseNavigation,
    ...(user?.role === 'farmer' || user?.role === 'buyer' ? [marketplaceNav] : []),
    ...(user?.role === 'farmer' ? [farmerExpenseNav] : []),
    ...(user?.role === 'buyer' ? [buyerExpenseNav] : []),
    ...(user?.role === 'expert' ? [expertExpenseNav, expertHistoryNav] : []),
    ...(user?.role === 'serviceProvider' ? [serviceProviderDashboardNav, offerServiceNav] : []),
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