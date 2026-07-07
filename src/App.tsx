import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy, useEffect } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
