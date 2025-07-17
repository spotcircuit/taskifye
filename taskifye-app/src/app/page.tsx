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
  ChevronRight, BarChart3, Wrench, Home, Settings
} from 'lucide-react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [businessType, setBusinessType] = useState('')

  const stats = [
    { value: '500+', label: 'Service Businesses' },
    { value: '50K+', label: 'Jobs Completed' },
    { value: '$25M+', label: 'Revenue Tracked' },
    { value: '4.9/5', label: 'Customer Rating' },
  ]

  const features = [
    {
      icon: Phone,
      title: 'Never Miss Another $2,000 Call',
      description: 'Automatic call answering and booking system captures every lead, whether you\'re in surgery, court, or on a job site'
    },
    {
      icon: Settings,
      title: 'Stop Juggling 12 Different Systems',
      description: 'We orchestrate QuickBooks, your scheduling software, payment systems, and more - one dashboard controls everything'
    },
    {
      icon: DollarSign,
      title: 'Get Paid 3x Faster',
      description: 'Automated invoicing through your existing systems - from dental cleanings to roof repairs, clients pay within 24 hours'
    },
    {
      icon: TrendingUp,
      title: 'Book 40% More Appointments With Same Staff',
      description: 'Whether it\'s patient appointments, legal consultations, or service calls - smart automation fills your calendar'
    },
    {
      icon: MessageSquare,
      title: 'Stop Playing Phone Tag',
      description: 'Automated updates for appointment confirmations, project status, case updates - works for any business type'
    },
    {
      icon: BarChart3,
      title: 'See Which Services Actually Make Money',
      description: 'Know your profit per client, per service, per team member - from legal cases to construction projects'
    },
  ]

  const testimonials = [
    {
      name: 'Dr. Sarah Martinez',
      company: 'Radiance Medical Spa',
      role: 'Owner',
      content: 'Taskifye orchestrates our entire operation. We\'re booking 40% more treatments with the same staff, and our clients love the seamless experience.',
      rating: 5,
      image: '/testimonial-1.jpg'
    },
    {
      name: 'James Wilson',
      company: 'Wilson & Associates Law',
      role: 'Managing Partner',
      content: 'The 24/7 client intake system alone brought us $300K in new cases this year. Our QuickBooks integration saves our bookkeeper 20 hours monthly.',
      rating: 5,
      image: '/testimonial-2.jpg'
    },
    {
      name: 'Mike Rodriguez',
      company: 'Elite Construction Group',
      role: 'CEO',
      content: 'We\'ve doubled our project capacity without hiring more staff. The system orchestrates everything from estimates to final invoicing.',
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
              <Link href="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                  Taskifye
                </h1>
              </Link>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Glassmorphism Badge */}
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-xl">
              <Zap className="w-5 h-5 text-yellow-400 mr-2 animate-pulse" />
              <span className="text-white font-medium">Trusted by 10,000+ Professional Service Businesses</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                Stop Losing
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                $50K+ Annually
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-4xl mx-auto">
              Whether you run a <span className="font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">contractor, medical spa, law firm, or dental practice</span> - 
              we orchestrate your entire tech stack so you capture every lead, 
              eliminate scheduling disasters, and get paid 3x faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105">
                <span className="relative z-10 flex items-center">
                  See Your Lost Revenue 
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>
              <Button size="lg" variant="outline" className="group bg-white/10 backdrop-blur-lg border-2 border-white/30 hover:border-white/50 text-white px-10 py-6 text-xl font-bold rounded-2xl transition-all duration-500 hover:bg-white/20">
                <span className="flex items-center">
                  Watch 2-Min Demo
                  <div className="ml-3 w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
                  </div>
                </span>
              </Button>
            </div>

            {/* Lead Magnet Form */}
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-2xl max-w-xl mx-auto">
              <h3 className="text-3xl font-bold mb-3 text-white">See How Much You're Losing</h3>
              <p className="text-gray-200 mb-8 text-lg">
                Get a free audit showing exactly how much missed calls, scheduling chaos, and disconnected systems are costing your business (most professional service businesses lose $50K+ annually)
              </p>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl py-4 text-lg"
                />
                <Input
                  type="text"
                  placeholder="Business type (e.g., Medical Spa, Law Firm, Construction)"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-gray-300 rounded-xl py-4 text-lg"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Show Me My Lost Revenue (Free)
                </Button>
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
      <section id="features" className="relative py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
              <Zap className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-semibold">Revenue Recovery System</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Stop the Money Leaks
              </span>
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              The 3 biggest profit killers in professional service businesses - and exactly how we fix them
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <Card className="relative bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">{feature.description}</p>
                    
                    {/* Hover Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
              <Users className="w-5 h-5 text-blue-300 mr-2" />
              <span className="text-white font-semibold">Client Success Stories</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Real Results From Real
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Professional Services
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              See the actual revenue increases, time savings, and growth our clients achieved
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="group relative animate-float" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <Card className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-white/10 transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex mb-6 justify-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                      ))}
                    </div>
                    <p className="text-white mb-8 text-lg leading-relaxed italic text-center">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4 justify-center">
                      <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white text-lg">{testimonial.name}</p>
                        <p className="text-gray-300">{testimonial.role}</p>
                        <p className="text-blue-300 font-semibold">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="relative py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-pink-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-semibold">Proven ROI Results</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Real Results from Real
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional Services
              </span>
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              See how service businesses are transforming with Taskifye
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div key={study.company} className="group relative animate-float" style={{animationDelay: `${index * 0.3}s`}}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer">
                  <CardContent className="p-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white inline-flex items-center px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
                      {study.industry}
                    </div>
                    <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {study.metric}
                    </h3>
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed">{study.description}</p>
                    <div className="flex items-center text-blue-600 font-bold group-hover:gap-3 transition-all duration-300">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Read case study</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                    
                    {/* Animated border */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor'}}></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Pay $1,000/Month or Keep Losing $10,000+
            </h2>
            <p className="text-xl text-gray-600">
              Most professional service businesses lose $50K+ annually to missed calls, scheduling chaos, and disconnected systems. We orchestrate everything for less than you lose in a week.
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
                  'Capture every $2,000+ call (even when busy)',
                  'Stop losing 2+ hours per scheduling mistake',
                  'Get paid 3x faster with instant invoicing',
                  'Book 40% more jobs with same staff',
                  'Eliminate 80% of angry customer calls',
                  'See exactly which jobs make money',
                  'ROI guarantee: 5x return or money back'
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
              We Know Your Exact Pain Points
            </h2>
            <p className="text-xl text-gray-600">
              Every trade has unique challenges. Here's how we solve the biggest profit killers in each industry.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Wrench, name: 'Construction', problem: 'Job sites scattered across town', solution: 'Smart routing saves 15 hours/week' },
              { icon: Shield, name: 'Medical Spas', problem: 'Double-booked appointments', solution: 'Automated scheduling = 40% more clients' },
              { icon: Briefcase, name: 'Law Firms', problem: 'Clients calling after hours', solution: '24/7 intake = $300K+ more cases' },
              { icon: Users, name: 'Dental Practices', problem: 'No-shows kill profitability', solution: 'Smart reminders cut no-shows 80%' },
            ].map((industry) => (
              <Card key={industry.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <industry.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{industry.name}</h3>
                  <p className="text-sm text-red-600 mb-2 font-medium">{industry.problem}</p>
                  <p className="text-sm text-green-600 font-medium">{industry.solution}</p>
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
            Every Day You Wait Costs You $500-2,000
          </h2>
          <p className="text-xl mb-8 opacity-90">
            While you're reading this, competitors are capturing the calls you're missing. Start your 14-day trial and see the difference in week one.
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