import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 h-full w-64 z-50">
              <Sidebar />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 min-h-[calc(100vh-4rem)]',
          'md:ml-0' // No margin on desktop since sidebar is positioned
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};