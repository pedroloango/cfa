
import { Button } from "@/components/ui/button";

interface PlayerButtonProps {
  position: number;
  isSelected: boolean;
  onClick: () => void;
}

export const PlayerButton = ({ position, isSelected, onClick }: PlayerButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={isSelected ? "default" : "outline"}
      className="w-12 h-12 rounded-full"
    >
      {position}
    </Button>
  );
};
