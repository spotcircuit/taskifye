'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { businessTemplates } from '@/config/business-templates'
import { Upload, Palette, RotateCcw, Save, AlertCircle, Image, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function BrandingSettings() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [businessType, setBusinessType] = useState('hvac')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Local state for form data
  const [formData, setFormData] = useState({
    companyName: '',
    slogan: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    supportEmail: '',
    supportPhone: '',
    website: '',
    emailSignature: ''
  })

  // Load branding data on mount
  useEffect(() => {
    loadBrandingData()
  }, [])
  
  const loadBrandingData = async () => {
    setIsLoading(true)
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/settings/branding', {
        headers: {
          'x-client-id': clientId
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData({
          companyName: data.companyName || '',
          slogan: data.tagline || '',
          logoUrl: data.logoUrl || '',
          primaryColor: data.primaryColor || '#3b82f6',
          secondaryColor: data.secondaryColor || '#10b981',
          supportEmail: data.supportEmail || '',
          supportPhone: data.supportPhone || '',
          website: data.website || '',
          emailSignature: data.emailSignature || ''
        })
        // Load business type from localStorage (not stored in branding table)
        const savedType = localStorage.getItem('business_type')
        if (savedType) setBusinessType(savedType)
      }
    } catch (error) {
      console.error('Failed to load branding:', error)
      toast({
        title: 'Failed to load branding settings',
        description: 'Using default values',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const clientId = localStorage.getItem('current_client_id') || 'client-1'
      const response = await fetch('/api/settings/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          tagline: formData.slogan,
          logoUrl: formData.logoUrl,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          supportEmail: formData.supportEmail,
          supportPhone: formData.supportPhone,
          website: formData.website,
          emailSignature: formData.emailSignature
        })
      })
      
      if (!response.ok) throw new Error('Failed to save')
      
      // Store business type separately
      localStorage.setItem('business_type', businessType)
      
      // Apply CSS variables immediately
      document.documentElement.style.setProperty('--primary-color', formData.primaryColor)
      document.documentElement.style.setProperty('--secondary-color', formData.secondaryColor)
      
      toast({
        title: 'Branding settings saved',
        description: 'Your changes have been saved successfully'
      })
    } catch (error) {
      console.error('Failed to save branding:', error)
      toast({
        title: 'Failed to save settings',
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB')
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all branding to defaults?')) {
      setFormData({
        companyName: '',
        slogan: '',
        logoUrl: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        supportEmail: '',
        supportPhone: '',
        website: '',
        emailSignature: ''
      })
      setBusinessType('hvac')
      localStorage.removeItem('business_type')
      toast({
        title: 'Reset to defaults',
        description: 'Branding has been reset. Remember to save your changes.'
      })
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Company Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Company Identity</CardTitle>
          <CardDescription>
            Customize your company branding and identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan / Tagline</Label>
              <Input
                id="slogan"
                value={formData.slogan}
                onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                placeholder="Your company slogan"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(businessTemplates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This determines service types and custom fields for your business
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Upload your company logo (PNG, JPG, or SVG, max 2MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Company logo"
                  className="w-32 h-32 object-contain border rounded-lg p-2"
                />
              ) : (
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
              {formData.logoUrl && (
                <Button
                  variant="ghost"
                  onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                  className="text-destructive"
                >
                  Remove Logo
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, minimum 200x200px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            Customize your brand colors (affects buttons and accents)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <Alert>
            <Palette className="h-4 w-4" />
            <AlertDescription>
              Color changes will apply to buttons, links, and other UI elements throughout the application.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Support Contact Information</CardTitle>
          <CardDescription>
            Contact details shown to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                placeholder="support@yourcompany.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={formData.supportPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, supportPhone: e.target.value }))}
                placeholder="1-800-YOUR-BIZ"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourcompany.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailSignature">Email Signature</Label>
            <Textarea
              id="emailSignature"
              value={formData.emailSignature}
              onChange={(e) => setFormData(prev => ({ ...prev, emailSignature: e.target.value }))}
              placeholder="Thank you for choosing [Company Name]!"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This signature will be added to automated emails
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}