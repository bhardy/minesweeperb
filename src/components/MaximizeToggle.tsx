"use client";

import { useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useMediaQuery } from "@react-hook/media-query";
import { Button } from "./ui/button";
import { useStore } from "@/store";
import styles from "./maximize-toggle.module.css";
import classNames from "classnames";

export function MaximizeToggle() {
  const {
    isMaximized,
    setIsMaximized,
    userPrefersMaximized,
    setUserPrefersMaximized,
  } = useStore();
  const isTouchDevice = useMediaQuery("(pointer: coarse)");

  useEffect(() => {
    if (isTouchDevice) {
      setIsMaximized(true);
    } else {
      if (userPrefersMaximized) {
        setIsMaximized(true);
      } else {
        setIsMaximized(false);
      }
    }
  }, [isTouchDevice, userPrefersMaximized, setIsMaximized]);

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    setUserPrefersMaximized(!isMaximized);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleMaximize}
      title={isMaximized ? "Minimize" : "Maximize"}
      className={classNames("dark:text-foreground", styles.toggle)}
    >
      {isMaximized ? <Minimize /> : <Maximize />}
    </Button>
  );
}
