
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CourtAreaButtonsProps {
  visible: boolean;
  onAreaClick: (areaNumber: number) => void;
}

export const CourtAreaButtons: React.FC<CourtAreaButtonsProps> = ({ 
  visible, 
  onAreaClick 
}) => {
  const areas = [
    { number: 1, bgColor: "bg-yellow-200" },
    { number: 2, bgColor: "bg-blue-300" },
    { number: 3, bgColor: "bg-orange-400" },
    { number: 4, bgColor: "bg-yellow-100" },
    { number: 5, bgColor: "bg-gray-300" },
    { number: 6, bgColor: "bg-blue-200" },
    { number: 7, bgColor: "bg-blue-700" },
    { number: 8, bgColor: "bg-yellow-50" },
    { number: 9, bgColor: "bg-green-300" },
    { number: 10, bgColor: "bg-yellow-400" },
    { number: 11, bgColor: "bg-orange-300" },
    { number: 12, bgColor: "bg-amber-700" },
  ];

  if (!visible) return null;

  return (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-1">
      {areas.map((area) => (
        <Button
          key={area.number}
          onClick={() => onAreaClick(area.number)}
          className={cn(
            // Aumenta a altura em 30% em relação ao anterior (antes era "h-1/2")
            "h-[65%] w-full rounded-none flex items-center justify-center opacity-30 hover:opacity-70",
            "text-black text-xl font-bold bg-transparent"
          )}
        >
          {area.number}
        </Button>
      ))}
    </div>
  );
};
