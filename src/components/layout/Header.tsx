import { Bell, Search, Menu, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>

          {/* --- THIS BLOCK IS REPLACED --- */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/AgriGro-Logo.png" 
              alt="AgriGrow Logo" 
              className="h-8 w-auto" // Controls the height, width adjusts automatically
            />
            <h1 className="text-xl font-bold text-primary hidden sm:block">AgriGrow</h1>
          </Link>
          {/* --- END OF REPLACEMENT --- */}

        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search..." className="pl-10 bg-background" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon"><Link to="/messages"><MessageCircle className="h-5 w-5" /></Link></Button>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/notifications">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8"><AvatarImage src={user?.profileImage} alt={user?.name} /><AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0)}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">{user?.name}</p><p className="text-xs leading-none text-muted-foreground">{user?.email}</p></div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/profile/${user?.id}`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};