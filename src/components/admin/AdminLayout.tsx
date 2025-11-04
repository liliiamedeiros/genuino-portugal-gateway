import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  ChevronRight,
  ChevronDown
} from 'lucide-react';
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
    { icon: Users, label: 'Gestão de Clientes', path: '/admin/clients', disabled: true },
    { icon: Calendar, label: 'Agendamentos', path: '/admin/appointments', disabled: true },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/reports', disabled: true },
    { 
      icon: Settings, 
      label: 'Configurações', 
      path: '/admin/settings',
      submenu: [
        { label: 'Gerais', path: '/admin/settings/general' },
        { label: 'Sobre', path: '/admin/settings/about' },
        { label: 'Serviços', path: '/admin/settings/services' },
        { label: 'Portfólio', path: '/admin/settings/portfolio' },
        { label: 'Visão', path: '/admin/settings/vision' },
        { label: 'Investidores', path: '/admin/settings/investors' },
        { label: 'Contacto', path: '/admin/settings/contact' },
      ]
    },
    { icon: Users, label: 'Usuários', path: '/admin/users', adminOnly: true },
    { icon: Mail, label: 'Newsletter', path: '/admin/newsletter', disabled: true },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    menuItems.find(item => item.submenu?.some(sub => location.pathname.startsWith(sub.path)))?.path || null
  );

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
            const disabled = item.disabled || (item.adminOnly && userRole !== 'admin');
            
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

            if (item.submenu) {
              const isSubmenuActive = item.submenu.some(sub => location.pathname.startsWith(sub.path));
              const isOpen = openSubmenu === item.path;

              return (
                <Collapsible
                  key={item.path}
                  open={isOpen}
                  onOpenChange={(open) => setOpenSubmenu(open ? item.path : null)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isSubmenuActive ? 'bg-muted' : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="text-sm flex-1 text-left">{item.label}</span>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  {sidebarOpen && (
                    <CollapsibleContent className="pl-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            location.pathname === subItem.path
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>
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
              <p className="text-muted-foreground capitalize">{userRole}</p>
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
