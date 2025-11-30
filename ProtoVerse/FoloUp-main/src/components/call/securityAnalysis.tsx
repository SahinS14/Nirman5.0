"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Shield, GitBranch } from "lucide-react";
import { toast } from "sonner";

interface SecurityAnalysisProps {
  onComplete: () => void;
  email: string;
}

interface AnalysisResult {
  repo_id?: string;
  run_id?: string;
  summary?: {
    overall_severity?: string;
    critical_steps?: number;
    high_steps?: number;
    medium_steps?: number;
    low_steps?: number;
    affected_files?: string[];
  };
  plan?: {
    attack_description?: string;
    overall_severity?: string;
    steps?: Array<{
      step_number: number;
      technique: string;
      description: string;
      severity: string;
    }>;
  };
}

export function SecurityAnalysis({ onComplete, email }: SecurityAnalysisProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

  const validateGitHubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubRegex.test(url);
  };

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    if (!validateGitHubUrl(repoUrl)) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    // Extract repo info for CognitoForge
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const owner = repoMatch ? repoMatch[1] : "";
    const repo = repoMatch ? repoMatch[2].replace(/\.git$/, "") : "";

    // Redirect to CognitoForge demo page
    const cognitoForgeUrl = `https://cognitoforge-ai.vercel.app/demo?owner=${owner}&repo=${repo}`;
    
    toast.success("Opening CognitoForge Security Analysis...");
    
    // Open in new tab
    window.open(cognitoForgeUrl, "_blank");
    
    // Close the modal and continue to feedback after short delay
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-bold">Security Analysis (Optional)</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        While we process your interview, you can optionally run a security analysis on your GitHub repository
        to identify potential vulnerabilities and attack vectors.
      </p>

      {!result && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <GitBranch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
                disabled={loading}
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !repoUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {analyzing ? "Analyzing..." : "Uploading..."}
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Analysis Complete</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`p-3 rounded-md border ${getSeverityColor(result.summary?.overall_severity || result.plan?.overall_severity)}`}>
                <div className="font-semibold">Overall Severity</div>
                <div className="text-2xl font-bold uppercase">
                  {result.summary?.overall_severity || result.plan?.overall_severity || "N/A"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(result.summary?.critical_steps || 0) > 0 && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <div className="text-xs text-red-600">Critical</div>
                    <div className="text-xl font-bold text-red-700">{result.summary?.critical_steps}</div>
                  </div>
                )}
                {(result.summary?.high_steps || 0) > 0 && (
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                    <div className="text-xs text-orange-600">High</div>
                    <div className="text-xl font-bold text-orange-700">{result.summary?.high_steps}</div>
                  </div>
                )}
                {(result.summary?.medium_steps || 0) > 0 && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-xs text-yellow-600">Medium</div>
                    <div className="text-xl font-bold text-yellow-700">{result.summary?.medium_steps}</div>
                  </div>
                )}
                {(result.summary?.low_steps || 0) > 0 && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-xs text-blue-600">Low</div>
                    <div className="text-xl font-bold text-blue-700">{result.summary?.low_steps}</div>
                  </div>
                )}
              </div>

              {result.plan?.attack_description && (
                <div className="p-3 bg-gray-50 rounded-md border text-sm">
                  <div className="font-semibold mb-1">Attack Scenario</div>
                  <div className="text-gray-700">{result.plan.attack_description}</div>
                </div>
              )}

              {result.plan?.steps && result.plan.steps.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold text-sm">Attack Steps</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {result.plan.steps.slice(0, 5).map((step) => (
                      <div key={step.step_number} className="p-2 bg-gray-50 rounded border text-xs">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold">Step {step.step_number}: {step.technique}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(step.severity)}`}>
                            {step.severity}
                          </span>
                        </div>
                        <div className="text-gray-600">{step.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.summary?.affected_files && result.summary.affected_files.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-1">Affected Files ({result.summary.affected_files.length})</div>
                  <div className="text-xs text-gray-600 max-h-20 overflow-y-auto bg-gray-50 p-2 rounded border">
                    {result.summary.affected_files.slice(0, 10).map((file, idx) => (
                      <div key={idx}>{file}</div>
                    ))}
                    {result.summary.affected_files.length > 10 && (
                      <div className="text-gray-400 italic">...and {result.summary.affected_files.length - 10} more</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          onClick={onComplete}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Continue to Feedback
        </Button>
      </div>
    </div>
  );
}
