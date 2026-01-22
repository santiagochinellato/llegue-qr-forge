"use client";

import React, { useMemo, forwardRef } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface QrEngineProps {
  value: string;
  size?: number;
  logoUrl?: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
  };
  style: {
    connectivity: number;
    dotScale: number;
    mandalaComplexity: number; // 0 to 1
    showBorder: boolean;
  };
  className?: string; // Added back for flexibility
}

// Helper for polar coordinates
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const QrEngine = forwardRef<SVGSVGElement, QrEngineProps>(
  ({ value, size = 500, logoUrl, colors, style, className }, ref) => {
    const qrData = useMemo(() => {
      try {
        const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
        const modules = qr.modules;
        return {
          matrix: modules.data,
          size: modules.size,
          version: qr.version,
        };
      } catch (err) {
        console.error("Error generating QR", err);
        return null;
      }
    }, [value]);

    if (!qrData) return null;

    const { matrix, size: matrixSize } = qrData;
    // Calculate cell size based on a fixed coordinate system (e.g., 100x100 for the QR part)
    // We'll use a coordinate system where the QR is centered at 0,0 and spans width/height.
    const qrDimension = size * 0.6; // QR occupies 60% of the total drawing area to leave room for mandala
    const cellSize = qrDimension / matrixSize;
    const offset = -qrDimension / 2; // Center the QR

    const isFinderPattern = (r: number, c: number) => {
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= matrixSize - 7;
      const isBottomLeft = r >= matrixSize - 7 && c < 7;
      return isTopLeft || isTopRight || isBottomLeft;
    };

    const finders = [
      { r: 3.5, c: 3.5 }, // Top Left
      { r: 3.5, c: matrixSize - 3.5 }, // Top Right
      { r: matrixSize - 3.5, c: 3.5 }, // Bottom Left
    ];

    // --- LAYER A: MANDALA FRAME ---
    const renderMandalaLayer = () => {
      if (!style.showBorder) return null;

      const elements: React.JSX.Element[] = [];
      const complexity = style.mandalaComplexity || 0.5;
      const center = 0;

      // Ring 1: Tech Arcs
      const r1 = (size / 2) * 0.65;
      const dashCount = Math.floor(12 + complexity * 24);
      const arcLength = 360 / dashCount;

      for (let i = 0; i < dashCount; i++) {
        if (i % 2 === 0) continue; // Gaps
        const startAngle = i * arcLength;
        const endAngle = startAngle + arcLength * 0.7;
        const start = polarToCartesian(center, center, r1, startAngle);
        const end = polarToCartesian(center, center, r1, endAngle);

        // Arc path
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [
          "M",
          start.x,
          start.y,
          "A",
          r1,
          r1,
          0,
          largeArcFlag,
          1,
          end.x,
          end.y,
        ].join(" ");

        elements.push(
          <path
            key={`ring1-${i}`}
            d={d}
            stroke={colors.accent}
            strokeWidth={size * 0.005}
            fill="none"
            opacity={0.6}
          />,
        );
      }

      // Ring 2: Dots
      const r2 = (size / 2) * 0.8;
      const dotCount = Math.floor(20 + complexity * 40);
      for (let i = 0; i < dotCount; i++) {
        const angle = (360 / dotCount) * i;
        const pos = polarToCartesian(center, center, r2, angle);
        elements.push(
          <circle
            key={`ring2-${i}`}
            cx={pos.x}
            cy={pos.y}
            r={size * 0.004}
            fill={colors.accent}
            opacity={0.4}
          />,
        );
      }

      // Ring 3: Runes / Dashes (Outer)
      if (complexity > 0.3) {
        const r3 = (size / 2) * 0.95;
        const runeCount = 8;
        for (let i = 0; i < runeCount; i++) {
          const angle = (360 / runeCount) * i;
          const pos = polarToCartesian(center, center, r3, angle);
          // Draw a small T shape or bracket
          elements.push(
            <g
              key={`ring3-${i}`}
              transform={`rotate(${angle}, ${pos.x}, ${pos.y})`}
            >
              <line
                x1={pos.x - 5}
                y1={pos.y}
                x2={pos.x + 5}
                y2={pos.y}
                stroke={colors.accent}
                strokeWidth={2}
                opacity={0.5}
              />
              <line
                x1={pos.x}
                y1={pos.y - 5}
                x2={pos.x}
                y2={pos.y + 5}
                stroke={colors.accent}
                strokeWidth={2}
                opacity={0.5}
              />
            </g>,
          );
        }
      }

      return <g className="mandala-frame">{elements}</g>;
    };

    // --- LAYER B: DATA NETWORK ---
    const renderDataLayer = () => {
      const dots: React.JSX.Element[] = [];
      const conns: React.JSX.Element[] = [];

      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (isFinderPattern(r, c)) continue;

          const index = r * matrixSize + c;
          if (matrix[index]) {
            const x = offset + c * cellSize + cellSize / 2;
            const y = offset + r * cellSize + cellSize / 2;

            // Logo Safety
            const absCenter = 0;
            const dist = Math.sqrt((x - absCenter) ** 2 + (y - absCenter) ** 2);
            if (logoUrl && dist < qrDimension * 0.15) continue;

            // Node
            dots.push(
              <circle
                key={`d-${r}-${c}`}
                cx={x}
                cy={y}
                r={(cellSize * style.dotScale) / 2}
                fill={colors.foreground}
              />,
            );

            // Connections
            const renderConn = (
              r2: number,
              c2: number,
              key: string,
              isVertical: boolean,
            ) => {
              const idx2 = r2 * matrixSize + c2;
              if (matrix[idx2] && !isFinderPattern(r2, c2)) {
                const x2 = offset + c2 * cellSize + cellSize / 2;
                const y2 = offset + r2 * cellSize + cellSize / 2;
                conns.push(
                  <line
                    key={key}
                    x1={x}
                    y1={y}
                    x2={x2}
                    y2={y2}
                    stroke={colors.foreground}
                    strokeWidth={cellSize * 0.15} // Thin for print
                    strokeOpacity={style.connectivity}
                    strokeLinecap="round"
                  />,
                );
              }
            };

            if (c < matrixSize - 1) renderConn(r, c + 1, `h-${r}-${c}`, false);
            if (r < matrixSize - 1) renderConn(r + 1, c, `v-${r}-${c}`, true);
          }
        }
      }
      return (
        <g className="data-network">
          {conns}
          {dots}
        </g>
      );
    };

    // --- LAYER C: POWER ORBS ---
    const renderPowerOrbs = () => {
      return finders.map((f, i) => {
        const cx = offset + f.c * cellSize;
        const cy = offset + f.r * cellSize;
        const moduleSize = cellSize;

        // Exact 7-module size is 7 * cellSize. Radius is 3.5 * cellSize.
        const outerR = 3 * moduleSize;

        return (
          <g key={`orb-${i}`}>
            {/* Ring 1: Outer Thick */}
            <circle
              cx={cx}
              cy={cy}
              r={outerR}
              fill="none"
              stroke={colors.accent}
              strokeWidth={moduleSize * 0.8}
            />
            {/* Ring 2: Gap (Implicit) */}
            {/* Ring 3: Middle Thin */}
            <circle
              cx={cx}
              cy={cy}
              r={outerR * 0.65}
              fill="none"
              stroke={colors.accent}
              strokeWidth={moduleSize * 0.2}
            />
            {/* Ring 4: Solid Core */}
            <circle cx={cx} cy={cy} r={moduleSize * 1.2} fill={colors.accent} />
          </g>
        );
      });
    };

    return (
      <div
        className={cn(
          "inline-flex items-center justify-center bg-transparent",
          className,
        )}
      >
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} // Centered coordinate system
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect
            x={-size / 2}
            y={-size / 2}
            width={size}
            height={size}
            fill={colors.background}
          />

          {/* Layers */}
          {renderMandalaLayer()}
          {renderDataLayer()}
          {renderPowerOrbs()}

          {/* Logo */}
          {logoUrl && (
            <g>
              <clipPath id="logoClip">
                <circle cx={0} cy={0} r={qrDimension * 0.15} />
              </clipPath>
              <image
                href={logoUrl}
                x={-(qrDimension * 0.15)}
                y={-(qrDimension * 0.15)}
                width={qrDimension * 0.3}
                height={qrDimension * 0.3}
                clipPath="url(#logoClip)"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          )}
        </svg>
      </div>
    );
  },
);

QrEngine.displayName = "QrEngine";
