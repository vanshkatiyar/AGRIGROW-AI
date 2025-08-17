import { Home, Users, ShoppingBag, CloudSun, HelpCircle, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Feed', href: '/feed', icon: Users },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Weather', href: '/weather', icon: CloudSun },
  { name: 'Q&A Hub', href: '/qa', icon: HelpCircle },
  { name: 'Market Prices', href: '/market-prices', icon: TrendingUp },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
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