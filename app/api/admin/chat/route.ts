import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// System prompt for the AI content helper
const SYSTEM_PROMPT = `You are an expert content writer and editor for Trail Net Zero, a professional community focused on trail running sustainability. Your role is to help create high-quality content including:

- Articles about sustainable trail running practices
- Monthly newsletters for members
- Blog posts about environmental impact and solutions
- Educational guides on sustainability topics
- Event announcements and recaps
- Member spotlights and success stories

**Guidelines:**
- Write in a professional but approachable tone
- Focus on actionable, practical advice
- Back up claims with facts when possible
- Use clear, concise language
- Structure content with headers, lists, and short paragraphs for readability
- When discussing sustainability topics, maintain scientific accuracy
- Be encouraging and solution-oriented rather than doom-focused

**Content Types You Can Generate:**
1. **Articles** - Long-form educational or informational pieces (800-2000 words)
2. **Blog Posts** - Shorter, engaging pieces (400-800 words)
3. **Newsletter Sections** - Monthly roundups, tips, featured content
4. **Social Media** - Captions, thread ideas, engagement posts
5. **Email Templates** - Member communications, announcements
6. **Resource Guides** - How-to content, best practices

When asked to create content, ask clarifying questions if needed about:
- Target audience specifics
- Desired length
- Key points to include
- Tone preferences
- Any specific facts or sources to reference

Always format your output using Markdown for easy copy-paste into content management systems.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

    const { messages, enableWebSearch = false } = await req.json();

    // Convert messages to OpenAI Responses API input format
    const input = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build the request body for OpenAI Responses API
    const requestBody: Record<string, unknown> = {
      model: "gpt-4.1",
      instructions: SYSTEM_PROMPT,
      input,
      stream: true,
      store: false,
    };

    // Enable web search if requested
    if (enableWebSearch) {
      requestBody.tools = [{ type: "web_search" }];
    }

    // Call OpenAI Responses API
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
    // The client will parse the response.output_text.delta events
    return new Response(openaiResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Admin chat error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
