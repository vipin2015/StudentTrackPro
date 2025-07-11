import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import InstallPrompt from "@/components/InstallPrompt";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Branches from "@/pages/Branches";
import Users from "@/pages/Users";
import Subjects from "@/pages/Subjects";
import Attendance from "@/pages/Attendance";
import Progress from "@/pages/Progress";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/branches" component={() => <ProtectedRoute><Branches /></ProtectedRoute>} />
      <Route path="/users" component={() => <ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/subjects" component={() => <ProtectedRoute><Subjects /></ProtectedRoute>} />
      <Route path="/attendance" component={() => <ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/progress" component={() => <ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/analytics" component={() => <ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <InstallPrompt />
            <Router />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
