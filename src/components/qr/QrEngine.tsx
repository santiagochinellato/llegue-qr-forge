"use client";

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

interface QrEngineProps {
  content: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: QrErrorCorrectionLevel;
  className?: string;
}

export const QrEngine = forwardRef<HTMLCanvasElement, QrEngineProps>(
  (
    {
      content,
      size = 300,
      bgColor = "#ffffff",
      fgColor = "#000000",
      level = "M",
      className,
    },
    ref,
  ) => {
    const localRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => localRef.current as HTMLCanvasElement);

    useEffect(() => {
      if (!localRef.current || !content) return;

      QRCode.toCanvas(
        localRef.current,
        content,
        {
          width: size,
          margin: 1,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: level,
        },
        (err) => {
          if (err) {
            console.error("Error generating QR code", err);
            setError("Failed to generate QR code");
          } else {
            setError(null);
          }
        },
      );
    }, [content, size, bgColor, fgColor, level]);

    return (
      <div
        className={cn(
          "relative flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-neutral-200",
          className,
        )}
      >
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <canvas ref={localRef} className="max-w-full h-auto" />
        )}
      </div>
    );
  },
);

QrEngine.displayName = "QrEngine";
