"use client";

import React, { useMemo, forwardRef } from "react";
import QRCode from "qrcode";

interface QrEngineProps {
  value: string;
  size?: number;
  logoUrl?: string; // Changed from logo object
  colors: {
    background: string; // Changed from bg
    foreground: string; // Changed from fg
    accent: string;
  };
  style: {
    connectivity: number;
    dotScale: number;
  };
  className?: string; // Added back for flexibility
}

export const QrEngine = forwardRef<SVGSVGElement, QrEngineProps>(
  ({ value, size = 300, logoUrl, colors, style, className }, ref) => {
    // 1. Generamos la Matriz Lógica (Ceros y Unos puros)
    const qrData = useMemo(() => {
      try {
        const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
        const modules = qr.modules; // Matriz 2D
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
    const cellSize = size / matrixSize;

    // Helpers para identificar si una coordenada es parte de los "Ojos" (Finder Patterns)
    const isFinderPattern = (r: number, c: number) => {
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= matrixSize - 7;
      const isBottomLeft = r >= matrixSize - 7 && c < 7;
      return isTopLeft || isTopRight || isBottomLeft;
    };

    const finders = [
      { cx: 3.5 * cellSize, cy: 3.5 * cellSize }, // Top Left
      { cx: (matrixSize - 3.5) * cellSize, cy: 3.5 * cellSize }, // Top Right
      { cx: 3.5 * cellSize, cy: (matrixSize - 3.5) * cellSize }, // Bottom Left
    ];

    // Elementos SVG
    const connections: React.JSX.Element[] = [];
    const dots: React.JSX.Element[] = [];

    // 2. Algoritmo de Renderizado "Red Neuronal"
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (isFinderPattern(r, c)) continue;

        const index = r * matrixSize + c;
        const isActive = matrix[index];

        if (isActive) {
          const x = c * cellSize + cellSize / 2;
          const y = r * cellSize + cellSize / 2;

          // A. PUNTOS (Nodos)
          const center = matrixSize / 2;
          const dist = Math.sqrt((r - center) ** 2 + (c - center) ** 2);
          if (logoUrl && dist < matrixSize * 0.15) continue; // Hueco para logo

          dots.push(
            <circle
              key={`dot-${r}-${c}`}
              cx={x}
              cy={y}
              r={(cellSize * style.dotScale) / 2}
              fill={colors.foreground}
              className="drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
            />,
          );

          // B. CONEXIONES
          // Vecino Derecho
          if (c < matrixSize - 1) {
            const rightIndex = r * matrixSize + (c + 1);
            if (matrix[rightIndex] && !isFinderPattern(r, c + 1)) {
              connections.push(
                <line
                  key={`conn-h-${r}-${c}`}
                  x1={x}
                  y1={y}
                  x2={x + cellSize}
                  y2={y}
                  stroke={colors.foreground}
                  strokeWidth={cellSize * 0.15}
                  strokeOpacity={style.connectivity}
                  strokeLinecap="round"
                />,
              );
            }
          }

          // Vecino Abajo
          if (r < matrixSize - 1) {
            const bottomIndex = (r + 1) * matrixSize + c;
            if (matrix[bottomIndex] && !isFinderPattern(r + 1, c)) {
              connections.push(
                <line
                  key={`conn-v-${r}-${c}`}
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={y + cellSize}
                  stroke={colors.foreground}
                  strokeWidth={cellSize * 0.15}
                  strokeOpacity={style.connectivity}
                  strokeLinecap="round"
                />,
              );
            }
          }
        }
      }
    }

    return (
      <div
        className={`relative flex items-center justify-center p-8 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10 ${className || ""}`}
      >
        {/* 3. ANILLO DECORATIVO "MANDALA" */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none overflow-hidden">
          <svg
            width="140%"
            height="140%"
            viewBox="0 0 100 100"
            className="animate-[spin_20s_linear_infinite]"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={colors.accent}
              strokeWidth="0.5"
              strokeDasharray="4 2"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={colors.accent}
              strokeWidth="0.2"
            />
          </svg>
        </div>

        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ backgroundColor: colors.background }}
          className="rounded-lg shadow-2xl"
        >
          <rect width="100%" height="100%" fill={colors.background} />

          {/* Capa 1: La Red Neuronal (Líneas) */}
          <g className="mix-blend-screen">{connections}</g>

          {/* Capa 2: Los Nodos (Puntos) */}
          <g className="mix-blend-screen">{dots}</g>

          {/* Capa 3: Los PORTALES (Finder Patterns Customizados) */}
          {finders.map((f, i) => (
            <g key={`finder-${i}`}>
              {/* Anillo Exterior */}
              <circle
                cx={f.cx}
                cy={f.cy}
                r={cellSize * 3}
                fill="none"
                stroke={colors.accent}
                strokeWidth={cellSize * 0.8}
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
              {/* Punto Central (Singularidad) */}
              <circle
                cx={f.cx}
                cy={f.cy}
                r={cellSize * 1.2}
                fill={colors.accent}
                className="animate-pulse"
              />
            </g>
          ))}

          {/* Capa 4: Logo Central */}
          {logoUrl && (
            <image
              x={size / 2 - size * 0.15}
              y={size / 2 - size * 0.15}
              width={size * 0.3}
              height={size * 0.3}
              href={logoUrl}
              className="rounded-full"
              style={{ clipPath: "circle(50%)" }}
              preserveAspectRatio="xMidYMid slice"
            />
          )}
        </svg>
      </div>
    );
  },
);

QrEngine.displayName = "QrEngine";
