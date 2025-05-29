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

  console.log("MainLayout RENDER, showMobileSidebar:", showMobileSidebar, "isMobile:", isMobile);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleCloseSidebar = () => {
    console.log("handleCloseSidebar CALLED, setting showMobileSidebar to false");
    setShowMobileSidebar(false);
  };

  const handleOpenSidebar = () => {
    console.log("handleOpenSidebar CALLED, setting showMobileSidebar to true");
    setShowMobileSidebar(true);
  }

  return (
    <div className="min-h-screen flex relative bg-background">
      {isMobile ? (
        <div 
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
            showMobileSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleCloseSidebar}
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
        <Sidebar onClose={handleCloseSidebar} />
      </div>

      <div className={`flex-1 flex flex-col ${isMobile ? "" : "ml-[250px]"}`}>
        <Header>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={handleOpenSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white">
            Logout
          </Button>
        </Header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
