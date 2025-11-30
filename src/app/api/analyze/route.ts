import { NextRequest, NextResponse } from "next/server";
import type { DesignSystem } from "@/types/design-system";

// API Endpoints
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Models
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const ANALYSIS_PROMPT = `You are an expert UI/UX designer and design system architect. Analyze the provided image and extract a comprehensive design system.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.

Extract and return a JSON object with this exact structure:
{
  "name": "A creative name for this design system based on its visual style",
  "description": "A brief 1-2 sentence description of the design style and mood",
  "colors": {
    "primary": "#hexcode - the main brand/action color",
    "secondary": "#hexcode - supporting brand color",
    "accent": "#hexcode - highlight/accent color",
    "background": "#hexcode - main background color",
    "foreground": "#hexcode - main text color",
    "muted": "#hexcode - subtle background for sections",
    "mutedForeground": "#hexcode - secondary text color",
    "card": "#hexcode - card/surface background",
    "cardForeground": "#hexcode - text on cards",
    "border": "#hexcode - border color",
    "success": "#hexcode - success/positive color",
    "error": "#hexcode - error/danger color",
    "warning": "#hexcode - warning/caution color",
    "info": "#hexcode - info/neutral color"
  },
  "gradients": [
    {
      "from": "#hexcode",
      "to": "#hexcode",
      "via": "#hexcode or null if no middle color",
      "direction": "to right/to bottom/135deg etc"
    }
  ],
  "typography": {
    "headingFont": "Font family name for headings",
    "bodyFont": "Font family name for body text",
    "monoFont": "Font family name for code/mono text",
    "headingWeight": "700/800/900 etc",
    "bodyWeight": "400/500 etc",
    "headingSizes": {
      "h1": "3rem/48px etc",
      "h2": "2.25rem/36px etc",
      "h3": "1.5rem/24px etc",
      "h4": "1.25rem/20px etc"
    },
    "bodySizes": {
      "large": "1.125rem/18px",
      "base": "1rem/16px",
      "small": "0.875rem/14px"
    },
    "lineHeight": {
      "heading": "1.2",
      "body": "1.6"
    }
  },
  "styles": {
    "borderRadius": {
      "none": "0",
      "sm": "0.25rem",
      "md": "0.5rem",
      "lg": "0.75rem",
      "xl": "1rem",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px rgba(0,0,0,0.05)",
      "md": "0 4px 6px -1px rgba(0,0,0,0.1)",
      "lg": "0 10px 15px -3px rgba(0,0,0,0.1)",
      "xl": "0 20px 25px -5px rgba(0,0,0,0.1)"
    },
    "spacing": {
      "xs": "0.25rem",
      "sm": "0.5rem",
      "md": "1rem",
      "lg": "1.5rem",
      "xl": "2rem",
      "2xl": "3rem"
    }
  },
  "mood": ["modern", "minimal", "bold", etc - 3-5 mood keywords],
  "suggestedUse": ["SaaS dashboard", "E-commerce", etc - 2-3 suggested use cases]
}

Guidelines:
1. Extract EXACT hex colors from the image - be precise
2. If you can identify fonts, use their actual names. If not, suggest similar Google Fonts
3. Estimate border-radius, shadows, and spacing based on visual inspection
4. For dark themes, ensure foreground colors have good contrast with backgrounds
5. Include at least 1-3 gradients if present in the design
6. Make the design system complete and ready to use`;

// ============================================================================
// GEMINI API (Free tier - 15 requests/minute)
// ============================================================================

async function analyzeWithGemini(base64Data: string, mediaType: string): Promise<DesignSystem> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mediaType,
                data: base64Data,
              },
            },
            {
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error(errorData.error?.message || "Gemini API error");
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("No response from Gemini");
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Gemini response");
  }

  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// ANTHROPIC API (Claude)
// ============================================================================

async function analyzeWithAnthropic(base64Data: string, mediaType: string): Promise<DesignSystem> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Anthropic API error:", errorData);
    throw new Error(errorData.error?.message || "Anthropic API error");
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error("No response from Anthropic");
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Anthropic response");
  }

  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Extract base64 data and media type
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    const mediaType = matches[1];
    const base64Data = matches[2];

    // Determine which API to use (priority: Gemini > Anthropic)
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!geminiKey && !anthropicKey) {
      return NextResponse.json(
        { 
          error: "No API key configured. Add GEMINI_API_KEY (free) or ANTHROPIC_API_KEY to .env.local",
          help: "Get free Gemini API key at: https://aistudio.google.com/apikey"
        },
        { status: 500 }
      );
    }

    let designSystem: DesignSystem;
    let provider: string;

    // Try Gemini first (free tier), fallback to Anthropic
    if (geminiKey) {
      try {
        designSystem = await analyzeWithGemini(base64Data, mediaType);
        provider = "gemini";
      } catch (geminiError) {
        console.error("Gemini failed, trying Anthropic:", geminiError);
        if (anthropicKey) {
          designSystem = await analyzeWithAnthropic(base64Data, mediaType);
          provider = "anthropic";
        } else {
          throw geminiError;
        }
      }
    } else {
      designSystem = await analyzeWithAnthropic(base64Data, mediaType);
      provider = "anthropic";
    }

    return NextResponse.json({ designSystem, provider });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
