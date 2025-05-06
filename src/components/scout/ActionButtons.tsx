
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScoutActionType, ActionRequiringLocation } from "./types";
import { 
  Goal, 
  Shield, 
  HandPlatter, 
  ShieldAlert, 
  Flag, 
  Target, 
  Check, 
  X 
} from "lucide-react";

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
  
  const actionButtons = [
    { 
      type: "goal" as ScoutActionType, 
      label: "GOL", 
      icon: <Goal className="mr-2 h-4 w-4" />, 
      color: "bg-green-500 hover:bg-green-600", 
      requiresLocation: true 
    },
    { 
      type: "chuteGol" as ScoutActionType, 
      label: "CHUTE A GOL", 
      icon: <Target className="mr-2 h-4 w-4" />, 
      color: "bg-purple-500 hover:bg-purple-600", 
      requiresLocation: true 
    },
    { 
      type: "falta" as ScoutActionType, 
      label: "FALTAS", 
      icon: <Flag className="mr-2 h-4 w-4" />, 
      color: "bg-yellow-500 hover:bg-yellow-600", 
      requiresLocation: true 
    },
    { 
      type: "passeCerto" as ScoutActionType, 
      label: "PASSE CERTO", 
      icon: <Check className="mr-2 h-4 w-4" />, 
      color: "bg-blue-500 hover:bg-blue-600", 
      requiresLocation: false 
    },
    { 
      type: "passeErrado" as ScoutActionType, 
      label: "PASSE ERRADO", 
      icon: <X className="mr-2 h-4 w-4" />, 
      color: "bg-red-500 hover:bg-red-600", 
      requiresLocation: false 
    },
    { 
      type: "assistencia" as ScoutActionType, 
      label: "ASSISTÊNCIA", 
      icon: <HandPlatter className="mr-2 h-4 w-4" />, 
      color: "bg-blue-500 hover:bg-blue-600", 
      requiresLocation: false 
    },
    { 
      type: "desarme" as ScoutActionType, 
      label: "DESARME", 
      icon: <Shield className="mr-2 h-4 w-4" />, 
      color: "bg-purple-500 hover:bg-purple-600", 
      requiresLocation: true 
    },
    { 
      type: "golSofrido" as ScoutActionType, 
      label: "GOL SOFRIDO", 
      icon: <ShieldAlert className="mr-2 h-4 w-4" />, 
      color: "bg-red-700 hover:bg-red-800", 
      requiresLocation: false 
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full mx-auto">
      {actionButtons.map(button => (
        <Button
          key={button.type}
          onClick={() => onAction(button.type)}
          className={cn(
            button.color, 
            "text-white",
            isSelected(button.type) && "ring-2 ring-yellow-400 ring-offset-2"
          )}
          disabled={disabled}
        >
          {button.icon} <span className="text-xs sm:text-sm">{button.label}</span>
        </Button>
      ))}
    </div>
  );
};
