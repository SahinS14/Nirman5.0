"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { X, Copy, Check, Code2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { runCode } from "@/utils/runCode";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
  isCodingRound?: boolean;
  codingRoundTime?: number;
  codingRoundDuration?: number;
  onEndCodingRound?: () => void;
}

export function CodeEditor({ 
  isOpen, 
  onClose, 
  themeColor, 
  isCodingRound = false, 
  codingRoundTime = 0, 
  codingRoundDuration = 45, 
  onEndCodingRound 
}: CodeEditorProps) {
  const [code, setCode] = useState<string>(`// Write your solution here\n`);
  const [language, setLanguage] = useState<string>("javascript");
  const [copied, setCopied] = useState(false);
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState<boolean>(false);
  const [selectedDSA, setSelectedDSA] = useState<string>("twoSum");
  const [theme, setTheme] = useState<"vs-dark"|"light"|"hc-black">("vs-dark");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = (codingRoundDuration * 60) - codingRoundTime;
  const isTimeUp = remainingTime <= 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    setCode(`// Write your solution in ${e.target.value}\n`);
  };

  const onRun = async () => {
    setOutput("");
    setRunning(true);
    try {
      const res = await runCode({ language: language as any, code, stdin, version: "*" });
      setOutput(res.output || "");
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : String(err);
      setOutput(msg);
    } finally {
      setRunning(false);
    }
  };

  // DSA question presets - NO SOLUTIONS, only problem statements
  const dsaPresets: Record<string, { title: string; description: string; difficulty: string; samples: { stdin: string; expected?: string }[] }> = {
    twoSum: {
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. Input format: First line contains n (array size), second line contains n space-separated integers, third line contains the target.",
      samples: [
        { stdin: "5\n2 7 11 15 1\n9", expected: "0 1" },
        { stdin: "4\n3 2 4 5\n6", expected: "1 2" },
      ],
    },
    validParentheses: {
      title: "Valid Parentheses",
      difficulty: "Easy",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
      samples: [ 
        { stdin: "()[]{}", expected: "true" }, 
        { stdin: "(]", expected: "false" }, 
        { stdin: "({[]})", expected: "true" } 
      ],
    },
    binarySearch: {
      title: "Binary Search",
      difficulty: "Easy",
      description: "Given a sorted array of integers nums and a target value, write a function to search target in nums. If target exists, return its index, otherwise return -1. You must write an algorithm with O(log n) runtime complexity. Input format: First line contains n (array size), second line contains n space-separated sorted integers, third line contains the target.",
      samples: [ 
        { stdin: "5\n1 3 5 7 9\n7", expected: "3" }, 
        { stdin: "4\n2 4 6 8\n3", expected: "-1" } 
      ],
    },
    longestSubstring: {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      description: "Given a string s, find the length of the longest substring without repeating characters. For example, given 'abcabcbb', the answer is 'abc' with length 3.",
      samples: [
        { stdin: "abcabcbb", expected: "3" },
        { stdin: "bbbbb", expected: "1" },
        { stdin: "pwwkew", expected: "3" }
      ],
    },
    groupAnagrams: {
      title: "Group Anagrams",
      difficulty: "Medium",
      description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase. Input format: First line contains n (number of strings), second line contains n space-separated strings.",
      samples: [
        { stdin: "6\neat tea tan ate nat bat", expected: "ate eat tea\nnat tan\nbat" },
        { stdin: "1\na", expected: "a" }
      ],
    },
    productExceptSelf: {
      title: "Product of Array Except Self",
      difficulty: "Medium",
      description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The algorithm must run in O(n) time and without using the division operation. Input format: First line contains n, second line contains n space-separated integers.",
      samples: [
        { stdin: "4\n1 2 3 4", expected: "24 12 8 6" },
        { stdin: "5\n-1 1 0 -3 3", expected: "0 0 9 0 0" }
      ],
    },
    mergeIntervals: {
      title: "Merge Intervals",
      difficulty: "Medium",
      description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input. Input format: First line contains n (number of intervals), next n lines each contain two space-separated integers representing start and end.",
      samples: [ 
        { stdin: "4\n1 3\n2 6\n8 10\n15 18", expected: "1 6\n8 10\n15 18" }, 
        { stdin: "2\n1 4\n4 5", expected: "1 5" } 
      ],
    },
    rotateImage: {
      title: "Rotate Image",
      difficulty: "Medium",
      description: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. Input format: First line contains n, next n lines each contain n space-separated integers.",
      samples: [
        { stdin: "3\n1 2 3\n4 5 6\n7 8 9", expected: "7 4 1\n8 5 2\n9 6 3" },
        { stdin: "2\n1 2\n3 4", expected: "3 1\n4 2" }
      ],
    },
    coinChange: {
      title: "Coin Change",
      difficulty: "Medium",
      description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up by any combination, return -1. Input format: First line contains n (number of coin types), second line contains n space-separated integers (coin values), third line contains the target amount.",
      samples: [
        { stdin: "3\n1 2 5\n11", expected: "3" },
        { stdin: "1\n2\n3", expected: "-1" },
        { stdin: "4\n1 3 4 5\n7", expected: "2" }
      ],
    },
    lruCache: {
      title: "LRU Cache",
      difficulty: "Medium",
      description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement LRUCache class with get(key) and put(key, value) methods. The cache should evict the least recently used item when capacity is reached. For this problem, assume capacity = 2. Input format: Multiple lines, each containing either 'put key value' or 'get key'.",
      samples: [ 
        { stdin: "put 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nget 3", expected: "1\n-1\n3" } 
      ],
    },
  };

  const currentProblem = dsaPresets[selectedDSA];

  // Load first sample as default stdin when problem changes
  useEffect(() => {
    if (currentProblem?.samples?.[0]?.stdin) {
      setStdin(currentProblem.samples[0].stdin);
    }
  }, [selectedDSA]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" style={{ color: themeColor }} />
              <span className="text-lg font-bold">
                {isCodingRound ? "Coding Round" : "Coding Challenge"}
              </span>
            </DialogTitle>
            <div className="flex items-center gap-3">
              {isCodingRound && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-semibold ${isTimeUp ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  <Clock className="h-4 w-4" />
                  {isTimeUp ? "Time's Up!" : formatTime(remainingTime)}
                </div>
              )}
              <select
                value={selectedDSA}
                onChange={(e) => setSelectedDSA(e.target.value)}
                className="px-3 py-1.5 border rounded-md text-sm bg-white font-medium"
              >
                <option value="twoSum">Two Sum</option>
                <option value="validParentheses">Valid Parentheses</option>
                <option value="binarySearch">Binary Search</option>
                <option value="longestSubstring">Longest Substring</option>
                <option value="groupAnagrams">Group Anagrams</option>
                <option value="productExceptSelf">Product Except Self</option>
                <option value="mergeIntervals">Merge Intervals</option>
                <option value="rotateImage">Rotate Image</option>
                <option value="coinChange">Coin Change</option>
                <option value="lruCache">LRU Cache</option>
              </select>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="px-3 py-1.5 border rounded-md text-sm bg-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <select
                value={theme}
                onChange={(e)=>setTheme(e.target.value as any)}
                className="px-3 py-1.5 border rounded-md text-sm bg-white"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              {isCodingRound && onEndCodingRound && (
                <Button
                  onClick={onEndCodingRound}
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                >
                  End Round
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[40%_60%] h-full">
            {/* Left Panel: Problem Statement */}
            <div className="border-r bg-white overflow-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{currentProblem?.title}</h2>
                <div className={`mb-4 px-3 py-1 rounded inline-block text-sm font-medium ${
                  currentProblem?.difficulty === 'Easy' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : currentProblem?.difficulty === 'Medium'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {currentProblem?.difficulty || 'Easy'}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Problem Statement</h3>
                  <p className="text-gray-700 leading-relaxed">{currentProblem?.description}</p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Example Test Cases</h3>
                  {currentProblem?.samples.map((sample, idx) => (
                    <div key={idx} className="mb-4 bg-gray-50 rounded-lg p-4 border">
                      <div className="font-semibold text-sm mb-2">Example {idx + 1}</div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-semibold text-gray-600">Input:</span>
                          <pre className="mt-1 bg-white border rounded p-2 text-xs font-mono overflow-x-auto">
{sample.stdin}
                          </pre>
                        </div>
                        {sample.expected && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Expected Output:</span>
                            <pre className="mt-1 bg-white border rounded p-2 text-xs font-mono overflow-x-auto">
{sample.expected}
                            </pre>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => setStdin(sample.stdin)}
                      >
                        Load Input
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: Editor + Console */}
            <div className="flex flex-col bg-gray-50">
              {/* Code Editor */}
              <div className="flex-1 min-h-0 border-b">
                <div className="h-full">
                  <MonacoEditor
                    height="100%"
                    language={language === "cpp" ? "cpp" : language}
                    theme={theme}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      autoClosingBrackets: "always",
                      autoIndent: "full",
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>

              {/* Bottom Section: Input + Output */}
              <div className="h-[280px] border-t bg-white pointer-events-auto relative z-[9999]">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">Console</span>
                  </div>
                  <div
                    className="relative z-50 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white h-9 px-6 font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRun();
                      }}
                      disabled={running}
                    >
                      {running ? "⏳ Running..." : "▶ Run Code"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 p-3 h-[calc(100%-48px)]">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Input (stdin)</label>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      className="flex-1 p-2 font-mono text-sm border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter input here..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Output</label>
                    <div className="flex-1 p-2 font-mono text-sm border rounded bg-black text-green-300 overflow-auto">
                      <pre className="whitespace-pre-wrap break-words text-sm">
                        {running ? "⏳ Executing..." : output || "Output will appear here after running the code."}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <span>Write your solution from scratch - no templates provided</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Session
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
