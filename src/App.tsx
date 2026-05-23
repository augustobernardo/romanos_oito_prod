import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import OikosLanding from "./pages/OikosLanding";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminEventos from "./components/admin/AdminEventos";
import AdminLotes from "./components/admin/AdminLotes";
import AdminInscricoes from "./components/admin/AdminInscricoes";
import AdminCupons from "./components/admin/AdminCupons";
import AdminCuponsServo from "./components/admin/AdminCuponsServo";
import PentecosteAdmin from "./components/admin/pentecostes/PentecosteAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/oikos" element={<OikosLanding />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/eventos"
                element={
                  <ProtectedRoute>
                    <AdminEventos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/lotes"
                element={
                  <ProtectedRoute>
                    <AdminLotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inscricoes"
                element={
                  <ProtectedRoute>
                    <AdminInscricoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/cupons"
                element={
                  <ProtectedRoute>
                    <AdminCupons />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/servos-amigos"
                element={
                  <ProtectedRoute>
                    <AdminCuponsServo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pentecostes"
                element={
                  <ProtectedRoute>
                    <PentecosteAdmin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
