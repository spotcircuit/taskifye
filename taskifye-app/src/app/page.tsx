'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowRight, CheckCircle, Star, Users, Briefcase, 
  DollarSign, Clock, Calendar, MessageSquare, 
  TrendingUp, Shield, Zap, Phone, Mail, 
  ChevronRight, BarChart3, Wrench, Home
} from 'lucide-react'

export default function HomePage() {
  const [email, setEmail] = useState('')

  const stats = [
    { value: '500+', label: 'Service Businesses' },
    { value: '50K+', label: 'Jobs Completed' },
    { value: '$25M+', label: 'Revenue Tracked' },
    { value: '4.9/5', label: 'Customer Rating' },
  ]

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered scheduling that maximizes your team efficiency and reduces drive time'
    },
    {
      icon: MessageSquare,
      title: 'Automated Communication',
      description: 'Keep customers informed with automated SMS updates and appointment reminders'
    },
    {
      icon: DollarSign,
      title: 'Instant Invoicing',
      description: 'Generate and send professional invoices on-site, get paid faster'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track performance, revenue, and growth with actionable insights'
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Complete history, preferences, and communication in one place'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance with industry standards'
    },
  ]

  const testimonials = [
    {
      name: 'Mike Thompson',
      company: 'Thompson HVAC Services',
      role: 'Owner',
      content: 'Taskifye transformed our business. We\'re completing 30% more jobs with the same team, and our customers love the professional experience.',
      rating: 5,
      image: '/testimonial-1.jpg'
    },
    {
      name: 'Sarah Rodriguez',
      company: 'Premium Plumbing Co.',
      role: 'Operations Manager',
      content: 'The automation features alone save us 15 hours per week. Our technicians can focus on what they do best - serving customers.',
      rating: 5,
      image: '/testimonial-2.jpg'
    },
    {
      name: 'David Chen',
      company: 'Lightning Electric',
      role: 'CEO',
      content: 'We\'ve doubled our revenue in 18 months using Taskifye. The insights help us make better decisions every day.',
      rating: 5,
      image: '/testimonial-3.jpg'
    },
  ]

  const caseStudies = [
    {
      company: 'Johnson HVAC',
      industry: 'HVAC',
      metric: '47% Revenue Increase',
      description: 'Learn how Johnson HVAC scaled from $2M to $3M in annual revenue',
      image: '/case-study-1.jpg'
    },
    {
      company: 'Elite Roofing',
      industry: 'Roofing',
      metric: '2.5x More Jobs',
      description: 'How Elite Roofing handles 250% more jobs with the same crew',
      image: '/case-study-2.jpg'
    },
    {
      company: 'FastFix Plumbing',
      industry: 'Plumbing',
      metric: '89% On-Time Rate',
      description: 'From 60% to 89% on-time arrivals in just 6 months',
      image: '/case-study-3.jpg'
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Taskifye
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">Features</Link>
                <Link href="#testimonials" className="text-sm font-medium hover:text-blue-600 transition-colors">Testimonials</Link>
                <Link href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">Pricing</Link>
                <Link href="#case-studies" className="text-sm font-medium hover:text-blue-600 transition-colors">Case Studies</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Login</Button>
              </Link>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              Trusted by 500+ Service Businesses
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              The All-in-One Platform for
              <span className="text-blue-600"> Service Businesses</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop juggling multiple tools. Taskifye brings scheduling, dispatching, invoicing, 
              and customer management into one powerful platform designed for HVAC, plumbing, 
              electrical, and roofing businesses.
            </p>

            {/* Lead Magnet Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl mx-auto mt-8">
              <h3 className="text-2xl font-bold mb-2">Get Your Free Business Growth Guide</h3>
              <p className="text-gray-600 mb-6">
                Learn the 7 strategies top service businesses use to double their revenue
              </p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Get Free Guide + Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-gray-500">
                  No credit card required. Instant access.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to Run Your Service Business
            </h2>
            <p className="text-xl text-gray-600">
              Purpose-built features that actually solve your daily challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Service Pros Love Taskifye
            </h2>
            <p className="text-xl text-gray-600">
              Join hundreds of businesses growing with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Real Results from Real Businesses
            </h2>
            <p className="text-xl text-gray-600">
              See how service businesses are transforming with Taskifye
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study) => (
              <Card key={study.company} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="bg-blue-100 text-blue-700 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {study.industry}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{study.metric}</h3>
                  <p className="text-gray-600 mb-4">{study.description}</p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                    Read case study
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              One price, unlimited users, all features included
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold mb-2">$1,000</div>
                <div className="text-gray-600">per month</div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Unlimited users & technicians',
                  'All features included',
                  'Unlimited jobs & customers',
                  'Free onboarding & training',
                  'Priority support',
                  'Custom integrations',
                  'No hidden fees'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Start 14-Day Free Trial
                </Button>
                <p className="text-center text-sm text-gray-600">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Need a custom quote for enterprise? 
              <Link href="#contact" className="text-blue-600 font-medium ml-1">Contact us</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Built for Your Industry
            </h2>
            <p className="text-xl text-gray-600">
              Specialized features for every type of service business
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Wrench, name: 'HVAC', count: '150+ businesses' },
              { icon: Home, name: 'Plumbing', count: '120+ businesses' },
              { icon: Zap, name: 'Electrical', count: '100+ businesses' },
              { icon: Home, name: 'Roofing', count: '80+ businesses' },
            ].map((industry) => (
              <Card key={industry.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <industry.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{industry.name}</h3>
                  <p className="text-sm text-gray-600">{industry.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Service Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ service businesses already growing with Taskifye
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Phone className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Taskifye</h3>
              <p className="text-sm">
                The all-in-one platform for modern service businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#case-studies" className="hover:text-white">Case Studies</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Get in Touch</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-TASKIFYE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@taskifye.com</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm mb-2">Subscribe to our newsletter</p>
                <form className="flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="Enter email" 
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button size="sm">Subscribe</Button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Taskifye. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}