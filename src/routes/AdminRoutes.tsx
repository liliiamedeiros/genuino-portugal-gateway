import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";

const Login = lazy(() => import("@/pages/admin/Login"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProperties = lazy(() => import("@/pages/admin/Properties"));
const PropertyForm = lazy(() => import("@/pages/admin/PropertyForm"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Clients = lazy(() => import("@/pages/admin/Clients"));
const ClientDetail = lazy(() => import("@/pages/admin/ClientDetail"));
const Appointments = lazy(() => import("@/pages/admin/Appointments"));
const Newsletter = lazy(() => import("@/pages/admin/Newsletter"));
const NewCampaign = lazy(() => import("@/pages/admin/NewCampaign"));
const Reports = lazy(() => import("@/pages/admin/Reports"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const JsonLdValidator = lazy(() => import("@/pages/admin/JsonLdValidator"));
const JsonLdSystem = lazy(() => import("@/pages/admin/JsonLdSystem"));
const ImageConverter = lazy(() => import("@/pages/admin/ImageConverter"));
const ImageManager = lazy(() => import("@/pages/admin/ImageManager"));
const MigrateProjects = lazy(() => import("@/pages/admin/MigrateProjects"));
const MenuManager = lazy(() => import("@/pages/admin/MenuManager"));
const PortfolioList = lazy(() => import("@/pages/admin/PortfolioList"));
const PortfolioForm = lazy(() => import("@/pages/admin/PortfolioForm"));
const AuditLogPage = lazy(() => import("@/pages/admin/AuditLogPage"));
const SeoGeo = lazy(() => import("@/pages/admin/SeoGeo"));
const SeoChecklist = lazy(() => import("@/pages/admin/SeoChecklist"));
const SeoConfig = lazy(() => import("@/pages/admin/SeoConfig"));
const SeoHistory = lazy(() => import("@/pages/admin/SeoHistory"));
const SeoGeoModule = lazy(() => import("@/pages/admin/SeoGeoModule"));
const SeoTools = lazy(() => import("@/pages/admin/SeoTools"));
const ResponsiveAudit = lazy(() => import("@/pages/admin/ResponsiveAudit"));
const ResponsiveAuditHistory = lazy(() => import("@/pages/admin/ResponsiveAuditHistory"));
const SeoGooglebotAudit = lazy(() => import("@/pages/admin/SeoGooglebotAudit"));
const SeoMetaAudit = lazy(() => import("@/pages/admin/SeoMetaAudit"));
const Diagnostics = lazy(() => import("@/pages/admin/Diagnostics"));
const SecurityFindings = lazy(() => import("@/pages/admin/SecurityFindings"));

const AdminLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

export default function AdminRoutes() {
  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="properties" element={<ProtectedRoute><AdminProperties /></ProtectedRoute>} />
        <Route path="properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
        <Route path="properties/edit/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
        <Route path="clients" element={<ProtectedRoute requiredRole="editor"><Clients /></ProtectedRoute>} />
        <Route path="clients/:id" element={<ProtectedRoute requiredRole="editor"><ClientDetail /></ProtectedRoute>} />
        <Route path="appointments" element={<ProtectedRoute requiredRole="editor"><Appointments /></ProtectedRoute>} />
        <Route path="newsletter" element={<ProtectedRoute requiredRole="editor"><Newsletter /></ProtectedRoute>} />
        <Route path="newsletter/new" element={<ProtectedRoute requiredRole="editor"><NewCampaign /></ProtectedRoute>} />
        <Route path="newsletter/edit/:id" element={<ProtectedRoute requiredRole="editor"><NewCampaign /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute requiredRole="editor"><Reports /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
        <Route path="json-ld-validator" element={<ProtectedRoute requiredRole="editor"><JsonLdValidator /></ProtectedRoute>} />
        <Route path="json-ld-system" element={<ProtectedRoute requiredRole="editor"><JsonLdSystem /></ProtectedRoute>} />
        <Route path="image-converter" element={<ProtectedRoute requiredRole="editor"><ImageConverter /></ProtectedRoute>} />
        <Route path="image-manager" element={<ProtectedRoute requiredRole="admin"><ImageManager /></ProtectedRoute>} />
        <Route path="responsive-audit" element={<ProtectedRoute requiredRole="admin"><ResponsiveAudit /></ProtectedRoute>} />
        <Route path="responsive-audit-history" element={<ProtectedRoute requiredRole="admin"><ResponsiveAuditHistory /></ProtectedRoute>} />
        <Route path="seo-googlebot-audit" element={<ProtectedRoute requiredRole="admin"><SeoGooglebotAudit /></ProtectedRoute>} />
        <Route path="migrate-projects" element={<ProtectedRoute requiredRole="admin"><MigrateProjects /></ProtectedRoute>} />
        <Route path="menus" element={<ProtectedRoute requiredRole="admin"><MenuManager /></ProtectedRoute>} />
        <Route path="portfolio" element={<ProtectedRoute requiredRole="editor"><PortfolioList /></ProtectedRoute>} />
        <Route path="portfolio/new" element={<ProtectedRoute requiredRole="editor"><PortfolioForm /></ProtectedRoute>} />
        <Route path="portfolio/edit/:id" element={<ProtectedRoute requiredRole="editor"><PortfolioForm /></ProtectedRoute>} />
        <Route path="audit" element={<ProtectedRoute requiredRole="super_admin"><AuditLogPage /></ProtectedRoute>} />
        <Route path="seo" element={<ProtectedRoute requiredRole="admin"><SeoGeo /></ProtectedRoute>} />
        <Route path="seo/checklist" element={<ProtectedRoute requiredRole="admin"><SeoChecklist /></ProtectedRoute>} />
        <Route path="seo/config" element={<ProtectedRoute requiredRole="admin"><SeoConfig /></ProtectedRoute>} />
        <Route path="seo/history" element={<ProtectedRoute requiredRole="admin"><SeoHistory /></ProtectedRoute>} />
        <Route path="seo/geo" element={<ProtectedRoute requiredRole="admin"><SeoGeoModule /></ProtectedRoute>} />
        <Route path="seo/tools" element={<ProtectedRoute requiredRole="admin"><SeoTools /></ProtectedRoute>} />
        <Route path="seo/meta-audit" element={<ProtectedRoute requiredRole="admin"><SeoMetaAudit /></ProtectedRoute>} />
        <Route path="diagnostics" element={<ProtectedRoute requiredRole="admin"><Diagnostics /></ProtectedRoute>} />
        <Route path="security-findings" element={<ProtectedRoute requiredRole="admin"><SecurityFindings /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}
