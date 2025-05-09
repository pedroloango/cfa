import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScoutActionType } from "./types";
import { 
  Goal, 
  Shield, 
  ShieldAlert, 
  Flag, 
  Target, 
  Check, 
  X,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  Timer,
  Shirt
} from "lucide-react";

interface ActionType {
  id: string;
  label: string;
  icon: React.ReactNode;
  requiresLocation: boolean;
}

interface ActionButtonsProps {
  disabled: boolean;
  onAction: (type: ScoutActionType) => void;
  selectedAction: ScoutActionType | null;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  disabled, 
  onAction, 
  selectedAction 
}) => {
  const isSelected = (action: ScoutActionType) => selectedAction === action;
  
  const actions: ActionType[] = [
    {
      id: "goal",
      label: "Gol",
      icon: <Goal className="mr-2 h-4 w-4" />,
      requiresLocation: true,
    },
    {
      id: "assist",
      label: "Assistência",
      icon: <Target className="mr-2 h-4 w-4" />,
      requiresLocation: true,
    },
    {
      id: "shot",
      label: "Chute",
      icon: <Target className="mr-2 h-4 w-4" />,
      requiresLocation: true,
    },
    {
      id: "save",
      label: "Defesa",
      icon: <Shield className="mr-2 h-4 w-4" />,
      requiresLocation: true,
    },
    {
      id: "foul",
      label: "Falta",
      icon: <X className="mr-2 h-4 w-4" />,
      requiresLocation: true,
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full mx-auto">
      {actions.map(button => (
        <Button
          key={button.id}
          onClick={() => onAction(button.id as ScoutActionType)}
          className={cn(
            "bg-green-500 hover:bg-green-600 text-white",
            isSelected(button.id as ScoutActionType) && "ring-2 ring-yellow-400 ring-offset-2"
          )}
          disabled={disabled}
        >
          {button.icon} <span className="text-xs sm:text-sm">{button.label}</span>
        </Button>
      ))}
    </div>
  );
};
