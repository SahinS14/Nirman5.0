"use client";
import { useState, useRef, useEffect } from "react";
import { runCode, type LanguageKey } from "@/utils/runCode";

const languages: { key: LanguageKey; label: string }[] = [
  { key: "javascript", label: "JavaScript" },
  { key: "python", label: "Python" },
  { key: "cpp", label: "C++" },
  { key: "java", label: "Java" },
];

export default function CodeRunner() {
  const [language, setLanguage] = useState<LanguageKey>("javascript");
  const [code, setCode] = useState<string>("console.log('Hello World')");
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const outRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (outRef.current) {
      outRef.current.scrollTop = outRef.current.scrollHeight;
    }
  }, [output]);

  const onRun = async () => {
    // Clear previous output immediately
    setOutput("");
    setRunning(true);
    try {
      const res = await runCode({ language, code, stdin, version: "*" });
      setOutput(res.output || "");
    } catch (err: any) {
      const message = err?.message ? String(err.message) : String(err);
      setOutput(message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-3 pointer-events-auto relative z-[9999]">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Language</label>
        <select
          className="border rounded px-2 py-1"
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageKey)}
        >
          {languages.map((l) => (
            <option key={l.key} value={l.key}>
              {l.label}
            </option>
          ))}
        </select>
        <div
          className="ml-auto relative z-50 pointer-events-auto"
          onClick={(e) => {
            // Prevent parent containers from hijacking the click
            e.stopPropagation();
          }}
        >
          <button
            className="bg-indigo-600 text-white px-3 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onRun();
            }}
            disabled={running}
          >
            {running ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      <textarea
        className="w-full h-64 border rounded p-2 font-mono text-sm"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here"
      />

      <div>
        <label className="text-sm font-medium">Input (stdin)</label>
        <textarea
          className="w-full h-24 border rounded p-2 font-mono text-sm mt-1"
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Optional input passed to program"
        />
      </div>

      <div className="border rounded p-2 bg-black text-green-300 h-40 overflow-auto" ref={outRef}>
        <div className="text-xs text-gray-400 mb-1">Output</div>
        <pre className="whitespace-pre-wrap break-words text-sm">
          {running ? "⏳ Executing..." : output || "Run the code to see output."}
        </pre>
      </div>
    </div>
  );
}
