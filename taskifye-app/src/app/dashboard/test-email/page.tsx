'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TestEmailPage() {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    to: '',
    subject: 'Test Email from Taskifye',
    content: 'This is a test email sent via ReachInbox API integration.'
  })

  const handleSendTest = async () => {
    if (!formData.to) {
      toast({
        title: 'Error',
        description: 'Please enter a recipient email address',
        variant: 'destructive'
      })
      return
    }

    setIsSending(true)
    setTestResult(null)

    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      setTestResult(result)

      if (response.ok) {
        toast({
          title: 'Email sent successfully!',
          description: `Message ID: ${result.messageId}`
        })
      } else {
        toast({
          title: 'Failed to send email',
          description: result.error || 'Unknown error',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast({
        title: 'Network error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      })
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsSending(false)
    }
  }

  const handleTestCampaign = async () => {
    setIsSending(true)
    setTestResult(null)

    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/email/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId
        },
        body: JSON.stringify({
          recipients: [
            { email: formData.to, name: 'Test User' }
          ],
          subject: formData.subject + ' (Campaign Test)',
          content: formData.content + '\n\nThis was sent as a campaign test.'
        })
      })

      const result = await response.json()
      setTestResult(result)

      if (response.ok) {
        toast({
          title: 'Campaign sent successfully!',
          description: `Campaign ID: ${result.campaignId}`
        })
      } else {
        toast({
          title: 'Failed to send campaign',
          description: result.error || 'Unknown error',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error sending test campaign:', error)
      toast({
        title: 'Network error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      })
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test ReachInbox Email Integration</CardTitle>
          <CardDescription>
            Send test emails to verify ReachInbox API is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Status */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Using ReachInbox API key for client: Premium Painting Co
            </AlertDescription>
          </Alert>

          {/* Email Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Recipient Email</Label>
              <Input
                id="to"
                type="email"
                placeholder="test@example.com"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSendTest} 
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Test Email
            </Button>

            <Button 
              onClick={handleTestCampaign} 
              disabled={isSending}
              variant="secondary"
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Test Campaign API
            </Button>
          </div>

          {/* Test Results */}
          {testResult && (
            <Card className={testResult.success ? "border-green-500" : "border-red-500"}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Success
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Error
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* API Notes */}
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Note:</strong> The ReachInbox API endpoints may need adjustment based on their actual API documentation. 
              Current implementation assumes standard REST API patterns.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}