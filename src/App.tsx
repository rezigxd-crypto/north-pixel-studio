import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";
import Quest from "./pages/Quest.tsx";
import Innovation from "./pages/Innovation.tsx";
import Members from "./pages/Members.tsx";
import Login from "./pages/auth/Login.tsx";
import SignupChoice from "./pages/auth/SignupChoice.tsx";
import ClientSignup from "./pages/auth/ClientSignup.tsx";
import CreatorSignup from "./pages/auth/CreatorSignup.tsx";
import CompleteSignup from "./pages/auth/CompleteSignup.tsx";
import PendingReview from "./pages/auth/PendingReview.tsx";
import ClientPortal from "./pages/portals/ClientPortal.tsx";
import CreatorPortal from "./pages/portals/CreatorPortal.tsx";
import AdminPortal from "./pages/portals/AdminPortal.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/quest" element={<Quest />} />
          <Route path="/innovation" element={<Innovation />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
