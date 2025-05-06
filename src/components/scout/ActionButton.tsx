
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

export const ActionButton = ({ icon, label, color, onClick }: ActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`bg-${color}-500 hover:bg-${color}-600 text-white`}
    >
      {icon} {label}
    </Button>
  );
};
