import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { NotificationPrompt } from "@/components/NotificationPrompt";

// Lazy load de páginas públicas
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Properties = lazy(() => import('./pages/Properties'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Vision = lazy(() => import('./pages/Vision'));
const Investors = lazy(() => import('./pages/Investors'));
const Contact = lazy(() => import('./pages/Contact'));
const Legal = lazy(() => import('./pages/Legal'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Disputes = lazy(() => import('./pages/Disputes'));
const Install = lazy(() => import('./pages/Install'));
const Chat = lazy(() => import('./pages/Chat'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load de páginas admin (chunk separado)
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('./pages/admin/Properties'));
const PropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const Users = lazy(() => import('./pages/admin/Users'));
const Clients = lazy(() => import('./pages/admin/Clients'));
const ClientDetail = lazy(() => import('./pages/admin/ClientDetail'));
const Appointments = lazy(() => import('./pages/admin/Appointments'));
const Newsletter = lazy(() => import('./pages/admin/Newsletter'));
const NewCampaign = lazy(() => import('./pages/admin/NewCampaign'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const JsonLdValidator = lazy(() => import('./pages/admin/JsonLdValidator'));
const JsonLdSystem = lazy(() => import('./pages/admin/JsonLdSystem'));
const ImageConverter = lazy(() => import('./pages/admin/ImageConverter'));
const NotificationSettings = lazy(() => import('./pages/admin/NotificationSettings'));

// Componente de Loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <OrganizationSchema />
            <PWAInstallPrompt />
            <NotificationPrompt />
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <About />
                  <Footer />
                </>
              } />
              <Route path="/services" element={
                <>
                  <Navbar />
                  <Services />
                  <Footer />
                </>
              } />
              <Route path="/portfolio" element={
                <>
                  <Navbar />
                  <Portfolio />
                  <Footer />
                </>
              } />
              <Route path="/properties" element={
                <>
                  <Navbar />
                  <Properties />
                  <Footer />
                </>
              } />
              <Route path="/project/:id" element={
                <>
                  <Navbar />
                  <ProjectDetail />
                  <Footer />
                </>
              } />
              <Route path="/vision" element={
                <>
                  <Navbar />
                  <Vision />
                  <Footer />
                </>
              } />
              <Route path="/investors" element={
                <>
                  <Navbar />
                  <Investors />
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <Contact />
                  <Footer />
                </>
              } />
              <Route path="/chat" element={
                <>
                  <Navbar />
                  <Chat />
                  <Footer />
                </>
              } />
              <Route path="/legal" element={
                <>
                  <Navbar />
                  <Legal />
                  <Footer />
                </>
              } />
              <Route path="/privacy" element={
                <>
                  <Navbar />
                  <Privacy />
                  <Footer />
                </>
              } />
              <Route path="/disputes" element={
                <>
                  <Navbar />
                  <Disputes />
                  <Footer />
                </>
              } />
              <Route path="/install" element={
                <>
                  <Navbar />
                  <Install />
                  <Footer />
                </>
              } />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/properties" element={
                <ProtectedRoute>
                  <AdminProperties />
                </ProtectedRoute>
              } />
              <Route path="/admin/properties/new" element={
                <ProtectedRoute>
                  <PropertyForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/properties/edit/:id" element={
                <ProtectedRoute>
                  <PropertyForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>
              } />
            <Route path="/admin/clients" element={
              <ProtectedRoute requiredRole="editor">
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients/:id" element={
              <ProtectedRoute requiredRole="editor">
                <ClientDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/appointments" element={
              <ProtectedRoute requiredRole="editor">
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/admin/newsletter" element={
              <ProtectedRoute requiredRole="editor">
                <Newsletter />
              </ProtectedRoute>
            } />
            <Route path="/admin/newsletter/new" element={
              <ProtectedRoute requiredRole="editor">
                <NewCampaign />
              </ProtectedRoute>
            } />
            <Route path="/admin/newsletter/edit/:id" element={
              <ProtectedRoute requiredRole="editor">
                <NewCampaign />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute requiredRole="editor">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="editor">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/admin/json-ld-validator" element={
              <ProtectedRoute requiredRole="editor">
                <JsonLdValidator />
              </ProtectedRoute>
            } />
            <Route path="/admin/json-ld-system" element={
              <ProtectedRoute requiredRole="editor">
                <JsonLdSystem />
              </ProtectedRoute>
            } />
            <Route path="/admin/image-converter" element={
              <ProtectedRoute requiredRole="editor">
                <ImageConverter />
              </ProtectedRoute>
            } />

              <Route path="/admin/notification-settings" element={
                <ProtectedRoute requiredRole="editor">
                  <NotificationSettings />
                </ProtectedRoute>
              } />

              <Route path="*" element={
                <>
                  <Navbar />
                  <NotFound />
                  <Footer />
                </>
              } />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
