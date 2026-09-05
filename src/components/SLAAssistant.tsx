"use client"

import { useState } from "react"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card"
import { Input } from "./ui/input"

export function SLAAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi! I am the Civic SLA Assistant. How can I help you regarding road maintenance timelines and priorities?' }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMsg = input
    setInput("")
    setMessages((prev: any) => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      
      const data = await res.json()
      setMessages((prev: any) => [...prev, { role: 'assistant', content: data.content }])
    } catch (e) {
      setMessages((prev: any) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the knowledge base.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl shadow-blue-900/20 bg-blue-600 hover:bg-blue-700 p-0 z-50 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[350px] shadow-2xl z-50 flex flex-col border-blue-100 overflow-hidden">
          <CardHeader className="bg-blue-600 text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-base font-semibold text-white">Civic SLA Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 max-h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m: any, i: number) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`text-sm p-3 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 shadow-sm text-slate-500 text-sm p-3 rounded-2xl rounded-tl-sm flex gap-1">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce delay-100">•</span>
                  <span className="animate-bounce delay-200">•</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-3 bg-white border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about SLA..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
