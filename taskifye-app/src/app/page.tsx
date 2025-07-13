export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Taskifye
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Your White-Label Integration Hub
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold mb-4">Unified Dashboard</h2>
            <p className="text-muted-foreground">
              See all your tools in one beautiful interface
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold mb-4">Smart Integrations</h2>
            <p className="text-muted-foreground">
              Connect Pipedrive, ReachInbox, Twilio and more
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold mb-4">White-Label Ready</h2>
            <p className="text-muted-foreground">
              Your brand, your colors, your domain
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="/dashboard" 
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}