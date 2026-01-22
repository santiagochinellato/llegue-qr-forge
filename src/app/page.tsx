"use client";

import React, { useState, useRef } from "react";
import { QrEngine } from "@/components/qr/QrEngine";
import { QrCode, Download, Link, Type, Palette } from "lucide-react";
import { downloadCanvasAsPng } from "@/lib/download-utils";
import { cn } from "@/lib/utils";

export default function Home() {
  const [content, setContent] = useState("https://example.com");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    if (canvasRef.current && content) {
      downloadCanvasAsPng(canvasRef.current, `qr-code-${Date.now()}`);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 flex flex-col items-center justify-center font-sans tracking-tight">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Editor Section */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
              Llegue QR Forge
            </h1>
            <p className="text-neutral-400 text-lg">
              Create beautiful, high-quality QR codes instantly.
            </p>
          </div>

          <div className="space-y-6 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm">
            {/* Content Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                <Link className="w-4 h-4" /> Content (URL or Text)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://your-website.com"
                  className="w-full bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Background
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-sm text-neutral-400 font-mono uppercase">
                    {bgColor}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Foreground
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-sm text-neutral-400 font-mono uppercase">
                    {fgColor}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleDownload}
                disabled={!content}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all",
                  content
                    ? "bg-teal-500 hover:bg-teal-400 text-neutral-950 shadow-lg shadow-teal-500/20"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
                )}
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center space-y-6 lg:sticky lg:top-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <QrEngine
              ref={canvasRef}
              content={content}
              size={350}
              bgColor={bgColor}
              fgColor={fgColor}
              className="relative"
            />
          </div>
          <p className="text-sm text-neutral-500">
            Preview updates automatically as you type.
          </p>
        </div>
      </div>
    </main>
  );
}
