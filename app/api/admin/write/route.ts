import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Resource type descriptions for context
const RESOURCE_TYPES: Record<string, string> = {
  article: "a long-form article with in-depth content, typically 800-2000 words with multiple sections",
  link: "a brief description/summary for an external link resource, typically 100-200 words",
  update: "a community update or announcement, typically 200-500 words with key information clearly highlighted",
  newsletter: "newsletter content with sections, updates, and engaging member-focused information, typically 500-1000 words",
  guide: "a step-by-step guide or tutorial with clear instructions, numbered steps, and practical tips",
};

// Tone descriptions
const TONE_DESCRIPTIONS: Record<string, string> = {
  friendly: "warm, conversational, and approachable. Use casual language, personal pronouns, and relatable examples",
  professional: "polished, authoritative, and business-appropriate. Use precise language and maintain credibility",
  confident: "bold, assured, and inspiring. Use strong statements and action-oriented language",
  casual: "relaxed, informal, and easygoing. Use everyday language and a lighthearted approach",
  educational: "informative, clear, and instructional. Focus on teaching and explaining concepts step-by-step",
  inspiring: "motivational, uplifting, and encouraging. Use powerful imagery and call-to-action language",
  urgent: "time-sensitive, action-focused, and compelling. Create a sense of importance and immediacy",
};

export async function POST(req: Request) {
  try {
    // Verify admin access
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Use admin client to bypass RLS when checking admin status
    if (!supabaseAdmin) {
      console.error("Supabase admin client not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response("Error checking admin status", { status: 500 });
    }

    if (!profile?.is_admin) {
      return new Response("Forbidden - Admin access required", { status: 403 });
    }

    const { prompt, resourceType, tone, title, excerpt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const resourceDescription = RESOURCE_TYPES[resourceType] || RESOURCE_TYPES.article;
    const toneDescription = TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.professional;

    // Build the system prompt for content generation
    const systemPrompt = `You are an expert content writer for Trail Net Zero, a professional community focused on trail running sustainability. 

Your task is to write ${resourceDescription}.

**Tone:** Write in a ${tone} tone - ${toneDescription}.

**Important formatting rules:**
- Output clean HTML that can be directly used in a rich text editor
- Use semantic HTML: <h1>, <h2>, <h3> for headings, <p> for paragraphs, <strong> for bold, <em> for italic
- Use <ul> and <li> for bullet lists, <ol> and <li> for numbered lists
- Use <blockquote> for quotes or callouts
- Do NOT include any markdown syntax - only HTML
- Do NOT wrap the output in code blocks or backticks
- Make the content engaging, well-structured, and ready to publish
- Focus on actionable, practical content when applicable

**Context about Trail Net Zero:**
- Community focused on sustainable trail running practices
- Members include race organizers, event directors, and trail running enthusiasts
- Topics include: reusable cup systems, waste reduction, carbon footprint, sustainable events, environmental impact

Write the content now. Start directly with the content - no preamble or explanation needed.`;

    // Build user message with context
    let userMessage = prompt;
    if (title || excerpt) {
      userMessage = `${prompt}

${title ? `Title: ${title}` : ""}
${excerpt ? `Summary/Excerpt: ${excerpt}` : ""}`;
    }

    // Call OpenAI Responses API
    const requestBody = {
      model: "gpt-4.1",
      instructions: systemPrompt,
      input: [{ role: "user", content: userMessage }],
      stream: true,
      store: false,
    };

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorText);
      return new Response(`OpenAI API error: ${openaiResponse.status}`, {
        status: 500,
      });
    }

    // Pass through the OpenAI SSE stream directly
    return new Response(openaiResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Admin write error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
