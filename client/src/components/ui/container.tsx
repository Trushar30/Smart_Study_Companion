import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn("bg-card dark:bg-card p-5 rounded-xl shadow-sm", className)}>
      {children}
    </div>
  );
};

export const SectionTitle = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-2xl font-bold text-primary dark:text-white">
        {children}
      </h2>
    </div>
  );
};
