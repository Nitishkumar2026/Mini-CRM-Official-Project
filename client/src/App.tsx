import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleAuth } from "@/components/auth/google-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/lib/auth";
import Dashboard from "@/pages/dashboard";
import AudienceBuilder from "@/pages/audience-builder";
import Campaigns from "@/pages/campaigns";
import Analytics from "@/pages/analytics";
import ApiDocs from "@/pages/api-docs";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/audiences" component={AudienceBuilder} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/api-docs" component={ApiDocs} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function Router() {
  const { data: user, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return <GoogleAuth isVisible={true} />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
