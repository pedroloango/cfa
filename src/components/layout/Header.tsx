
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="border-b bg-card h-16 flex items-center px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center">
        {children}
      </div>
      <div className="flex-1 flex items-center justify-end md:justify-between">
        <form className="relative w-full max-w-[200px] md:w-72 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8 bg-background w-full"
          />
        </form>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
