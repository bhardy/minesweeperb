"use client";

import { Maximize, Minimize } from "lucide-react";
import { Button } from "./ui/button";
import { useStore } from "@/store";

export function MaximizeToggle() {
  const { isMaximized, setIsMaximized } = useStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsMaximized(!isMaximized)}
      title={isMaximized ? "Minimize" : "Maximize"}
      className="invisible md:visible dark:text-foreground"
    >
      {isMaximized ? <Minimize /> : <Maximize />}
    </Button>
  );
}
