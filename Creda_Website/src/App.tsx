import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/layout/Header";
import AppSidebar from "@/components/layout/AppSidebar";
import LandingPage from "./pages/LandingPage";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import Portfolio from "./pages/Portfolio";
import Budget from "./pages/Budget";
import Advisory from "./pages/Advisory";
import Goals from "./pages/Goals";
import ExpenseAnalytics from "./pages/ExpenseAnalytics";
import FinancialHealth from "./pages/FinancialHealth";
import Knowledge from "./pages/Knowledge";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import Voice from "./pages/Voice";
import ReliableVoiceAssistant from "./components/ReliableVoiceAssistant";
import NotFound from "./pages/NotFound";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/sign-in" element={<Auth mode="sign-in" />} />
                <Route path="/auth/sign-up" element={<Auth mode="sign-up" />} />
                <Route path="/*" element={
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-gradient-dashboard">
                      <AppSidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 overflow-auto">
                          <Routes>
                            <Route path="/dashboard" element={<EnhancedDashboard />} />
                            <Route path="/portfolio" element={<Portfolio />} />
                            <Route path="/budget" element={<Budget />} />
                            <Route path="/expense-analytics" element={<ExpenseAnalytics />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/health" element={<FinancialHealth />} />
                            <Route path="/knowledge" element={<Knowledge />} />
                            <Route path="/advisory" element={<Advisory />} />
                            <Route path="/voice" element={<Voice />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/security" element={<Security />} />
                            <Route path="/help" element={<Help />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                    {/* Reliable Voice Assistant - Always Available */}
                    <ReliableVoiceAssistant 
                      enableAudioResponse={true}
                      isCompact={true}
                    />
                  </SidebarProvider>
                } />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
