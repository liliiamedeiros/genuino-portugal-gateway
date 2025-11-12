import { ReactNode } from 'react';
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
  X
} from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, user, userRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Building2, label: 'Gestão de Imóveis', path: '/admin/properties' },
    { icon: Users, label: 'Gestão de Clientes', path: '/admin/clients' },
    { icon: Calendar, label: 'Agendamentos', path: '/admin/appointments' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
    { icon: Users, label: 'Usuários', path: '/admin/users', adminOnly: true },
    { icon: Mail, label: 'Newsletter', path: '/admin/newsletter' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-card border-r transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen && <img src={logo} alt="Logo" className="h-8" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const disabled = item.adminOnly && userRole !== 'admin' && userRole !== 'super_admin';
            
            if (disabled) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground opacity-50 cursor-not-allowed"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t">
          {sidebarOpen && (
            <div className="mb-2 text-sm">
              <p className="font-medium truncate">{user?.email}</p>
              <p className="text-muted-foreground capitalize">
                {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Administrador' : 'Editor'}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Sair'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
