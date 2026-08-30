import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Groq from 'groq-sdk'

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = await createClient()
    
    // Attempt to identify user to load preferences/resume context
    const { data: { user } } = await supabase.auth.getUser()
    
    // Construct the system prompt for JO
    const systemPrompt = `You are JO (Job Orbiter), an autonomous, highly intelligent AI assistant for a recruitment platform.
Your primary role is to help the user configure their scraping agents by gathering constraints: minimum salary, preferred locations/regions, and niche keywords (skills, company sizes, tech stack).
You must act as a sharp, highly capable AI (like JARVIS from Iron Man). Be helpful, precise, slightly robotic but conversational and smart.
If the user provides constraints, acknowledge them and confirm you have updated the parameters.
If they ask what the application does, explain that Job Orbiter scours the internet using autonomous agents to find tech jobs matching their exact "Vectorized DNA" (resume) and constraints.
Do NOT output JSON. Just natural conversation.
If the user indicates they are completely done configuring, say EXACTLY the phrase: "CONFIGURATION_COMPLETE" at the very end of your message.`

    // Prepend system prompt to messages
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ]

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama3-8b-8192", // Fast and capable
      temperature: 0.7,
      max_tokens: 500,
    })

    let reply = chatCompletion.choices[0]?.message?.content || "I am processing your request. Please stand by."
    let isComplete = false

    // Check if JO determined configuration is complete
    if (reply.includes("CONFIGURATION_COMPLETE")) {
      isComplete = true
      reply = reply.replace("CONFIGURATION_COMPLETE", "").trim()
    }

    return NextResponse.json({ reply, isComplete })

  } catch (error: any) {
    console.error('JO Chat Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process conversation' },
      { status: 500 }
    )
  }
}
