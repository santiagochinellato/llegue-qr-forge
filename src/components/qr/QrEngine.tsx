"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import QRCodeStyling, {
  FileExtension,
  DotType,
  CornerSquareType,
  CornerDotType,
  Options,
} from "qr-code-styling";
import { cn } from "@/lib/utils";

// Define the exposed handle for parent components
export interface QrEngineHandle {
  download: (extension: FileExtension) => void;
}

interface QrEngineProps {
  content: string;
  size?: number;
  logoUrl?: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
  };
  style: {
    dotsType: DotType;
    cornersSquareType: CornerSquareType;
    cornersDotType: CornerDotType;
  };
  className?: string; // Kept for container styling
}

export const QrEngine = forwardRef<QrEngineHandle, QrEngineProps>(
  ({ content, size = 300, logoUrl, colors, style, className }, ref) => {
    const qrCode = useRef<QRCodeStyling | null>(null);
    const refContainer = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      download: (extension: FileExtension) => {
        qrCode.current?.download({
          extension,
          name: `llegue-qr-${Date.now()}`,
        });
      },
    }));

    useEffect(() => {
      // Configuration for readability:
      // 1. Margin: 20px (Safe zone)
      // 2. Background: Explicit color to ensure contrast
      const options: Options = {
        width: size,
        height: size,
        data: content,
        image: logoUrl,
        margin: 40, // Expanded Quiet Zone for Inverted QRs
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "H", // High error correction for logos
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.3, // Reduced from 0.4 for safety
          margin: 10,
          crossOrigin: "anonymous",
        },
        dotsOptions: {
          type: style.dotsType,
          color: colors.foreground,
          // gradient: undefined // We could add gradient support later
        },
        backgroundOptions: {
          // KEY FIX: Use the actual background color, not transparent,
          // so the QR code is self-contained and scannable anywhere.
          color: colors.background,
        },
        cornersSquareOptions: {
          type: style.cornersSquareType,
          color: colors.accent,
        },
        cornersDotOptions: {
          type: style.cornersDotType,
          color: colors.accent,
        },
      };

      qrCode.current = new QRCodeStyling(options);

      if (refContainer.current) {
        refContainer.current.innerHTML = ""; // Clear previous
        qrCode.current.append(refContainer.current);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    useEffect(() => {
      if (!qrCode.current) return;
      qrCode.current.update({
        width: size,
        height: size,
        data: content,
        image: logoUrl,
        dotsOptions: {
          type: style.dotsType,
          color: colors.foreground,
        },
        backgroundOptions: {
          color: colors.background,
        },
        cornersSquareOptions: {
          type: style.cornersSquareType,
          color: colors.accent,
        },
        cornersDotOptions: {
          type: style.cornersDotType,
          color: colors.accent,
        },
      });
    }, [content, size, logoUrl, colors, style]); // Update on prop changes

    return (
      <div
        ref={refContainer}
        className={cn(
          "flex items-center justify-center p-4 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl",
          className,
        )}
      />
    );
  },
);

QrEngine.displayName = "QrEngine";
