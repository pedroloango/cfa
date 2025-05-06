import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  fixed?: boolean;
}

export default function Navbar({ fixed = false }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className={`bg-white shadow-lg ${fixed ? 'fixed w-full z-10' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-gray-800">FutBoss</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 