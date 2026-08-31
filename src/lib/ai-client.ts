import Groq from 'groq-sdk'

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIClientOptions {
  model?: string
  temperature?: number
  jsonMode?: boolean
  maxTokens?: number
  /** Per-call override, e.g. a user-supplied Groq key passed through from a request. */
  apiKey?: string
}

const AI_PROVIDER = process.env.AI_PROVIDER || 'groq'
const GROQ_API_KEY = process.env.GROQ_API_KEY
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:latest'

// Constructed lazily so an Ollama-only setup never pays the Groq-client cost
// or requires GROQ_API_KEY to be set.
let defaultGroqClient: Groq | null = null
function getDefaultGroqClient(): Groq {
  if (!defaultGroqClient) {
    defaultGroqClient = new Groq({ apiKey: GROQ_API_KEY })
  }
  return defaultGroqClient
}

export async function generateCompletion(
  messages: AIMessage[],
  options?: AIClientOptions
): Promise<string | null> {
  const isJson = options?.jsonMode || false
  const temperature = options?.temperature ?? 0.2

  if (AI_PROVIDER === 'groq') {
    const groqModel = options?.model || 'llama-3.3-70b-versatile'
    const client = options?.apiKey ? new Groq({ apiKey: options.apiKey }) : getDefaultGroqClient()
    try {
      const completion = await client.chat.completions.create({
        messages: messages as any,
        model: groqModel,
        temperature,
        max_tokens: options?.maxTokens,
        response_format: isJson ? { type: 'json_object' } : { type: 'text' },
      })
      return completion.choices[0]?.message?.content || null
    } catch (error) {
      console.error('Groq AI Error:', error)
      return null
    }
  } else if (AI_PROVIDER === 'ollama') {
    const ollamaModel = options?.model || OLLAMA_MODEL
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ollamaModel,
          messages,
          stream: false,
          format: isJson ? 'json' : undefined,
          options: {
            temperature,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.message?.content || null
    } catch (error) {
      console.error('Ollama AI Error:', error)
      return null
    }
  }

  throw new Error(`Unsupported AI_PROVIDER: ${AI_PROVIDER}`)
}
