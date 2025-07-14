'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, Send, Phone, X, Minimize2, 
  Maximize2, Mic, MicOff, User, Bot, Loader2,
  PhoneCall, PhoneOff
} from 'lucide-react'
import { ReceptionistRequest, ReceptionistResponse } from '@/types/receptionist'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  actions?: ReceptionistResponse['actions']
}

interface ChatWidgetProps {
  businessName?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
  allowVoice?: boolean
  onClose?: () => void
}

export default function ChatWidget({
  businessName = 'HVAC Pro Services',
  position = 'bottom-right',
  theme = 'auto',
  allowVoice = true,
  onClose
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Thank you for contacting ${businessName}. How can I help you today?`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const request: ReceptionistRequest = {
        sessionId,
        input: { type, content },
        context: {
          previousMessages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          }))
        }
      }

      const response = await fetch('/api/receptionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      const data: ReceptionistResponse = await response.json()

      // Update user message status
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, status: 'sent' } : m
      ))

      // Add assistant response
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        actions: data.actions
      }

      setMessages(prev => [...prev, assistantMessage])

      // Handle special statuses
      if (data.status === 'escalate') {
        // Show escalation UI
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `msg-${Date.now()}-system`,
            role: 'assistant',
            content: '🔄 Connecting you to a human agent...',
            timestamp: new Date()
          }])
        }, 1000)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      
      // Update message status to error
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, status: 'error' } : m
      ))

      // Add error message
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again or call us directly.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = (action: any) => {
    // Handle action button clicks
    console.log('Action clicked:', action)
    
    // Send action as a message
    sendMessage(`[Action: ${action.label}]`)
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (!isVoiceMode && allowVoice) {
      // Start voice mode
      setIsRecording(true)
      // TODO: Implement actual voice recording
    } else {
      setIsRecording(false)
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <Card className={`shadow-2xl ${isMinimized ? 'h-14' : 'h-[600px]'} flex flex-col`}>
        {/* Header */}
        <CardHeader className="p-4 border-b flex-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">{businessName}</CardTitle>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {allowVoice && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleVoiceMode}
                >
                  {isVoiceMode ? (
                    <PhoneOff className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setIsOpen(false)
                  onClose?.()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-none">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md'
                          : 'bg-muted rounded-2xl rounded-tl-md'
                      } px-4 py-2`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.status === 'sending' && (
                        <p className="text-xs opacity-70 mt-1">Sending...</p>
                      )}
                      {message.status === 'error' && (
                        <p className="text-xs text-red-300 mt-1">Failed to send</p>
                      )}
                      
                      {/* Action buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant={message.role === 'user' ? 'secondary' : 'outline'}
                              onClick={() => handleAction(action)}
                              className="text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-none">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t flex-none">
              {isVoiceMode ? (
                <div className="flex items-center justify-center py-8">
                  <button
                    className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    {isRecording ? (
                      <MicOff className="h-8 w-8 text-white" />
                    ) : (
                      <Mic className="h-8 w-8 text-white" />
                    )}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(input)
                  }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}