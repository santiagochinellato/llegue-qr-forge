"use client";

import React, { useRef, useState } from "react";
import { QrEngine } from "@/components/qr/QrEngine";
import { QrControlPanel, QrConfigState } from "@/components/qr/QrControlPanel";
import { downloadPng, downloadSvg } from "@/lib/download-utils";
import { Download, FileCode } from "lucide-react";

const INITIAL_CONFIG: QrConfigState = {
  value: "https://llegue.app",
  colors: {
    background: "#09090b",
    foreground: "#06b6d4",
    accent: "#d946ef",
  },
  style: {
    connectivity: 0.8,
    dotScale: 0.7,
  },
};

export default function Home() {
  const [config, setConfig] = useState<QrConfigState>(INITIAL_CONFIG);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownloadSvg = () => {
    if (svgRef.current) downloadSvg(svgRef.current, `llegue-qr-${Date.now()}`);
  };

  const handleDownloadPng = () => {
    if (svgRef.current) downloadPng(svgRef.current, `llegue-qr-${Date.now()}`);
  };

  return (
    <main className="h-screen w-screen flex bg-zinc-950 overflow-hidden text-zinc-100">
      {/* Left Interface */}
      <aside className="w-[400px] h-full flex-shrink-0 z-10 relative shadow-2xl">
        <QrControlPanel config={config} onChange={setConfig} />
      </aside>

      {/* Right Preview */}
      <section className="flex-1 relative flex flex-col items-center justify-center p-12 bg-[#050505] bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Glow Effects */}
        <div
          className="absolute pointer-events-none w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] transition-colors duration-500"
          style={{ backgroundColor: config.colors.accent }}
        />

        <div className="relative group z-10 scale-90 md:scale-100 lg:scale-110 transition-all duration-500">
          <QrEngine
            ref={svgRef}
            value={config.value}
            colors={config.colors}
            style={config.style}
            logoUrl={config.logo?.url || undefined}
            size={500}
            className="shadow-2xl border border-zinc-800/50"
          />
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-12 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md p-4 rounded-xl border border-zinc-800">
          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 rounded-lg transition-all font-mono text-sm uppercase tracking-wide"
          >
            <FileCode className="w-4 h-4" />
            SVG (Print)
          </button>
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg shadow-teal-500/20 transition-all font-mono text-sm uppercase tracking-wide font-bold"
          >
            <Download className="w-4 h-4" />
            PNG (Digital)
          </button>
        </div>
      </section>
    </main>
  );
}
