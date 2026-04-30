import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy, useEffect } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ChatWidget } from "@/components/ChatWidget";
import { CarModeWrapper } from "@/components/CarModeWrapper";
import { ResponsiveDebugPanel } from "@/components/ResponsiveDebugPanel";
import { installSeoAuditWatcher } from "@/utils/seoAudit";
import Home from "./pages/Home";

// Lazy-loaded public pages (code-splitting per route)
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const PortfolioDetail = lazy(() => import("./pages/PortfolioDetail"));
const Properties = lazy(() => import("./pages/Properties"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Vision = lazy(() => import("./pages/Vision"));
const Investors = lazy(() => import("./pages/Investors"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disputes = lazy(() => import("./pages/Disputes"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SeoDebug = lazy(() => import("./pages/SeoDebug"));

// Lazy-loaded admin pages (separate bundle - not loaded for public visitors)
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProperties = lazy(() => import("./pages/admin/Properties"));
const PropertyForm = lazy(() => import("./pages/admin/PropertyForm"));
const Users = lazy(() => import("./pages/admin/Users"));
const Clients = lazy(() => import("./pages/admin/Clients"));
const ClientDetail = lazy(() => import("./pages/admin/ClientDetail"));
const Appointments = lazy(() => import("./pages/admin/Appointments"));
const Newsletter = lazy(() => import("./pages/admin/Newsletter"));
const NewCampaign = lazy(() => import("./pages/admin/NewCampaign"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const JsonLdValidator = lazy(() => import("./pages/admin/JsonLdValidator"));
const JsonLdSystem = lazy(() => import("./pages/admin/JsonLdSystem"));
const ImageConverter = lazy(() => import("./pages/admin/ImageConverter"));
const ImageManager = lazy(() => import("./pages/admin/ImageManager"));
const MigrateProjects = lazy(() => import("./pages/admin/MigrateProjects"));
const MenuManager = lazy(() => import("./pages/admin/MenuManager"));
const PortfolioList = lazy(() => import("./pages/admin/PortfolioList"));
const PortfolioForm = lazy(() => import("./pages/admin/PortfolioForm"));
const AuditLogPage = lazy(() => import("./pages/admin/AuditLogPage"));
const SeoGeo = lazy(() => import("./pages/admin/SeoGeo"));
const SeoChecklist = lazy(() => import("./pages/admin/SeoChecklist"));
const SeoConfig = lazy(() => import("./pages/admin/SeoConfig"));
const SeoHistory = lazy(() => import("./pages/admin/SeoHistory"));
const SeoGeoModule = lazy(() => import("./pages/admin/SeoGeoModule"));
const SeoTools = lazy(() => import("./pages/admin/SeoTools"));
const ResponsiveAudit = lazy(() => import("./pages/admin/ResponsiveAudit"));
const ResponsiveAuditHistory = lazy(() => import("./pages/admin/ResponsiveAuditHistory"));
const SeoGooglebotAudit = lazy(() => import("./pages/admin/SeoGooglebotAudit"));

// Loading fallback shown while route chunks are fetched
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    installSeoAuditWatcher();
  }, []);
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <CarModeWrapper>
                  <OrganizationSchema />
                  <DynamicFavicon />
                  <PWAInstallPrompt />
                  <Toaster />
                  <Sonner />
                  <ChatWidget />
                  <Suspense fallback={<RouteLoader />}>
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
              <Route path="/portfolio/:id" element={
                <>
                  <Navbar />
                  <PortfolioDetail />
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
              <Route path="/seo-debug" element={
                <>
                  <Navbar />
                  <SeoDebug />
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
              <ProtectedRoute requiredRole="admin">
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
            <Route path="/admin/image-manager" element={
              <ProtectedRoute requiredRole="admin">
                <ImageManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/responsive-audit" element={
              <ProtectedRoute requiredRole="admin">
                <ResponsiveAudit />
              </ProtectedRoute>
            } />
            <Route path="/admin/responsive-audit-history" element={
              <ProtectedRoute requiredRole="admin">
                <ResponsiveAuditHistory />
              </ProtectedRoute>
            } />
            <Route path="/admin/migrate-projects" element={
              <ProtectedRoute requiredRole="admin">
                <MigrateProjects />
              </ProtectedRoute>
            } />
            <Route path="/admin/menus" element={
              <ProtectedRoute requiredRole="admin">
                <MenuManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/portfolio" element={
              <ProtectedRoute requiredRole="editor">
                <PortfolioList />
              </ProtectedRoute>
            } />
            <Route path="/admin/portfolio/new" element={
              <ProtectedRoute requiredRole="editor">
                <PortfolioForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/portfolio/edit/:id" element={
              <ProtectedRoute requiredRole="editor">
                <PortfolioForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute requiredRole="super_admin">
                <AuditLogPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/seo" element={
              <ProtectedRoute requiredRole="admin">
                <SeoGeo />
              </ProtectedRoute>
            } />
            <Route path="/admin/seo/checklist" element={
              <ProtectedRoute requiredRole="admin">
                <SeoChecklist />
              </ProtectedRoute>
            } />
            <Route path="/admin/seo/config" element={
              <ProtectedRoute requiredRole="admin">
                <SeoConfig />
              </ProtectedRoute>
            } />
            <Route path="/admin/seo/history" element={
              <ProtectedRoute requiredRole="admin">
                <SeoHistory />
              </ProtectedRoute>
            } />
            <Route path="/admin/seo/geo" element={
              <ProtectedRoute requiredRole="admin">
                <SeoGeoModule />
              </ProtectedRoute>
            } />
            <Route path="/admin/seo/tools" element={
              <ProtectedRoute requiredRole="admin">
                <SeoTools />
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
                </CarModeWrapper>
                <ResponsiveDebugPanel />
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
