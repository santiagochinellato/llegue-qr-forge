"use client";

import React from "react";
import { Upload, Shuffle, Settings2, Sliders, Layers } from "lucide-react";

export interface QrConfigState {
  value: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
  };
  style: {
    connectivity: number;
    dotScale: number;
    mandalaComplexity: number;
    showBorder: boolean;
  };
  logo?: {
    file: File | null;
    url: string | null;
  };
}

interface QrControlPanelProps {
  config: QrConfigState;
  onChange: (newConfig: QrConfigState) => void;
}

const PRESETS = {
  cyberpunk: {
    name: "Cyberpunk",
    colors: { background: "#09090b", foreground: "#06b6d4", accent: "#d946ef" },
    style: {
      connectivity: 0.8,
      dotScale: 0.8,
      mandalaComplexity: 0.8,
      showBorder: true,
    },
  },
  royal: {
    name: "Royal Security",
    colors: { background: "#1e1b4b", foreground: "#fbbf24", accent: "#f59e0b" },
    style: {
      connectivity: 0.3,
      dotScale: 0.9,
      mandalaComplexity: 0.6,
      showBorder: true,
    },
  },
  matrix: {
    name: "Matrix",
    colors: { background: "#022c22", foreground: "#4ade80", accent: "#22c55e" },
    style: {
      connectivity: 1,
      dotScale: 0.6,
      mandalaComplexity: 0.9,
      showBorder: true,
    },
  },
};

export function QrControlPanel({ config, onChange }: QrControlPanelProps) {
  const handleValuesChange = (key: keyof QrConfigState, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleStyleChange = (key: keyof QrConfigState["style"], value: any) => {
    onChange({ ...config, style: { ...config.style, [key]: value } });
  };

  const handleColorChange = (
    key: keyof QrConfigState["colors"],
    value: string,
  ) => {
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

  return (
    <div className="bg-zinc-900 border-r border-zinc-800 h-full p-6 space-y-8 overflow-y-auto w-full text-zinc-300 font-mono">
      {/* Header */}
      <div className="flex items-center gap-3 text-teal-400 mb-6">
        <Settings2 className="w-6 h-6" />
        <h2 className="text-xl font-bold tracking-widest uppercase">
          Forge Controls V3
        </h2>
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

      {/* Sliders */}
      <div className="space-y-6 border-t border-zinc-800 pt-6">
        <div className="flex items-center gap-2 text-teal-400">
          <Sliders className="w-4 h-4" />
          <label className="text-xs uppercase tracking-wider font-bold">
            Parameters
          </label>
        </div>

        <div className="space-y-4">
          {/* Mandala Complexity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Mandala Complexity</span>
              <span>{Math.round(config.style.mandalaComplexity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.style.mandalaComplexity}
              onChange={(e) =>
                handleStyleChange(
                  "mandalaComplexity",
                  parseFloat(e.target.value),
                )
              }
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>
          {/* Connectivity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Synapse Opacity</span>
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
          {/* Dot Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Node Size</span>
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

          {/* Border Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="showBorder"
              checked={config.style.showBorder}
              onChange={(e) =>
                handleStyleChange("showBorder", e.target.checked)
              }
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-teal-500 focus:ring-teal-500"
            />
            <label htmlFor="showBorder" className="text-sm text-zinc-400">
              Show Neural Shield (Border)
            </label>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3 border-t border-zinc-800 pt-6">
        <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Pigments
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors.background}
                onChange={(e) =>
                  handleColorChange("background", e.target.value)
                }
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
                value={config.colors.foreground}
                onChange={(e) =>
                  handleColorChange("foreground", e.target.value)
                }
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
          Logo
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
            {config.logo?.file ? config.logo.file.name : "Upload Image"}
          </label>
        </div>
      </div>
    </div>
  );
}
