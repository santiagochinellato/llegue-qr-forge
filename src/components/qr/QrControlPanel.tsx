"use client";

import React from "react";
import { Upload, Shuffle, Settings2, Sliders } from "lucide-react";
import { QrConfig } from "./QrEngine";
import { cn } from "@/lib/utils";

interface QrControlPanelProps {
  config: QrConfig;
  onChange: (newConfig: QrConfig) => void;
}

const PRESETS = {
  cyberpunk: {
    name: "Cyberpunk",
    colors: { bg: "#09090b", fg: "#06b6d4", accent: "#d946ef" }, // Zinc-950, Cyan, Magenta
    style: { connectivity: 0.8, dotScale: 0.8 },
  },
  royal: {
    name: "Royal",
    colors: { bg: "#1e1b4b", fg: "#fbbf24", accent: "#3b82f6" }, // Indigo-950, Amber, Blue
    style: { connectivity: 0.3, dotScale: 0.9 },
  },
  matrix: {
    name: "Matrix",
    colors: { bg: "#022c22", fg: "#4ade80", accent: "#22c55e" }, // Emerald-950, Green-400, Green-500
    style: { connectivity: 1, dotScale: 0.6 },
  },
};

export function QrControlPanel({ config, onChange }: QrControlPanelProps) {
  const handleValuesChange = (key: keyof QrConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleStyleChange = (key: keyof QrConfig["style"], value: number) => {
    onChange({ ...config, style: { ...config.style, [key]: value } });
  };

  const handleColorChange = (key: keyof QrConfig["colors"], value: string) => {
    onChange({ ...config, colors: { ...config.colors, [key]: value } });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ ...config, logo: { file, url } });
    }
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    onChange({
      ...config,
      colors: preset.colors,
      style: preset.style,
    });
  };

  const randomize = () => {
    onChange({
      ...config,
      style: {
        connectivity: Math.random(),
        dotScale: 0.5 + Math.random() * 0.5,
      },
    });
  };

  return (
    <div className="bg-zinc-900 border-r border-zinc-800 h-full p-6 space-y-8 overflow-y-auto w-full text-zinc-300 font-mono">
      {/* Header */}
      <div className="flex items-center gap-3 text-teal-400 mb-6">
        <Settings2 className="w-6 h-6" />
        <h2 className="text-xl font-bold tracking-widest uppercase">
          Forge Controls
        </h2>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Target Data
        </label>
        <input
          type="text"
          value={config.value}
          onChange={(e) => handleValuesChange("value", e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded p-3 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
          placeholder="https://llegue.app..."
        />
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          System Presets
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs uppercase transition-colors"
            >
              {PRESETS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6 border-t border-zinc-800 pt-6">
        <div className="flex items-center justify-between text-teal-400">
          <label className="text-xs uppercase tracking-wider font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Neural Network
          </label>
          <button
            onClick={randomize}
            title="Randomize"
            className="hover:text-white transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Connectivity</span>
              <span>{Math.round(config.style.connectivity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.style.connectivity}
              onChange={(e) =>
                handleStyleChange("connectivity", parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Node Scale</span>
              <span>{Math.round(config.style.dotScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={config.style.dotScale}
              onChange={(e) =>
                handleStyleChange("dotScale", parseFloat(e.target.value))
              }
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3 border-t border-zinc-800 pt-6">
        <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Chromatics
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors.bg}
                onChange={(e) => handleColorChange("bg", e.target.value)}
                className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">
              Foreground
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors.fg}
                onChange={(e) => handleColorChange("fg", e.target.value)}
                className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">
              Accent
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-3 border-t border-zinc-800 pt-6">
        <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Branding
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-zinc-700 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors text-xs text-zinc-400"
          >
            <Upload className="w-4 h-4" />
            {config.logo?.file ? config.logo.file.name : "Upload Center Logo"}
          </label>
        </div>
        {config.logo?.url && (
          <button
            onClick={() => onChange({ ...config, logo: undefined })}
            className="text-xs text-red-500 hover:text-red-400 w-full text-right"
          >
            Remove Logo
          </button>
        )}
      </div>
    </div>
  );
}
