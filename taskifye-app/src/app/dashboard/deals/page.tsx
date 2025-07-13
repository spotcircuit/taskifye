'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Plus, DollarSign, Clock } from 'lucide-react'
import { DealFormModal } from '@/components/deals/deal-form-modal'

type DealTemplate = {
  id: string
  name: string
  value: number
  recurring: string
  description: string
  deliverables: string[]
}

// Service business templates
const dealTemplates = [
  {
    id: 'seo-starter',
    name: 'SEO Starter Package',
    value: 500,
    recurring: 'monthly',
    description: 'Basic SEO optimization and reporting',
    deliverables: [
      'Keyword research',
      'On-page optimization',
      'Monthly report',
      '5 blog posts'
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media Management',
    value: 800,
    recurring: 'monthly',
    description: 'Complete social media management',
    deliverables: [
      '3 platforms managed',
      '20 posts per month',
      'Engagement monitoring',
      'Monthly analytics'
    ]
  },
  {
    id: 'web-design',
    name: 'Website Design & Development',
    value: 3500,
    recurring: 'one-time',
    description: '5-page professional website',
    deliverables: [
      'Custom design',
      'Mobile responsive',
      'SEO optimized',
      '30-day support'
    ]
  },
  {
    id: 'ppc-management',
    name: 'PPC Campaign Management',
    value: 1000,
    recurring: 'monthly',
    description: 'Google Ads and Facebook Ads management',
    deliverables: [
      'Campaign setup',
      'Daily monitoring',
      'A/B testing',
      'ROI reporting'
    ]
  }
]

export default function DealsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customizing, setCustomizing] = useState(false)

  const handleCreateDeal = (templateId: string) => {
    setSelectedTemplate(templateId)
    setCustomizing(true)
    // Would open a modal to assign to contact and customize
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals & Offers</h1>
          <p className="text-muted-foreground">
            Quick templates for your service packages
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Custom Deal
        </Button>
      </div>

      {/* Service Package Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dealTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{template.value}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {template.recurring}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Includes:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {template.deliverables.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleCreateDeal(template.id)}
                >
                  Use This Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Deals Summary */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,600</div>
            <p className="text-xs text-muted-foreground">Potential revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Won This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">$18,400 closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common deal workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Send Proposal Template
            </Button>
            <Button variant="outline" size="sm">
              Create Invoice
            </Button>
            <Button variant="outline" size="sm">
              Schedule Follow-up
            </Button>
            <Button variant="outline" size="sm">
              Mark as Won
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}