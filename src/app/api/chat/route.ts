import { NextResponse } from 'next/server'

// Mock SLA Knowledge Base
const KNOWLEDGE_BASE = [
  { keywords: ['turnaround', 'time', 'how long'], response: "According to the municipal SLA, high-priority road defects (like deep potholes on major roads) are scheduled for repair within 48 hours. Moderate priority defects are addressed within 14 days." },
  { keywords: ['prioritize', 'priority', 'decide'], response: "Potholes are prioritized automatically using an AI Hazard Assessment Engine. It calculates a priority score based on the bounding box coverage, YOLO detection confidence, and the crowd urgency (number of duplicate reports within a 10m radius)." },
  { keywords: ['escalate', 'complain'], response: "If a resolved pothole is still causing issues, you can escalate the complaint by contacting the municipal helpline at 1-800-ROAD-FIX or submitting a new report which will be treated as an escalation if located near a recently closed ticket." },
  { keywords: ['after submitting', 'happens next'], response: "After you submit a report, our AI verifies the image. If valid, it's deduplicated and added to the municipal priority queue. You will receive notifications when the repair is scheduled, started, and officially resolved after a visual completion audit." },
  { keywords: ['duplicate', 'already reported'], response: "If multiple citizens report the same pothole within 10 meters, our Spatio-Visual Deduplication Engine groups them into a single primary municipal ticket. This increases the 'Crowd Urgency' score, prioritizing the repair without creating duplicate tasks for contractors." },
]

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const query = message.toLowerCase()

    // Simulate RAG Retrieval Latency
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simple keyword matching for mock retrieval
    let response = "I couldn't find specific SLA documentation for that query. However, most general inquiries can be resolved by submitting a report directly or calling the municipal helpdesk."
    
    for (const doc of KNOWLEDGE_BASE) {
      if (doc.keywords.some(kw => query.includes(kw))) {
        response = doc.response
        break
      }
    }

    return NextResponse.json({
      role: 'assistant',
      content: response,
      grounded: true
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
