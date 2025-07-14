'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useBranding } from '@/contexts/branding-context'
import { businessTemplates } from '@/config/business-templates'
import { Upload, Palette, RotateCcw, Save, AlertCircle, Image } from 'lucide-react'

export function BrandingSettings() {
  const { branding, updateBranding, resetBranding } = useBranding()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [businessType, setBusinessType] = useState('hvac')
  const [previewLogo, setPreviewLogo] = useState<string | null>(branding.logoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // In a real app, you'd upload the logo to storage here
      // For now, we'll just save to database via context
      
      await updateBranding({
        logoUrl: previewLogo || undefined
      })
      
      // Store business type separately
      localStorage.setItem('business_type', businessType)
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save branding:', error)
      alert('Failed to save branding settings. Please try again.')
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
        setPreviewLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all branding to defaults?')) {
      try {
        await resetBranding()
        setPreviewLogo(null)
        setBusinessType('hvac')
        localStorage.removeItem('business_type')
      } catch (error) {
        console.error('Failed to reset branding:', error)
        alert('Failed to reset branding. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Branding settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

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
                value={branding.companyName}
                onChange={(e) => updateBranding({ companyName: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan / Tagline</Label>
              <Input
                id="slogan"
                value={branding.slogan || ''}
                onChange={(e) => updateBranding({ slogan: e.target.value })}
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
              {previewLogo ? (
                <img
                  src={previewLogo}
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
              {previewLogo && (
                <Button
                  variant="ghost"
                  onClick={() => setPreviewLogo(null)}
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
                  value={branding.primaryColor || '#3b82f6'}
                  onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={branding.primaryColor || '#3b82f6'}
                  onChange={(e) => updateBranding({ primaryColor: e.target.value })}
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
                  value={branding.secondaryColor || '#10b981'}
                  onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={branding.secondaryColor || '#10b981'}
                  onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
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
                value={branding.supportEmail || ''}
                onChange={(e) => updateBranding({ supportEmail: e.target.value })}
                placeholder="support@yourcompany.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={branding.supportPhone || ''}
                onChange={(e) => updateBranding({ supportPhone: e.target.value })}
                placeholder="1-800-YOUR-BIZ"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={branding.website || ''}
              onChange={(e) => updateBranding({ website: e.target.value })}
              placeholder="https://yourcompany.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailSignature">Email Signature</Label>
            <Textarea
              id="emailSignature"
              value={branding.emailSignature || ''}
              onChange={(e) => updateBranding({ emailSignature: e.target.value })}
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