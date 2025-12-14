import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Mail,
  LogOut,
  Menu,
  X,
  FileJson,
  CheckCircle,
  ImageIcon,
  FolderOpen
} from 'lucide-react';
import logo from '@/assets/logo.png';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, user, userRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-collapse sidebar on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Building2, label: 'Gestão de Imóveis', path: '/admin/properties' },
    { icon: FolderOpen, label: 'Portfolio', path: '/admin/portfolio' },
    { icon: Users, label: 'Gestão de Clientes', path: '/admin/clients' },
    { icon: Calendar, label: 'Agendamentos', path: '/admin/appointments' },
    { icon: ImageIcon, label: 'Conversor de Imagens', path: '/admin/image-converter', adminOnly: true },
    { icon: ImageIcon, label: 'Gestor de Imagens', path: '/admin/image-manager', superAdminOnly: true },
    { icon: Menu, label: 'Gestão de Menus', path: '/admin/menus', adminOnly: true },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/reports', adminOnly: true },
    { icon: FileJson, label: 'Sistema-JSON_LD', path: '/admin/json-ld-system', adminOnly: true },
    { icon: CheckCircle, label: 'Validador-JSON_LD', path: '/admin/json-ld-validator', adminOnly: true },
    { icon: Mail, label: 'Newsletter', path: '/admin/newsletter', adminOnly: true },
    { icon: Settings, label: 'Configurações', path: '/admin/settings', adminOnly: true },
    { icon: Users, label: 'Usuários', path: '/admin/users', adminOnly: true },
  ];

  // Filter menus based on role - hide admin-only and super-admin-only items
  const visibleMenuItems = menuItems.filter(item => {
    // Hide superAdminOnly items for non-super_admins
    if (item.superAdminOnly && userRole !== 'super_admin') {
      return false;
    }
    // Hide adminOnly items for editors
    if (item.adminOnly && userRole === 'editor') {
      return false;
    }
    return true;
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64 3xl:w-72 4xl:w-80' : 'w-0 lg:w-16 3xl:w-20'
        } ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
        bg-card border-r transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-16 3xl:h-20 4xl:h-24 flex items-center justify-between px-4 border-b shrink-0">
          {sidebarOpen && <img src={logo} alt="Logo" className="h-8 3xl:h-10 4xl:h-12" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto min-h-touch min-w-touch"
          >
            {sidebarOpen ? <X className="h-4 w-4 3xl:h-5 3xl:w-5" /> : <Menu className="h-4 w-4 3xl:h-5 3xl:w-5" />}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 lg:py-2 3xl:py-3 4xl:py-4 rounded-md transition-colors min-h-touch 3xl:min-h-touch-lg ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5 3xl:h-6 3xl:w-6 4xl:h-7 4xl:w-7 shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm 3xl:text-base 4xl:text-lg truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t shrink-0">
          {sidebarOpen && (
            <div className="mb-2 text-sm 3xl:text-base">
              <p className="font-medium truncate">{user?.email}</p>
              <p className="text-muted-foreground capitalize">
                {userRole === 'editor' ? 'Editor' : 'Administrador'}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full justify-start min-h-touch 3xl:min-h-touch-lg 3xl:text-base"
          >
            <LogOut className="h-4 w-4 3xl:h-5 3xl:w-5 mr-2" />
            {sidebarOpen && 'Sair'}
          </Button>
        </div>
      </aside>

      {/* Mobile header with menu toggle */}
      {isMobile && !sidebarOpen && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b z-30 flex items-center px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="min-h-touch min-w-touch"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src={logo} alt="Logo" className="h-8 ml-3" />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
}
