const API_KEY = "AIzaSyDknmReWTw2X2JTZX3ncvEtCxn8DCwtq0g";

export interface AnalysisResult {
  score: number; // 0-100 deepfake probability
  confidence: "Low" | "Medium" | "High";
  details: string;
  suspiciousAreas: string[];
  frameResults?: { frame: number; score: number }[];
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function analyzeImage(imageData: Blob | string): Promise<AnalysisResult> {
  let base64: string;
  let mimeType = "image/jpeg";

  if (typeof imageData === "string") {
    // It's a URL — fetch and convert
    try {
      const resp = await fetch(imageData);
      const blob = await resp.blob();
      mimeType = blob.type || "image/jpeg";
      base64 = await blobToBase64(blob);
    } catch {
      // If fetch fails (CORS), use URL directly
      return analyzeImageByUrl(imageData);
    }
  } else {
    mimeType = imageData.type || "image/jpeg";
    base64 = await blobToBase64(imageData);
  }

  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are a deepfake detection expert. Analyze this image for signs of AI generation or manipulation. Look for:
1. Facial inconsistencies (asymmetry, unnatural skin texture, blending artifacts)
2. GAN artifacts (checkerboard patterns, spectral anomalies)
3. Lighting inconsistencies
4. Background anomalies
5. Edge artifacts around face/hair boundaries
6. Unnatural eye reflections or pupil irregularities

Respond ONLY in this exact JSON format:
{"score": <number 0-100>, "confidence": "<Low|Medium|High>", "details": "<brief analysis>", "suspiciousAreas": ["<area1>", "<area2>"]}

Where score is the deepfake probability (0=definitely real, 100=definitely fake).`,
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
  };

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) {
    throw new Error(`API error: ${resp.status}`);
  }

  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return parseResult(text);
}

async function analyzeImageByUrl(url: string): Promise<AnalysisResult> {
  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are a deepfake detection expert. Analyze the image at this URL for signs of AI generation or manipulation: ${url}

Look for facial inconsistencies, GAN artifacts, lighting issues, background anomalies, edge artifacts, and unnatural features.

Respond ONLY in this exact JSON format:
{"score": <number 0-100>, "confidence": "<Low|Medium|High>", "details": "<brief analysis>", "suspiciousAreas": ["<area1>", "<area2>"]}`,
          },
        ],
      },
    ],
  };

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return parseResult(text);
}

function parseResult(text: string): AnalysisResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.max(0, Math.min(100, parsed.score ?? 50)),
        confidence: parsed.confidence ?? "Medium",
        details: parsed.details ?? "Analysis complete.",
        suspiciousAreas: parsed.suspiciousAreas ?? [],
      };
    }
  } catch {
    // fallback
  }
  return {
    score: 50,
    confidence: "Low",
    details: "Could not parse analysis. The image may not contain detectable features.",
    suspiciousAreas: [],
  };
}

export function extractVideoFrames(
  video: HTMLVideoElement,
  count: number = 8
): Promise<Blob[]> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const frames: Blob[] = [];
    const duration = video.duration;
    const interval = duration / (count + 1);
    let current = 0;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const captureFrame = () => {
      current++;
      if (current > count) {
        resolve(frames);
        return;
      }
      video.currentTime = interval * current;
    };

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) frames.push(blob);
        captureFrame();
      }, "image/jpeg");
    };

    captureFrame();
  });
}

export async function analyzeVideo(file: File): Promise<AnalysisResult> {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.muted = true;

  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve();
  });

  const frames = await extractVideoFrames(video, 6);
  URL.revokeObjectURL(video.src);

  const frameResults: { frame: number; score: number }[] = [];
  let totalScore = 0;

  for (let i = 0; i < frames.length; i++) {
    const result = await analyzeImage(frames[i]);
    frameResults.push({ frame: i + 1, score: result.score });
    totalScore += result.score;
  }

  const avgScore = Math.round(totalScore / frames.length);
  const suspicious = frameResults.filter((f) => f.score > 60);

  return {
    score: avgScore,
    confidence: avgScore > 75 ? "High" : avgScore > 40 ? "Medium" : "Low",
    details: `Analyzed ${frames.length} frames. ${suspicious.length} suspicious frames detected.`,
    suspiciousAreas: suspicious.map((f) => `Frame ${f.frame} (${f.score}% fake probability)`),
    frameResults,
  };
}
