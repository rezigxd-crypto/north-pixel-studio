import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";

// Every other route is code-split so the homepage no longer ships the
// portals + auth + service-detail + contract bundles on first paint.
// Vite still preloads these on hover/intent, and the browser caches them
// after the first visit.
const NotFound        = lazy(() => import("./pages/NotFound.tsx"));
const ServiceDetail   = lazy(() => import("./pages/ServiceDetail.tsx"));
const Quest           = lazy(() => import("./pages/Quest.tsx"));
const Innovation      = lazy(() => import("./pages/Innovation.tsx"));
const About           = lazy(() => import("./pages/About.tsx"));
const AILab           = lazy(() => import("./pages/AILab.tsx"));
const Bundles         = lazy(() => import("./pages/Bundles.tsx"));
const University      = lazy(() => import("./pages/University.tsx"));
const Members         = lazy(() => import("./pages/Members.tsx"));
const Login           = lazy(() => import("./pages/auth/Login.tsx"));
const SignupChoice    = lazy(() => import("./pages/auth/SignupChoice.tsx"));
const ClientSignup    = lazy(() => import("./pages/auth/ClientSignup.tsx"));
const CreatorSignup   = lazy(() => import("./pages/auth/CreatorSignup.tsx"));
const CompleteSignup  = lazy(() => import("./pages/auth/CompleteSignup.tsx"));
const PendingReview   = lazy(() => import("./pages/auth/PendingReview.tsx"));
const ClientPortal    = lazy(() => import("./pages/portals/ClientPortal.tsx"));
const CreatorPortal   = lazy(() => import("./pages/portals/CreatorPortal.tsx"));
const AdminPortal     = lazy(() => import("./pages/portals/AdminPortal.tsx"));
const Contract        = lazy(() => import("./pages/Contract.tsx"));

const queryClient = new QueryClient();

// Minimal full-screen fallback while a lazy route chunk loads. Matches the
// site's dark theme so there is no white flash between pages.
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/quest" element={<Quest />} />
            <Route path="/innovation" element={<Innovation />} />
            <Route path="/about" element={<About />} />
            <Route path="/ai" element={<AILab />} />
            <Route path="/bundles" element={<Bundles />} />
            <Route path="/university" element={<University />} />
            <Route path="/clients" element={<Members mode="clients" />} />
            <Route path="/freelancers" element={<Members mode="freelancers" />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignupChoice />} />
            <Route path="/auth/signup/client" element={<ClientSignup />} />
            <Route path="/auth/signup/creator" element={<CreatorSignup />} />
            <Route path="/auth/signup/complete" element={<CompleteSignup />} />
            <Route path="/auth/pending" element={<PendingReview />} />
            <Route path="/portal/client" element={<ClientPortal />} />
            <Route path="/portal/creator" element={<CreatorPortal />} />
            <Route path="/portal/admin" element={<AdminPortal />} />
            <Route path="/contract/:offerId/:role" element={<Contract />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
