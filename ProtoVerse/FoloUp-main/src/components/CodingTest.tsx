"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { runCode, type LanguageKey, type RunResult } from "@/utils/runCode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type ThemeKey = "vs-dark" | "light" | "hc-black";

const defaultSamples: Record<LanguageKey, string> = {
  javascript: `// JS sample\nfunction solve(input){\n  return input.split("\\n").map((l,i)=>\"#\"+i+\": "+l).join("\\n");\n}\nconsole.log(solve(require('fs').readFileSync(0,'utf8')));`,
  python: `# Python sample\nimport sys\nfor i, line in enumerate(sys.stdin.read().splitlines()):\n    print(f"#{i}: {line}")`,
  cpp: `// C++ sample\n#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);cin.tie(nullptr);\n    string s; int i=0;\n    while(getline(cin,s)){ cout << \"#\"<<i++<<\": \"<<s<<"\\n"; }\n    return 0;\n}`,
  java: `// Java sample\nimport java.io.*;\npublic class Main{\n  public static void main(String[] args) throws Exception{\n    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n    String line; int i=0;\n    while((line=br.readLine())!=null){ System.out.println("#"+i+++": "+line); }\n  }\n}`,
};

const languageDisplay: { key: LanguageKey; label: string }[] = [
  { key: "javascript", label: "JavaScript" },
  { key: "python", label: "Python" },
  { key: "cpp", label: "C++" },
  { key: "java", label: "Java" },
];

function autoDetectLanguage(code: string): LanguageKey {
  const trimmed = code.trim();
  if (/^#\!\/usr\/bin\/(env )?python|^import\s+sys|def\s+\w+\(/i.test(trimmed)) return "python";
  if (/^(#include\s+<)|std::|using\s+namespace/i.test(trimmed)) return "cpp";
  if (/class\s+\w+\s*\{|public\s+class|System\.out\.println/i.test(trimmed)) return "java";
  return "javascript";
}

export default function CodingTest() {
  const [language, setLanguage] = useState<LanguageKey>("javascript");
  const [theme, setTheme] = useState<ThemeKey>("vs-dark");
  const [code, setCode] = useState<string>(defaultSamples.javascript);
  const [stdin, setStdin] = useState<string>("Hello\nWorld");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<RunResult[]>([]);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const outputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (result && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result]);

  const languageOptions = useMemo(() => languageDisplay, []);

  const onRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await runCode({ language, code, stdin });
      setResult(res);
      setHistory((prev) => [res, ...prev].slice(0, 25));
      if (res.stderr) {
        toast.error("Execution finished with errors.");
      } else {
        toast.success("Execution finished.");
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      setResult({ stdout: "", stderr: msg, output: msg, ranAt: Date.now(), language });
      toast.error("Execution failed.");
    } finally {
      setRunning(false);
    }
  };

  const onClear = () => {
    setResult(null);
    setStdin("");
  };

  const onAutoDetect = () => {
    const detected = autoDetectLanguage(code);
    setLanguage(detected);
    toast.info(`Detected language: ${detected}`);
    if (!code.trim()) setCode(defaultSamples[detected]);
  };

  const applySample = (lang: LanguageKey) => {
    setLanguage(lang);
    setCode(defaultSamples[lang]);
  };

  return (
    <div className="w-full h-full p-4">
      <Card className="w-full h-full">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>Coding Test</CardTitle>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={language} onValueChange={(v) => setLanguage(v as LanguageKey)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((l) => (
                  <SelectItem key={l.key} value={l.key}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={theme} onValueChange={(v) => setTheme(v as ThemeKey)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="hc-black">High Contrast</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="secondary" onClick={onAutoDetect}>Auto Detect</Button>
            <Button variant="secondary" onClick={() => applySample(language)}>Load Sample</Button>
            <Button className="bg-indigo-600 text-white" onClick={onRun} disabled={running}>
              {running ? "Running..." : "Run Code"}
            </Button>
            <Button variant="outline" onClick={onClear}>Clear</Button>
            <Button variant="ghost" onClick={() => setConsoleCollapsed((c) => !c)}>
              {consoleCollapsed ? "Show Output" : "Hide Output"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh]">
          {/* Left: Editor + Input */}
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-[300px] border rounded overflow-hidden">
              <MonacoEditor
                height="100%"
                defaultLanguage={language === "cpp" ? "cpp" : language}
                language={language === "cpp" ? "cpp" : language}
                theme={theme}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
              />
            </div>

            <div className="mt-3">
              <label className="text-sm font-medium">Custom Input</label>
              <Textarea
                className="mt-1"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder={"Enter input passed to stdin"}
                rows={6}
              />
            </div>
          </div>

          {/* Right: Output */}
          <div className={`flex flex-col h-full ${consoleCollapsed ? "hidden lg:flex" : "flex"}`}>
            <div className="flex-1 border rounded p-2 bg-black text-green-300 overflow-auto" ref={outputRef}>
              <div className="text-xs text-gray-400 mb-2">
                {result ? (
                  <span>
                    Ran: {new Date(result.ranAt).toLocaleTimeString()} | Lang: {result.language}
                    {result.time ? ` | ${Math.round(result.time)} ms` : ""}
                  </span>
                ) : (
                  <span>Output console</span>
                )}
              </div>
              <pre className="whitespace-pre-wrap break-words text-sm">
                {running ? "⏳ Executing..." : result?.output || "Run the code to see output."}
              </pre>
            </div>

            {/* History */}
            <div className="mt-3 border rounded p-2">
              <div className="text-sm font-semibold mb-1">Execution History</div>
              <div className="space-y-1 max-h-40 overflow-auto">
                {history.length === 0 && <div className="text-xs text-gray-500">No runs yet</div>}
                {history.map((h, idx) => (
                  <div key={idx} className="text-xs flex justify-between gap-2">
                    <span>{new Date(h.ranAt).toLocaleTimeString()}</span>
                    <span>{h.language}</span>
                    <span className={h.stderr ? "text-red-500" : "text-green-600"}>{h.stderr ? "error" : "ok"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
