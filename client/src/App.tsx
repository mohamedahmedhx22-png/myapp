import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InstallAppBanner from "@/components/install-app-banner";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Favorites from "@/pages/favorites";
import Contacts from "@/pages/contacts";
import History from "@/pages/history";
import Settings from "@/pages/settings";
import BusinessDirectory from "@/pages/business-directory";
import Services from "@/pages/services";
import AddContact from "@/pages/add-contact";
import PhoneDiscovery from "@/pages/phone-discovery";
import Marketplace from "@/pages/marketplace";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={AuthPage} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile/:id" component={Profile} />
          <Route path="/business/:id" component={Profile} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/history" component={History} />
          <Route path="/settings" component={Settings} />
          <Route path="/business" component={BusinessDirectory} />
          <Route path="/services" component={Services} />
          <Route path="/add-contact" component={AddContact} />
          <Route path="/phone-discovery" component={PhoneDiscovery} />
          <Route path="/marketplace" component={Marketplace} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 select-none touch-pan-y">
          <InstallAppBanner />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
