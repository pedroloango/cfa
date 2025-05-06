import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex relative bg-background">
      {isMobile ? (
        <div 
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
            showMobileSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setShowMobileSidebar(false)}
        />
      ) : null}
      
      <div 
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform ${
                showMobileSidebar ? "translate-x-0" : "-translate-x-full"
              }`
            : "absolute"
        }`}
      >
        <Sidebar onClose={() => setShowMobileSidebar(false)} />
      </div>

      <div className={`flex-1 flex flex-col ${isMobile ? "" : "ml-[250px]"}`}>
        <Header>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white">
            Logout
          </Button>
        </Header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
