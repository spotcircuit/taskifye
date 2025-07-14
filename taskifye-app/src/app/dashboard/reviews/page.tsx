'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, MessageSquare, ThumbsUp, ThumbsDown, 
  AlertCircle, CheckCircle, Clock, TrendingUp,
  Search, Filter, Bot, RefreshCw, Send
} from 'lucide-react'

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [aiResponse, setAiResponse] = useState('')

  const reviewStats = [
    { 
      platform: 'Google', 
      rating: 4.8, 
      total: 342, 
      new: 5,
      needsResponse: 3 
    },
    { 
      platform: 'Yelp', 
      rating: 4.6, 
      total: 128, 
      new: 2,
      needsResponse: 1 
    },
    { 
      platform: 'Facebook', 
      rating: 4.7, 
      total: 89, 
      new: 1,
      needsResponse: 0 
    },
  ]

  const recentReviews = [
    {
      id: 1,
      platform: 'Google',
      author: 'Sarah M.',
      rating: 5,
      date: '2 hours ago',
      content: 'Excellent service! The technician arrived on time and fixed our AC unit quickly. Very professional and explained everything clearly.',
      responded: false,
      sentiment: 'positive',
    },
    {
      id: 2,
      platform: 'Google',
      author: 'John D.',
      rating: 2,
      date: '5 hours ago',
      content: 'Disappointed with the service. Technician was 2 hours late and didn\'t have the right parts. Had to reschedule.',
      responded: false,
      sentiment: 'negative',
      urgent: true,
    },
    {
      id: 3,
      platform: 'Yelp',
      author: 'Maria L.',
      rating: 4,
      date: '1 day ago',
      content: 'Good service overall. The team was professional but pricing was a bit higher than expected.',
      responded: true,
      sentiment: 'positive',
    },
    {
      id: 4,
      platform: 'Google',
      author: 'Robert K.',
      rating: 5,
      date: '2 days ago',
      content: 'Best HVAC company in town! They installed our new system and it works perfectly. Highly recommend!',
      responded: false,
      sentiment: 'positive',
    },
  ]

  const aiResponseTemplates = [
    {
      type: 'positive',
      template: 'Thank you so much for your kind words, [NAME]! We\'re thrilled to hear about your positive experience. Your satisfaction is our top priority, and we look forward to serving you again!'
    },
    {
      type: 'negative',
      template: 'We sincerely apologize for your experience, [NAME]. This is not the level of service we strive for. Please contact us at [PHONE] so we can make this right immediately.'
    },
    {
      type: 'neutral',
      template: 'Thank you for your feedback, [NAME]. We appreciate you taking the time to share your experience. We\'re always looking to improve and your input helps us serve you better.'
    },
  ]

  const generateAIResponse = (review: any) => {
    const template = aiResponseTemplates.find(t => t.type === review.sentiment)?.template || ''
    const response = template.replace('[NAME]', review.author.split(' ')[0])
      .replace('[PHONE]', '(555) 123-4567')
    setAiResponse(response)
    setSelectedReview(review)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and respond to customer reviews with AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Reviews
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Bot className="mr-2 h-4 w-4" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {reviewStats.map((stat) => (
          <Card key={stat.platform}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{stat.platform}</CardTitle>
                {stat.needsResponse > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stat.needsResponse} need response
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(stat.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{stat.rating}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stat.total}</p>
                  <p className="text-xs text-muted-foreground">total reviews</p>
                </div>
              </div>
              {stat.new > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  {stat.new} new this week
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reviews Management */}
      <Tabs defaultValue="needs-response" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="needs-response">Needs Response</TabsTrigger>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="needs-response" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reviews Requiring Response</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bot className="mr-2 h-4 w-4" />
                    Auto-Respond All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.filter(r => !r.responded).map((review) => (
                  <div 
                    key={review.id} 
                    className={`p-4 rounded-lg border ${
                      review.urgent ? 'border-red-300 bg-red-50' : ''
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={review.platform === 'Google' ? 'default' : 'secondary'}>
                          {review.platform}
                        </Badge>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.author}</span>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                        {review.urgent && (
                          <Badge variant="destructive" className="ml-2">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{review.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={
                            review.sentiment === 'positive' ? 'text-green-600' : 
                            review.sentiment === 'negative' ? 'text-red-600' : 
                            'text-gray-600'
                          }
                        >
                          {review.sentiment === 'positive' ? <ThumbsUp className="mr-1 h-3 w-3" /> : 
                           review.sentiment === 'negative' ? <ThumbsDown className="mr-1 h-3 w-3" /> : null}
                          {review.sentiment}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateAIResponse(review)}
                        >
                          <Bot className="mr-2 h-4 w-4" />
                          Generate Response
                        </Button>
                        <Button size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Respond
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Response Modal */}
          {selectedReview && (
            <Card>
              <CardHeader>
                <CardTitle>AI Generated Response</CardTitle>
                <CardDescription>
                  Review and edit the AI-generated response before sending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Responding to:</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.content}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Response:</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={aiResponse}
                    onChange={(e) => setAiResponse(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedReview(null)
                      setAiResponse('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="mr-2 h-4 w-4" />
                    Send Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search reviews..." 
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={review.platform === 'Google' ? 'default' : 'secondary'}>
                          {review.platform}
                        </Badge>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.author}</span>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      {review.responded && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Responded
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{review.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <span>Positive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">78%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-[78%] h-full bg-green-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">15%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-[15%] h-full bg-yellow-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                      <span>Negative</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">7%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-[7%] h-full bg-red-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { topic: 'Service Quality', count: 145, sentiment: 'positive' },
                    { topic: 'Pricing', count: 89, sentiment: 'neutral' },
                    { topic: 'Punctuality', count: 76, sentiment: 'positive' },
                    { topic: 'Communication', count: 54, sentiment: 'positive' },
                    { topic: 'Wait Time', count: 23, sentiment: 'negative' },
                  ].map((item) => (
                    <div key={item.topic} className="flex items-center justify-between">
                      <span className="text-sm">{item.topic}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={
                            item.sentiment === 'positive' ? 'text-green-600' : 
                            item.sentiment === 'negative' ? 'text-red-600' : 
                            'text-gray-600'
                          }
                        >
                          {item.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}