// Shared types for receptionist bot communication between UI and n8n

export interface ReceptionistRequest {
  sessionId: string
  userId?: string
  input: {
    type: 'text' | 'voice'
    content: string
    audioUrl?: string
  }
  context?: {
    userName?: string
    userPhone?: string
    userEmail?: string
    previousMessages?: Array<{
      role: 'user' | 'assistant'
      content: string
      timestamp: string
    }>
  }
}

export interface ReceptionistResponse {
  sessionId: string
  message: string
  status: 'success' | 'error' | 'escalate' | 'ended'
  actions?: Array<{
    type: 'book_appointment' | 'connect_agent' | 'send_info' | 'custom'
    label: string
    data?: any
  }>
  audioUrl?: string
  metadata?: {
    intent?: string
    sentiment?: string
    nextSteps?: string[]
  }
}

// n8n Workflow Payload (what n8n receives)
export interface N8NWorkflowPayload extends ReceptionistRequest {
  timestamp: string
  source: 'taskifye-receptionist'
  businessInfo?: {
    id: string
    name: string
    timezone: string
    businessHours?: Record<string, { open: string; close: string }>
  }
}

// Business Context for AI
export interface BusinessContext {
  name: string
  services: string[]
  businessHours: {
    monday: { open: string; close: string }
    tuesday: { open: string; close: string }
    wednesday: { open: string; close: string }
    thursday: { open: string; close: string }
    friday: { open: string; close: string }
    saturday: { open: string; close: string }
    sunday: { open: string; close: string }
  }
  emergencyService: boolean
  bookingEnabled: boolean
  pricingInfo?: {
    consultationFee?: number
    serviceCallFee?: number
    emergencyFee?: number
  }
}

// Call Analytics
export interface CallAnalytics {
  sessionId: string
  startTime: string
  endTime: string
  duration: number
  outcome: 'appointment_booked' | 'info_provided' | 'escalated' | 'abandoned' | 'other'
  intentDetected: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  appointmentDetails?: {
    date: string
    time: string
    service: string
  }
  leadInfo?: {
    name?: string
    phone?: string
    email?: string
    address?: string
  }
  transcript: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
}

// Integration Actions (what n8n does with the data)
export interface IntegrationActions {
  pipedrive?: {
    createLead?: boolean
    updateContact?: boolean
    createActivity?: boolean
    addNote?: boolean
  }
  calendar?: {
    bookAppointment?: boolean
    checkAvailability?: boolean
  }
  reachinbox?: {
    sendSMS?: boolean
    sendEmail?: boolean
    scheduleFollowUp?: boolean
  }
  internal?: {
    notifyTeam?: boolean
    createTicket?: boolean
    logAnalytics?: boolean
  }
}

// Voice-specific types
export interface VoiceCallData {
  callSid?: string
  from: string
  to: string
  callStatus: 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer'
  direction: 'inbound' | 'outbound'
  duration?: number
  recordingUrl?: string
}

// Widget Configuration
export interface WidgetConfig {
  businessName: string
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme: 'light' | 'dark' | 'auto'
  allowVoice: boolean
  primaryColor?: string
  greetingMessage?: string
  offlineMessage?: string
  businessHours?: BusinessContext['businessHours']
  quickReplies?: Array<{
    label: string
    value: string
  }>
}