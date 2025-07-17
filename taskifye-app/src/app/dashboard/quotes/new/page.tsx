import { CreateQuoteForm } from '@/components/quotes/create-quote-form'

export default function NewQuotePage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Quote</h1>
        <p className="text-muted-foreground mt-2">
          Generate a professional quote for your customer
        </p>
      </div>
      <CreateQuoteForm />
    </div>
  )
}