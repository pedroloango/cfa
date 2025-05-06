import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Home, 
  CreditCard, 
  DollarSign,
  Star, 
  BarChart3,
  Settings,
  Clipboard,
  X,
  LayoutDashboard,
  ClipboardList,
  Award,
  ChartBar,
  FileSpreadsheet,
  Receipt,
  FileText,
  LogOut
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/alunos", label: "Alunos", icon: Users },
  { path: "/mensalidades", label: "Mensalidades", icon: CreditCard },
  { path: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { path: "/scout", label: "Scout", icon: Award },
  { path: "/relatorio-jogos", label: "Relatório de Jogos", icon: FileSpreadsheet },
  { path: "/relatorios", label: "Relatórios", icon: FileText },
  { path: "/receitas", label: "Receitas", icon: Receipt },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <aside className="w-64 bg-[hsl(142,84%,33%)] min-h-[calc(100vh-64px)]">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[hsl(142,84%,33%)]"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-white">Craque Academy</span>
        </div>
        {isMobile && onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-[hsl(142,44%,28%)]"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "text-white hover:bg-[hsl(142,44%,28%)]"
              )}
              onClick={isMobile && onClose ? onClose : undefined}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[hsl(142,84%,33%)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[hsl(142,44%,28%)] flex items-center justify-center">
            <span className="text-white font-semibold">
              CA
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin</span>
            <span className="text-xs text-white/70">
              admin@craqueacademy.com
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
