import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentSignup from "./pages/StudentSignup";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/StudentDashboard";
import CreateComplaint from "./pages/CreateComplaint";
import ComplaintDetail from "./pages/ComplaintDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaintDetail from "./pages/AdminComplaintDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student-signup" element={<StudentSignup />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/create-complaint" element={<CreateComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaint/:id" element={<AdminComplaintDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
