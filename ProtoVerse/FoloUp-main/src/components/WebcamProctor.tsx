"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WebcamProctor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [active, setActive] = useState(false);

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(s);
      setActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error("Webcam access failed", e);
    }
  };

  const stop = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setActive(false);
    setStream(null);
  };

  useEffect(() => () => stop(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webcam Proctor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <Button onClick={active ? stop : start}>{active ? "Stop" : "Start"}</Button>
        </div>
        <div className="w-full aspect-video bg-black rounded overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        </div>
      </CardContent>
    </Card>
  );
}
