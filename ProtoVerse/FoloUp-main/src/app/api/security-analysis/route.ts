import { NextRequest, NextResponse } from "next/server";

// CognitoForge API integration for security analysis
const COGNITOFORGE_API_URL = process.env.COGNITOFORGE_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo_url, action } = body;

    console.log("Security Analysis API called:", { repo_url, action, apiUrl: COGNITOFORGE_API_URL });

    if (!repo_url) {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    // Step 1: Upload repository to CognitoForge
    if (action === "upload" || !action) {
      const uploadPayload = {
        repo_url,
        repo_id: generateRepoId(repo_url),
      };
      
      console.log("Uploading to CognitoForge:", uploadPayload);

      const uploadResponse = await fetch(`${COGNITOFORGE_API_URL}/upload_repo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadPayload),
      });

      console.log("Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        let errorDetail = "Failed to upload repository";
        try {
          const error = await uploadResponse.json();
          errorDetail = error.detail || errorDetail;
          console.error("Upload error:", error);
        } catch (e) {
          const errorText = await uploadResponse.text();
          console.error("Upload error (text):", errorText);
          errorDetail = errorText || errorDetail;
        }
        return NextResponse.json(
          { error: errorDetail },
          { status: uploadResponse.status }
        );
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload successful:", uploadData);
      return NextResponse.json({
        success: true,
        message: "Repository uploaded successfully",
        data: uploadData,
      });
    }

    // Step 2: Simulate attack
    if (action === "simulate") {
      const { repo_id } = body;
      if (!repo_id) {
        return NextResponse.json(
          { error: "Repository ID is required for simulation" },
          { status: 400 }
        );
      }

      const simulateResponse = await fetch(
        `${COGNITOFORGE_API_URL}/simulate_attack`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ repo_id }),
        }
      );

      if (!simulateResponse.ok) {
        const error = await simulateResponse.json();
        return NextResponse.json(
          { error: error.detail || "Failed to simulate attack" },
          { status: simulateResponse.status }
        );
      }

      const simulateData = await simulateResponse.json();
      return NextResponse.json({
        success: true,
        message: "Security analysis completed",
        data: simulateData,
      });
    }

    // Step 3: Get report
    if (action === "report") {
      const { repo_id } = body;
      if (!repo_id) {
        return NextResponse.json(
          { error: "Repository ID is required for report" },
          { status: 400 }
        );
      }

      const reportResponse = await fetch(
        `${COGNITOFORGE_API_URL}/reports/${repo_id}/latest`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!reportResponse.ok) {
        const error = await reportResponse.json();
        return NextResponse.json(
          { error: error.detail || "Failed to get report" },
          { status: reportResponse.status }
        );
      }

      const reportData = await reportResponse.json();
      return NextResponse.json({
        success: true,
        message: "Report retrieved successfully",
        data: reportData,
      });
    }

    return NextResponse.json(
      { error: "Invalid action specified" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Security analysis API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function generateRepoId(repoUrl: string): string {
  // Extract owner/repo from GitHub URL and create a simple ID
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return `${match[1]}-${match[2]}`.replace(/[^a-zA-Z0-9-_]/g, "-");
  }
  return `repo-${Date.now()}`;
}
