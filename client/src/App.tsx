import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeToggle";
import { StudyPlanProvider } from "@/hooks/useStudyPlan";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NotesGenerator from "@/pages/NotesGenerator";
import RealWorldExplanations from "@/pages/RealWorldExplanations";
import Quiz from "@/pages/Quiz";
import StudyPlanGenerator from "@/pages/StudyPlanGenerator";
import StudyPlan from "@/pages/StudyPlan";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/notes" component={NotesGenerator} />
        <Route path="/explanations" component={RealWorldExplanations} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/study-plan-generator" component={StudyPlanGenerator} />
        <Route path="/study-plan" component={StudyPlan} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <QueryClientProvider client={queryClient}>
        <StudyPlanProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </StudyPlanProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
