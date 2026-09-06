import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 1. Fetch official municipal knowledge documents from Prisma DB
    const docs = await prisma.knowledgeDocument.findMany({
      select: { title: true, content: true }
    })

    const knowledgeContext = docs
      .map((d, i) => `[Source ${i + 1}: ${d.title}]\n${d.content}`)
      .join("\n\n")

    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" })

        const systemPrompt = `You are the RoadWatch AI Civic SLA Assistant for municipal road maintenance.
Your job is to answer citizen questions about pothole repair timelines, priority scoring, deduplication, SLAs, civic points, and escalation.

Base your answers strictly and accurately on the following official municipal knowledge sources:
${knowledgeContext}

Guidelines:
1. Provide concise, helpful, and courteous answers (2-4 sentences).
2. If the user asks about something not covered in the knowledge base, state politely that the specific policy is not available in the SLA guide and advise them to call 1-800-ROAD-FIX or submit a report.
3. Be professional and civic-minded.

Citizen Question: ${message}`

        const result = await model.generateContent(systemPrompt)
        const content = result.response.text().trim()

        return NextResponse.json({
          role: "assistant",
          content,
          grounded: true,
          sourcesCount: docs.length
        })
      } catch (geminiError) {
        console.error("Gemini RAG chat error, falling back to document search:", geminiError)
      }
    }

    // Fallback if Gemini fails or API key is absent: direct knowledge document semantic match
    const query = message.toLowerCase()
    let matchedResponse = "I couldn't find specific SLA documentation for that query. However, most general inquiries can be resolved by submitting a report directly or calling the municipal helpline at 1-800-ROAD-FIX."

    for (const doc of docs) {
      const words = doc.title.toLowerCase().split(" ").concat(doc.content.toLowerCase().split(" "))
      const queryWords = query.split(" ").filter(w => w.length > 3)
      const matches = queryWords.filter(w => words.includes(w))
      if (matches.length >= 2) {
        matchedResponse = doc.content
        break
      }
    }

    return NextResponse.json({
      role: "assistant",
      content: matchedResponse,
      grounded: true,
      sourcesCount: docs.length
    })
  } catch (error) {
    console.error("Failed to process chat:", error)
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 })
  }
}
