// Lightweight API utility to run code via Piston (free, no API key)
// Docs: https://github.com/engineer-man/piston

export type LanguageKey = "javascript" | "python" | "cpp" | "java";

export interface RunRequest {
  language: LanguageKey;
  code: string;
  stdin?: string;
  version?: string; // allow "*" to let Piston pick latest
}

export interface RunResult {
  stdout: string;
  stderr: string;
  output: string; // combined
  ranAt: number; // timestamp
  language: LanguageKey;
  time?: number; // ms
}

const languageMap: Record<LanguageKey, { runtime: string; defaultVersion?: string }> = {
  javascript: { runtime: "js", defaultVersion: "18.15.0" },
  python: { runtime: "python", defaultVersion: "3.10.0" },
  cpp: { runtime: "c++", defaultVersion: "10.2.0" },
  java: { runtime: "java", defaultVersion: "15.0.2" },
};

const PISTON_RUN_URL = "https://emkc.org/api/v2/piston/execute";

export async function runCode({ language, code, stdin, version }: RunRequest, timeoutMs = 20000): Promise<RunResult> {
  const lang = languageMap[language];
  if (!lang) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    language: lang.runtime,
    version: version ?? lang.defaultVersion ?? "*",
    files: [{ name: "main", content: code }],
    stdin: stdin ?? "",
  };

  const start = performance.now();
  try {
    const res = await fetch(PISTON_RUN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Piston error ${res.status}: ${text}`);
    }
    const data = await res.json();
    const time = Math.max(0, performance.now() - start);
    const stdout: string = data?.run?.stdout ?? "";
    const stderr: string = data?.run?.stderr ?? "";
    const output = [stdout, stderr].filter(Boolean).join("\n");
    return { stdout, stderr, output, ranAt: Date.now(), language, time };
  } catch (err: any) {
    clearTimeout(timer);
    const message = err?.name === "AbortError" ? "Execution timed out" : err?.message || String(err);
    return { stdout: "", stderr: message, output: message, ranAt: Date.now(), language };
  }
}

export async function listRuntimes(): Promise<any[]> {
  try {
    const res = await fetch("https://emkc.org/api/v2/piston/runtimes");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
