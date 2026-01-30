import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'

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

Always format your output using Markdown for easy copy-paste into content management systems.`

export async function POST(req: Request) {
  try {
    // Verify admin access
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return new Response('Forbidden - Admin access required', { status: 403 })
    }

    const { messages, enableWebSearch = false } = await req.json()

    // Build the model configuration
    // GPT-5.2 has built-in web search capability that can be enabled via web_search_options
    const result = streamText({
      model: openai('gpt-5.2'),
      system: SYSTEM_PROMPT,
      messages,
      // Enable web search if requested - GPT-5.2 has native web search support
      ...(enableWebSearch && {
        providerOptions: {
          openai: {
            webSearchOptions: {
              enabled: true,
            },
          },
        },
      }),
      maxTokens: 4096,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Admin chat error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
