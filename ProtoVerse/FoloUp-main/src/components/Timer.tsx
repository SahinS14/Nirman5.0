"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Timer({ startSeconds = 0 }: { startSeconds?: number }) {
  const [seconds, setSeconds] = useState(startSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
  };

  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <span className="font-mono text-lg">{fmt(seconds)}</span>
        <button className="px-2 py-1 border rounded" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="px-2 py-1 border rounded" onClick={() => { setSeconds(0); setRunning(false); }}>
          Reset
        </button>
      </CardContent>
    </Card>
  );
}
