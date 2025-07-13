# Architecture Decisions: n8n vs Direct API

## Core Principle: Light UI, Heavy Backend

The UI remains a thin presentation layer while n8n handles complex orchestration and data transformations.

## When to Use Direct API Calls

Use direct API calls from the UI/backend for:

### 1. **Simple Read Operations**
- Fetching current user data
- Loading a single contact/deal
- Checking API connection status
- Real-time dashboard updates

```javascript
// Example: Direct Pipedrive API call
const getContact = async (contactId) => {
  return await pipedriveClient.getPersons(contactId);
}
```

### 2. **User-Initiated Single Actions**
- Creating a single contact
- Updating a deal stage
- Adding a note
- Sending a single SMS

### 3. **Real-Time Requirements**
- Live search/autocomplete
- Instant validation
- UI state updates
- Quick status checks

### 4. **Simple CRUD Operations**
- Create/Read/Update/Delete single records
- No complex business logic
- No multi-system coordination

## When to Use n8n Workflows

Use n8n workflows for:

### 1. **Multi-Step Processes**
```
Example: New Customer Onboarding
1. Create contact in Pipedrive
2. Create customer in QuickBooks
3. Send welcome SMS via Twilio
4. Schedule initial appointment
5. Create follow-up tasks
```

### 2. **Data Transformations**
```
Example: QuickBooks Invoice Sync
1. Fetch completed job from Pipedrive
2. Transform deal data to invoice format
3. Map service items to QB products
4. Calculate taxes and totals
5. Create invoice in QuickBooks
6. Update deal with invoice number
```

### 3. **Scheduled/Batch Operations**
- Daily sync of all contacts
- Weekly maintenance reminders
- Monthly invoice reconciliation
- Bulk data imports/exports

### 4. **Error-Prone Operations**
```
Example: Payment Processing
1. Attempt charge via Stripe
2. If fails, retry with exponential backoff
3. If still fails, create task for manual follow-up
4. Log all attempts for audit
```

### 5. **Complex Business Logic**
```
Example: Smart Scheduling
1. Check technician availability
2. Calculate drive times via Google Maps
3. Check weather conditions
4. Verify customer preferences
5. Apply business rules (no Joe on Fridays)
6. Book appointment
7. Send confirmations
```

### 6. **Integration Webhooks**
```
Example: Pipedrive Deal Won
1. Receive webhook from Pipedrive
2. Create project in job tracking
3. Generate invoice in QuickBooks
4. Send contract via DocuSign
5. Schedule kickoff call
6. Notify team in Slack
```

## Architecture Patterns

### Pattern 1: UI → API → n8n (Async)
```
User clicks "Generate Invoice"
→ API queues job to n8n
→ UI shows "Processing..."
→ n8n workflow runs
→ Webhook updates UI when complete
```

### Pattern 2: UI → n8n (Webhook)
```
User submits service request form
→ Form data sent to n8n webhook
→ n8n handles entire process
→ Returns confirmation to UI
```

### Pattern 3: Scheduled n8n → Database
```
Every 15 minutes:
→ n8n syncs Pipedrive → Database
→ UI always reads from database
→ Fast, consistent user experience
```

## Decision Matrix

| Scenario | Direct API | n8n Workflow |
|----------|------------|--------------|
| Show list of contacts | ✅ | ❌ |
| Create contact + QB customer + send SMS | ❌ | ✅ |
| Update deal stage | ✅ | ❌ |
| Bulk import 1000 contacts | ❌ | ✅ |
| Search contacts | ✅ | ❌ |
| Daily sync all systems | ❌ | ✅ |
| Get real-time availability | ✅ | ❌ |
| Complex quote generation | ❌ | ✅ |
| View invoice status | ✅ | ❌ |
| Reconcile payments | ❌ | ✅ |

## n8n Workflow Categories

### 1. **Sync Workflows**
- `sync-contacts-pipedrive-quickbooks`
- `sync-invoices-quickbooks-pipedrive`
- `sync-calendar-appointments`

### 2. **Automation Workflows**
- `new-lead-automation`
- `job-completion-flow`
- `payment-follow-up-sequence`
- `maintenance-reminder-campaign`

### 3. **AI Workflows**
- `ai-chat-knowledge-update`
- `ai-schedule-optimization`
- `ai-lead-scoring`

### 4. **Reporting Workflows**
- `daily-performance-summary`
- `weekly-revenue-report`
- `technician-productivity-analysis`

### 5. **Integration Workflows**
- `webhook-handler-pipedrive`
- `webhook-handler-quickbooks`
- `webhook-handler-calendly`

## Implementation Guidelines

### 1. **Workflow Naming Convention**
```
{action}-{source}-{destination}-{frequency}
Examples:
- sync-contacts-pipedrive-quickbooks-hourly
- create-invoice-job-complete-triggered
- send-reminder-appointment-daily
```

### 2. **Error Handling**
All n8n workflows must include:
- Try/catch blocks
- Retry logic with backoff
- Error notification to admin
- Fallback to manual process

### 3. **Monitoring**
- Log all workflow executions
- Track success/failure rates
- Alert on repeated failures
- Performance metrics

### 4. **Version Control**
- Export workflows as JSON
- Store in git repository
- Tag stable versions
- Document breaking changes

## UI Implementation

### Light UI Principles

1. **No Business Logic**
   - UI only handles display and user input
   - All calculations in API or n8n

2. **Optimistic Updates**
   - Show immediate feedback
   - Queue background processes
   - Handle eventual consistency

3. **Status Communication**
   ```javascript
   // Example: Invoice generation
   const generateInvoice = async (jobId) => {
     // Quick API call to queue the job
     const { workflowId } = await api.queueInvoiceGeneration(jobId);
     
     // Show status in UI
     showStatus('Invoice generation started...');
     
     // Poll for completion or use websocket
     pollWorkflowStatus(workflowId);
   };
   ```

4. **Caching Strategy**
   - Cache read-heavy data locally
   - Let n8n handle sync in background
   - Invalidate cache on user actions

## Example: Job Completion Flow

### Current (Heavy UI) ❌
```javascript
// UI handles everything
const completeJob = async (jobId) => {
  const job = await getJob(jobId);
  const invoice = await createInvoice(job);
  await updateQuickBooks(invoice);
  await sendSMS(job.customer, 'Job complete!');
  await createFollowUp(job);
  await updateDashboard();
};
```

### New Architecture (Light UI + n8n) ✅

**UI Code:**
```javascript
// UI just triggers workflow
const completeJob = async (jobId) => {
  await api.triggerWorkflow('job-completion', { jobId });
  showStatus('Processing job completion...');
};
```

**n8n Workflow: `job-completion`**
1. **Trigger**: Webhook receives jobId
2. **Get Job**: Fetch from Pipedrive
3. **Create Invoice**: Transform data, create in QB
4. **Send Notifications**: 
   - SMS to customer
   - Email receipt
   - Slack to team
5. **Create Follow-ups**:
   - Review request in 3 days
   - Maintenance reminder in 6 months
6. **Update Systems**:
   - Mark deal as won
   - Update customer lifetime value
   - Refresh dashboard cache
7. **Error Handling**: 
   - If any step fails, create manual task
   - Notify admin

## Benefits of This Architecture

1. **Reliability**: n8n handles retries and error recovery
2. **Flexibility**: Easy to modify workflows without code changes
3. **Scalability**: UI remains fast regardless of backend complexity
4. **Maintainability**: Business logic centralized in n8n
5. **Visibility**: Visual workflow editor shows entire process
6. **Testability**: Can test workflows independently of UI

## Anti-Patterns to Avoid

1. **Don't use n8n for**:
   - Simple GET requests
   - Real-time user interactions
   - UI state management

2. **Don't use direct API for**:
   - Multi-step processes
   - Heavy data transformations
   - Scheduled tasks

3. **Don't mix approaches**:
   - Avoid partial workflow in UI, partial in n8n
   - Keep clear boundaries