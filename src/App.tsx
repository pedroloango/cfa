import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Alunos from "./pages/Alunos";
import Mensalidades from "./pages/Mensalidades";
import Avaliacoes from "./pages/Avaliacoes";
import Relatorios from "./pages/Relatorios";
import Scout from "./pages/Scout";
import NotFound from "./pages/NotFound";
import Configuracoes from "./pages/Configuracoes";
import GameReports from "./pages/GameReports";
import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import Login from "./pages/Login";
import Atividades from "./pages/Atividades";
import Despesas from "./pages/Despesas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/mensalidades" element={<Mensalidades />} />
          <Route path="/avaliacoes" element={<Avaliacoes />} />
          <Route path="/scout" element={<Scout />} />
          <Route path="/relatorio-jogos" element={<GameReports />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/atividades" element={<Atividades />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/receitas" element={<Receitas />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
