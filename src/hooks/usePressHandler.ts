import { useRef, useCallback } from "react";

type UsePressHandlerOptions = {
  onClick?: () => void;
  onHold?: () => void;
  onRightClick?: () => void;
  holdDuration?: number;
};

type UsePressHandlerReturn = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  ref: (el: HTMLElement | null) => void;
};

export function usePressHandler({
  onClick,
  onHold,
  onRightClick,
  holdDuration = 250,
}: UsePressHandlerOptions): UsePressHandlerReturn {
  const targetRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const isHoldingRef = useRef(false);

  const isRightClickRef = useRef(false);

  const handlePointerUp = useCallback(() => {
    document.removeEventListener("pointerup", handlePointerUp);

    clearTimeout(timeoutRef.current);

    // Only fire click if we aren't holding or are right clicking
    if (!isHoldingRef.current || isRightClickRef.current) {
      onClick?.();
    }

    targetRef.current?.blur();
  }, [onClick]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // if the user is holding right click we don't fire the onHold
      if (e.button === 2) {
        isRightClickRef.current = true;
        return;
      }

      isHoldingRef.current = false;
      isRightClickRef.current = false;
      targetRef.current?.focus();

      timeoutRef.current = window.setTimeout(() => {
        isHoldingRef.current = true;
        onHold?.();
      }, holdDuration);

      document.addEventListener("pointerup", handlePointerUp);
    },
    [holdDuration, handlePointerUp, onHold]
  );

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    targetRef.current?.blur();
    onRightClick?.();
  };

  const onClickOverride = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  };

  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => handlePointerDown(e),
    onContextMenu: (e: React.MouseEvent<HTMLElement>) => onContextMenu(e),
    onClick: (e: React.MouseEvent<HTMLElement>) => onClickOverride(e),
    ref: (el: HTMLElement | null) => {
      targetRef.current = el;
    },
  };
}
