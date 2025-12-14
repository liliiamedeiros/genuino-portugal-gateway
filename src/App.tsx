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
import { ChatWidget } from "@/components/ChatWidget";
import { CarModeWrapper } from "@/components/CarModeWrapper";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import Properties from "./pages/Properties";
import ProjectDetail from "./pages/ProjectDetail";
import Vision from "./pages/Vision";
import Investors from "./pages/Investors";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import Disputes from "./pages/Disputes";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminProperties from "./pages/admin/Properties";
import PropertyForm from "./pages/admin/PropertyForm";
import Users from "./pages/admin/Users";
import Clients from "./pages/admin/Clients";
import ClientDetail from "./pages/admin/ClientDetail";
import Appointments from "./pages/admin/Appointments";
import Newsletter from "./pages/admin/Newsletter";
import NewCampaign from "./pages/admin/NewCampaign";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import JsonLdValidator from "./pages/admin/JsonLdValidator";
import JsonLdSystem from "./pages/admin/JsonLdSystem";
import ImageConverter from "./pages/admin/ImageConverter";
import ImageManager from "./pages/admin/ImageManager";
import MigrateProjects from "./pages/admin/MigrateProjects";
import MenuManager from "./pages/admin/MenuManager";
import PortfolioList from "./pages/admin/PortfolioList";
import PortfolioForm from "./pages/admin/PortfolioForm";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <CarModeWrapper>
                <OrganizationSchema />
                <PWAInstallPrompt />
                <Toaster />
                <Sonner />
                <ChatWidget />
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
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:id" element={<PortfolioDetail />} />
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

              <Route path="*" element={
                <>
                  <Navbar />
                  <NotFound />
                  <Footer />
                </>
              } />
            </Routes>
              </CarModeWrapper>
          </TooltipProvider>
        </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
</QueryClientProvider>
  );
};

export default App;
