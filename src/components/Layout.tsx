import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChip } from '@/contexts/ChipContext';
import { Bell, Home, Plus, Settings, User, Menu, X, Sun, Moon, Microchip, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, toggleTheme } = useUser();
  const { signOut } = useAuth();
  const { notifications, markNotificationAsRead } = useChip();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Gerenciar Chips', href: '/chips', icon: Microchip },
    { name: 'Adicionar Chip', href: '/add-chip', icon: Plus },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const NotificationDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-3 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadNotifications.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadNotifications.length} não lida{unreadNotifications.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-l-blue-500' : ''}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex flex-col gap-1 w-full">
                <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{notification.date}</p>
                  <Badge variant={
                    notification.type === 'success' ? 'default' : 
                    notification.type === 'warning' ? 'destructive' : 'secondary'
                  } className="text-xs">
                    {notification.type === 'success' ? '✓' : 
                     notification.type === 'warning' ? '⚠' : 'ℹ'}
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        {notifications.length > 10 && (
          <div className="p-2 text-center border-t">
            <p className="text-sm text-muted-foreground">
              E mais {notifications.length - 10} notificações...
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              Sistema de Gerenciamento
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme}>
          {user.theme === 'light' ? (
            <Moon className="mr-2 h-4 w-4" />
          ) : (
            <Sun className="mr-2 h-4 w-4" />
          )}
          <span>{user.theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <Microchip className="h-5 w-5 text-white" />
              </div>
              <span className="hidden font-bold sm:inline-block text-xl">
                Chip Gestor
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`transition-colors hover:text-foreground/80 flex items-center gap-2 ${
                    isActive(item.href) ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                to="/"
                className="flex items-center space-x-2 mb-6"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Microchip className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">Chip Gestor</span>
              </Link>
              <nav className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 text-lg font-medium transition-colors hover:text-foreground/80 p-2 rounded-md ${
                      isActive(item.href) 
                        ? 'text-foreground bg-accent' 
                        : 'text-foreground/60 hover:bg-accent/50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Link to="/" className="flex items-center space-x-2 md:hidden">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Microchip className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">Chip Gestor</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-2">
              <NotificationDropdown />
              <UserDropdown />
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-4 md:py-6 px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
