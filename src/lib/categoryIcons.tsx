import { GlassWater, Candy, CupSoda, IceCreamCone, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, { Icon: any; bg: string; color: string }> = {
  drink: { Icon: GlassWater, bg: "bg-blue-100", color: "text-blue-600" },
  chocolate: { Icon: Candy, bg: "bg-amber-100", color: "text-amber-600" },
  cocktail: { Icon: CupSoda, bg: "bg-purple-100", color: "text-purple-600" },
  yogurt: { Icon: IceCreamCone, bg: "bg-pink-100", color: "text-pink-600" },
};

interface CategoryIconProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { wrapper: "w-10 h-10 rounded-lg", icon: "w-5 h-5" },
  md: { wrapper: "w-14 h-14 rounded-xl", icon: "w-7 h-7" },
  lg: { wrapper: "w-20 h-20 rounded-2xl", icon: "w-10 h-10" },
};

export function CategoryIcon({ category, size = "md", className }: CategoryIconProps) {
  const config = iconMap[category] || { Icon: Package, bg: "bg-gray-100", color: "text-gray-500" };
  const s = sizeClasses[size];

  return (
    <div className={cn("flex items-center justify-center", s.wrapper, config.bg, className)}>
      <config.Icon className={cn(s.icon, config.color)} />
    </div>
  );
}
