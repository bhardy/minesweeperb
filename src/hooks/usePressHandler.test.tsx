import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { usePressHandler } from "./usePressHandler";
import { vi } from "vitest";

const holdDuration = 250;

// Test component that uses the hook
function TestComponent({
  onClick,
  onHold,
  onRightClick,
  onLeftAndRightClick,
}: {
  onClick?: () => void;
  onHold?: () => void;
  onRightClick?: () => void;
  onLeftAndRightClick?: () => void;
}) {
  const {
    onPointerDown,
    onContextMenu,
    onClick: onClickOverride,
    ref,
  } = usePressHandler({
    onClick,
    onHold,
    onRightClick,
    onLeftAndRightClick,
    holdDuration,
  });

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
      onClick={onClickOverride}
      data-testid="test-element"
    >
      Test Element
    </div>
  );
}

describe("usePressHandler", () => {
  let onClick: ReturnType<typeof vi.fn>;
  let onHold: ReturnType<typeof vi.fn>;
  let onRightClick: ReturnType<typeof vi.fn>;
  let onLeftAndRightClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onClick = vi.fn();
    onHold = vi.fn();
    onRightClick = vi.fn();
    onLeftAndRightClick = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger onClick when clicking normally", () => {
    render(
      <TestComponent
        onClick={onClick}
        onHold={onHold}
        onRightClick={onRightClick}
      />
    );

    const element = screen.getByTestId("test-element");
    fireEvent.pointerDown(element);
    fireEvent.pointerUp(element);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onHold).not.toHaveBeenCalled();
    expect(onRightClick).not.toHaveBeenCalled();
    expect(onLeftAndRightClick).not.toHaveBeenCalled();
  });

  it("should trigger onHold when holding for the default duration", () => {
    render(
      <TestComponent
        onHold={onHold}
        onClick={onClick}
        onRightClick={onRightClick}
      />
    );

    const element = screen.getByTestId("test-element");
    fireEvent.pointerDown(element);

    act(() => {
      vi.advanceTimersByTime(holdDuration); // Default hold duration
    });

    expect(onHold).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(onRightClick).not.toHaveBeenCalled();
    expect(onLeftAndRightClick).not.toHaveBeenCalled();
  });

  it("should trigger onRightClick when right clicking", () => {
    render(
      <TestComponent
        onRightClick={onRightClick}
        onClick={onClick}
        onHold={onHold}
      />
    );

    const element = screen.getByTestId("test-element");
    fireEvent.contextMenu(element);

    expect(onRightClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(onHold).not.toHaveBeenCalled();
    expect(onLeftAndRightClick).not.toHaveBeenCalled();
  });

  it("should trigger onLeftAndRightClick when both buttons are pressed", () => {
    render(
      <TestComponent
        onLeftAndRightClick={onLeftAndRightClick}
        onClick={onClick}
        onRightClick={onRightClick}
        onHold={onHold}
      />
    );

    const element = screen.getByTestId("test-element");

    // Simulate left button down
    fireEvent.pointerDown(element, { button: 0, buttons: 1 });

    // Simulate right click while left is down
    fireEvent.contextMenu(element, { button: 2, buttons: 3 });

    expect(onLeftAndRightClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(onRightClick).not.toHaveBeenCalled();
    expect(onHold).not.toHaveBeenCalled();
  });

  // @todo: this is really hard to test, it needs to be manually tested until we figure out how to do it in here
  it("should not trigger onClick when scrolling", () => {});

  it("should not trigger onHold when right clicking", () => {
    render(
      <TestComponent
        onHold={onHold}
        onClick={onClick}
        onRightClick={onRightClick}
      />
    );

    const element = screen.getByTestId("test-element");

    // Simulate context menu (right click)
    fireEvent.contextMenu(element, { button: 2, buttons: 2 });

    // Advance timers to simulate holding
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onHold).not.toHaveBeenCalled();
    expect(onRightClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(onLeftAndRightClick).not.toHaveBeenCalled();
  });

  it("should handle multiple interactions in sequence without interference", () => {
    render(
      <TestComponent
        onClick={onClick}
        onHold={onHold}
        onRightClick={onRightClick}
        onLeftAndRightClick={onLeftAndRightClick}
      />
    );

    const element = screen.getByTestId("test-element");

    // Test sequence 1: Normal click
    fireEvent.pointerDown(element);
    fireEvent.pointerUp(element);
    expect(onClick).toHaveBeenCalledTimes(1);
    onClick.mockClear();

    // Clean up any remaining event listeners
    fireEvent.pointerUp(element);
    fireEvent.pointerUp(document);

    // Test sequence 2: Right click
    fireEvent.contextMenu(element);
    expect(onRightClick).toHaveBeenCalledTimes(1);
    onRightClick.mockClear();

    // Clean up any remaining event listeners
    fireEvent.pointerUp(element);
    fireEvent.pointerUp(document);

    // Test sequence 3: Hold
    fireEvent.pointerDown(element);
    act(() => {
      vi.advanceTimersByTime(holdDuration);
    });
    expect(onHold).toHaveBeenCalledTimes(1);
    onHold.mockClear();

    // Clean up any remaining event listeners
    fireEvent.pointerUp(element);
    fireEvent.pointerUp(document);

    // Test sequence 4: Left and right click
    fireEvent.pointerDown(element, { button: 0, buttons: 1 });
    fireEvent.contextMenu(element, { button: 2, buttons: 3 });
    expect(onLeftAndRightClick).toHaveBeenCalledTimes(1);
    onLeftAndRightClick.mockClear();

    // Clean up any remaining event listeners
    fireEvent.pointerUp(element);
    fireEvent.pointerUp(document);

    // Test sequence 5: Another normal click
    fireEvent.pointerDown(element);
    fireEvent.pointerUp(element);
    expect(onClick).toHaveBeenCalledTimes(1);

    // Test sequence 6: one more Left and Right click
    fireEvent.pointerDown(element, { button: 0, buttons: 1 });
    fireEvent.contextMenu(element, { button: 2, buttons: 3 });
    expect(onLeftAndRightClick).toHaveBeenCalledTimes(1);
  });
});
