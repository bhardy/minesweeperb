import { useRef, useCallback } from "react";

type UsePressHandlerOptions = {
  onClick?: () => void;
  onHold?: () => void;
  onRightClick?: () => void;
  onLeftAndRightClick?: () => void;
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
  onLeftAndRightClick,
  holdDuration = 250,
}: UsePressHandlerOptions): UsePressHandlerReturn {
  const targetRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const isHoldingRef = useRef(false);
  const isLeftDown = useRef(false);
  const isRightClickRef = useRef(false);
  const isRightAndLeftDownRef = useRef(false);
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);
  const isScrollingRef = useRef(false);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    // Only detect scrolling for touch events
    if (e.pointerType !== "touch") return;

    if (!initialPositionRef.current) return;

    const dx = Math.abs(e.clientX - initialPositionRef.current.x);
    const dy = Math.abs(e.clientY - initialPositionRef.current.y);

    // @note: arbitrarily setting 3px as the threshold for scrolling
    if (dx > 3 || dy > 3) {
      isScrollingRef.current = true;
      clearTimeout(timeoutRef.current);
      document.removeEventListener("pointermove", handlePointerMove);
      targetRef.current?.blur();
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointermove", handlePointerMove);

    isLeftDown.current = false;

    // If the user triggered a chord click, we don't fire this primary click event on pointer up
    if (isRightAndLeftDownRef.current) {
      isRightAndLeftDownRef.current = false;
      return;
    }

    clearTimeout(timeoutRef.current);
    initialPositionRef.current = null;

    // Only fire click if we aren't holding, aren't scrolling, and aren't right clicking
    if (
      !isHoldingRef.current &&
      !isScrollingRef.current &&
      !isRightClickRef.current
    ) {
      onClick?.();
    }

    isScrollingRef.current = false;
    targetRef.current?.blur();
  }, [onClick, handlePointerMove]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // @TODO : confirm we can remove this and that it's handled by useGesture
      // Check for multi-touch by looking at the number of active touches
      // const nativeEvent = e.nativeEvent as unknown as TouchEvent;
      // if (e.pointerType === "touch" && nativeEvent.touches?.length > 1) {
      //   targetRef.current?.blur();
      //   return;
      // }

      // if the user is holding right click we don't fire the onHold
      if (e.button === 2) {
        isRightClickRef.current = true;
        document.addEventListener("pointerup", handlePointerUp);
        return;
      }

      if (e.button === 0) {
        isLeftDown.current = true;
      }

      isHoldingRef.current = false;
      isRightClickRef.current = false;
      isScrollingRef.current = false;
      initialPositionRef.current = { x: e.clientX, y: e.clientY };
      targetRef.current?.focus();

      document.addEventListener("pointermove", handlePointerMove);

      timeoutRef.current = window.setTimeout(() => {
        if (!isScrollingRef.current) {
          isHoldingRef.current = true;
          onHold?.();
        }
      }, holdDuration);

      document.addEventListener("pointerup", handlePointerUp);
    },
    [holdDuration, handlePointerUp, onHold, handlePointerMove]
  );

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    targetRef.current?.blur();

    // @note: this detects if both buttons are pressed
    if (isLeftDown.current || (e.button === 2 && e.buttons === 3)) {
      onLeftAndRightClick?.();
      isRightAndLeftDownRef.current = true;
      isLeftDown.current = false;
      return;
    }

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
