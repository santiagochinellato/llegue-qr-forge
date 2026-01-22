"use client";

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useMemo,
} from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

export interface QrConfig {
  value: string;
  colors: {
    bg: string;
    fg: string;
    accent: string;
  };
  style: {
    connectivity: number; // 0 to 1
    dotScale: number; // 0.1 to 1
  };
  logo?: {
    file: File | null;
    url: string | null;
  };
}

interface QrEngineProps {
  config: QrConfig;
  className?: string;
  size?: number;
}

export const QrEngine = forwardRef<SVGSVGElement, QrEngineProps>(
  ({ config, className, size = 500 }, ref) => {
    const { value, colors, style, logo } = config;
    const [matrix, setMatrix] = useState<any[]>([]); // QRCode library internals are not fully typed for matrix
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!value) return;

      // Generate Raw Matrix
      const generate = async () => {
        try {
          const qrData = QRCode.create(value, {
            errorCorrectionLevel: "H",
          });
          // @ts-ignore - modules is the internal matrix
          setMatrix(qrData.modules.data);
        } catch (err) {
          console.error("QR Generation failed", err);
          setError("Failed to generate QR");
        }
      };
      generate();
    }, [value]);

    // Dimensions
    const matrixSize = Math.sqrt(matrix.length);
    // Define Finder Pattern Coordinates (7x7 zones)
    // Top-Left: (0,0) to (7,7)
    // Top-Right: (size-7, 0) to (size, 7)
    // Bottom-Left: (0, size-7) to (7, size)

    const isFinderPattern = (r: number, c: number) => {
      if (r < 7 && c < 7) return true; // Top Left
      if (r < 7 && c >= matrixSize - 7) return true; // Top Right
      if (r >= matrixSize - 7 && c < 7) return true; // Bottom Left
      return false;
    };

    // Center Zone for Logo (approx 20% of middle)
    const isSafeZone = (r: number, c: number) => {
      if (!logo?.url) return false;
      const center = matrixSize / 2;
      const safeRadius = matrixSize * 0.15; // 30% total width
      return (
        r > center - safeRadius &&
        r < center + safeRadius &&
        c > center - safeRadius &&
        c < center + safeRadius
      );
    };

    const svgContent = useMemo(() => {
      if (!matrix.length) return null;

      const dots: React.JSX.Element[] = [];
      const connections: React.JSX.Element[] = [];
      const cellSize = size / matrixSize;

      // Iterate
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (isFinderPattern(r, c)) continue;
          if (isSafeZone(r, c)) continue;

          const idx = r * matrixSize + c;
          if (matrix[idx]) {
            // Render Dot
            const cx = (c + 0.5) * cellSize;
            const cy = (r + 0.5) * cellSize;
            const radius = (cellSize / 2) * style.dotScale;

            dots.push(
              <circle
                key={`dot-${r}-${c}`}
                cx={cx}
                cy={cy}
                r={radius}
                fill={colors.fg}
                className="drop-shadow-sm"
              />,
            );

            // Render Connections (Right and Bottom only to avoid dupes)
            // Connect to Right
            if (
              c < matrixSize - 1 &&
              matrix[r * matrixSize + (c + 1)] &&
              !isFinderPattern(r, c + 1) &&
              !isSafeZone(r, c + 1)
            ) {
              connections.push(
                <line
                  key={`conn-h-${r}-${c}`}
                  x1={cx}
                  y1={cy}
                  x2={cx + cellSize}
                  y2={cy}
                  stroke={colors.fg}
                  strokeWidth={cellSize * 0.2}
                  strokeOpacity={style.connectivity}
                  strokeLinecap="round"
                />,
              );
            }
            // Connect to Bottom
            if (
              r < matrixSize - 1 &&
              matrix[(r + 1) * matrixSize + c] &&
              !isFinderPattern(r + 1, c) &&
              !isSafeZone(r + 1, c)
            ) {
              connections.push(
                <line
                  key={`conn-v-${r}-${c}`}
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={cy + cellSize}
                  stroke={colors.fg}
                  strokeWidth={cellSize * 0.2}
                  strokeOpacity={style.connectivity}
                  strokeLinecap="round"
                />,
              );
            }
          }
        }
      }

      // Render Finder Patterns (Custom Concentric Rings)
      const renderFinder = (originR: number, originC: number) => {
        const centerX = (originC + 3.5) * cellSize;
        const centerY = (originR + 3.5) * cellSize;

        return (
          <g key={`finder-${originR}-${originC}`}>
            {/* Outer Ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={cellSize * 3}
              fill="none"
              stroke={colors.accent}
              strokeWidth={cellSize * 0.8}
              filter="url(#glow)"
            />
            {/* Inner Ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={cellSize * 1.5}
              fill="none"
              stroke={colors.accent}
              strokeWidth={cellSize * 0.5}
            />
            {/* Core Dot */}
            <circle
              cx={centerX}
              cy={centerY}
              r={cellSize * 0.5}
              fill={colors.accent}
            />
          </g>
        );
      };

      const finders = [
        renderFinder(0, 0),
        renderFinder(0, matrixSize - 7),
        renderFinder(matrixSize - 7, 0),
      ];

      return (
        <>
          {connections}
          {dots}
          {finders}
        </>
      );
    }, [matrix, size, colors, style, logo]);

    return (
      <div
        className={cn(
          "relative flex items-center justify-center p-8 rounded-xl shadow-2xl",
          className,
        )}
        style={{ backgroundColor: colors.bg }}
      >
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <svg
            ref={ref}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill={colors.bg} />
            {svgContent}

            {/* Logo Overlay */}
            {logo?.url && (
              <image
                href={logo.url}
                x={size / 2 - size * 0.15}
                y={size / 2 - size * 0.15}
                width={size * 0.3}
                height={size * 0.3}
                className="rounded-full"
                preserveAspectRatio="xMidYMid slice"
              />
            )}
          </svg>
        )}
      </div>
    );
  },
);

QrEngine.displayName = "QrEngine";
