import { useState, useEffect } from "react";
import styles from "./minesweeper.module.css";

interface TimerProps {
  startTime?: number;
  endTime?: number;
}

export const Timer = ({ startTime, endTime }: TimerProps) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setTime(0);
      return;
    }

    if (endTime) {
      setTime(Math.floor((endTime - startTime) / 1000));
      return;
    }

    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return (
    <div className={styles.scoreboard}>
      <span className="text-sm font-bold">{time}</span>
    </div>
  );
};

interface CountProps {
  count: number;
}

export const Count = ({ count }: CountProps) => {
  return (
    <div className={styles.scoreboard}>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
};
