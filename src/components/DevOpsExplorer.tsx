import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Server, Layers, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

export const DevOpsExplorer: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedConfigFile, setSelectedConfigFile] = useState<string>('package-json');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const commandSnippets = [
    {
      id: 'dev-server',
      label: 'Start Development Server',
      desc: 'Boots the full-stack Node.js + Express backend with integrated Vite middleware on port 3000.',
      command: 'npm run dev',
    },
    {
      id: 'build-prod',
      label: 'Compile Production Bundle',
      desc: 'Builds client assets via Vite and bundles server.ts into dist/server.cjs using esbuild.',
      command: 'npm run build',
    },
    {
      id: 'start-prod',
      label: 'Run Production Server',
      desc: 'Executes the standalone, bundled CommonJS server serving static files and API routes.',
      command: 'npm start',
    },
    {
      id: 'type-check',
      label: 'Execute Type Safety Check',
      desc: 'Validates complete TypeScript compiler type constraints across client and server.',
      command: 'npm run lint',
    },
  ];

  const configFiles: Record<string, { filename: string; language: string; content: string }> = {
    'package-json': {
      filename: 'package.json',
      language: 'json',
      content: `{
  "name": "healthguide-ai",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  }
}`,
    },
    'server-entry': {
      filename: 'server.ts',
      language: 'typescript',
      content: `import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

// 1. Health Diagnostics
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "HealthGuide AI Gateway",
    timestamp: new Date().toISOString(),
  });
});

// 2. Clinical Symptom Assessment
app.post("/api/assess", async (req, res) => {
  // Deterministic emergency red-flag interceptors + Gemini 3.7 Flash
});

// 3. Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
  });
}

startServer();`,
    },
    'env-example': {
      filename: '.env.example',
      language: 'bash',
      content: `# ==============================================================================
# HealthGuide AI - Environment Configuration
# ==============================================================================

# Gemini API Key for server-side clinical intelligence & triage assistance.
# In Google AI Studio, this is managed automatically via Settings > Secrets.
GEMINI_API_KEY=`,
    },
    'metadata-json': {
      filename: 'metadata.json',
      language: 'json',
      content: `{
  "name": "HealthGuide AI",
  "description": "Evidence-based health intelligence platform with interactive symptom guidance, clinical safety guardrails, and integrative Allopathic & Ayurvedic wellness analysis.",
  "requestFramePermissions": [],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}`,
    },
  };

  return (
    <div className="space-y-8">
      {/* CLI & Quick Action Snippets */}
      <div>
        <div className="border-b-2 border-[#1A1A1A] pb-3 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666] block mb-1">
            Build & Runtime Commands
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Developer Operations & Single-Port Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commandSnippets.map((cmd) => (
            <div key={cmd.id} className="border-2 border-[#1A1A1A] bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm uppercase tracking-tight text-[#1A1A1A]">
                    {cmd.label}
                  </h4>
                </div>
                <p className="text-xs text-[#555] mb-3">{cmd.desc}</p>
              </div>

              <div className="bg-[#1A1A1A] text-white p-3 font-mono text-xs flex items-center justify-between gap-3">
                <code className="text-emerald-300 overflow-x-auto whitespace-nowrap">$ {cmd.command}</code>
                <button
                  onClick={() => copyToClipboard(cmd.command, cmd.id)}
                  className="p-1.5 hover:bg-white/20 border border-white/30 text-white cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedKey === cmd.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration File Inspector */}
      <div className="border-2 border-[#1A1A1A] bg-white">
        <div className="border-b-2 border-[#1A1A1A] bg-[#FAF9F6] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#1A1A1A]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Architecture & Config Manifest
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {Object.keys(configFiles).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedConfigFile(key)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                  selectedConfigFile === key
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-[#555] hover:text-[#1A1A1A] border-black/20'
                }`}
              >
                {configFiles[key].filename}
              </button>
            ))}
          </div>
        </div>

        {/* Code Display */}
        <div className="p-4 md:p-6 bg-[#1A1A1A] text-white font-mono text-xs overflow-x-auto">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-white/20 text-[11px] text-white/60">
            <span>FILE: {configFiles[selectedConfigFile].filename}</span>
            <button
              onClick={() =>
                copyToClipboard(configFiles[selectedConfigFile].content, selectedConfigFile)
              }
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white cursor-pointer"
            >
              {copiedKey === selectedConfigFile ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy File Content</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-white/90 leading-relaxed">
            {configFiles[selectedConfigFile].content}
          </pre>
        </div>
      </div>
    </div>
  );
};
