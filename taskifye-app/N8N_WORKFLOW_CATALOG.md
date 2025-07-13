# n8n Workflow Catalog for Taskifye

## Core Workflows by Category

### 🔄 Synchronization Workflows

#### 1. **Contact Sync Suite**
```yaml
Name: sync-contacts-bidirectional
Trigger: Every 15 minutes + Manual
Systems: Pipedrive ↔ QuickBooks
Steps:
  1. Fetch all contacts modified in last 15 min from Pipedrive
  2. Check if exists in QuickBooks
  3. Transform data (Pipedrive person → QB customer)
  4. Create/Update in QuickBooks
  5. Sync QB customers back to Pipedrive
  6. Handle conflicts (last modified wins)
  7. Log sync results
```

#### 2. **Invoice Sync**
```yaml
Name: sync-invoices-quickbooks-pipedrive
Trigger: QuickBooks webhook + Hourly backup
Systems: QuickBooks → Pipedrive
Steps:
  1. Receive invoice created/updated webhook
  2. Find associated deal in Pipedrive
  3. Update deal custom fields (invoice #, amount, status)
  4. Add note with invoice details
  5. Update deal stage if paid
```

### 📥 Lead Processing Workflows

#### 3. **New Lead Automation**
```yaml
Name: process-new-lead-complete
Trigger: Web form submission / API call
Steps:
  1. Validate lead data
  2. Check for duplicates across systems
  3. Enrich data (phone lookup, address validation)
  4. Create person in Pipedrive
  5. Create deal with service type
  6. Assign to available sales rep (round-robin)
  7. Send welcome SMS via Twilio
  8. Send intro email with booking link
  9. Create follow-up activity for tomorrow
  10. Notify sales team in Slack
```

#### 4. **Lead Scoring & Routing**
```yaml
Name: score-and-route-leads
Trigger: New Pipedrive person created
Steps:
  1. Analyze lead source and data completeness
  2. Check service area (GPS validation)
  3. Query previous interaction history
  4. Calculate lead score (0-100)
  5. Route based on score:
     - Hot (80+): Immediate SMS to sales manager
     - Warm (50-79): Standard automation
     - Cold (<50): Nurture campaign
  6. Set custom field with score
  7. Trigger appropriate follow-up workflow
```

### 📅 Scheduling & Dispatch Workflows

#### 5. **Smart Appointment Booking**
```yaml
Name: book-appointment-intelligent
Trigger: Booking request (API/Form)
Input: Service type, location, preferred dates
Steps:
  1. Get available technicians for date range
  2. Filter by required skills/certifications
  3. Calculate drive time from previous appointments
  4. Check weather forecast (for outdoor work)
  5. Apply business rules:
     - No back-to-back far locations
     - Respect lunch breaks
     - Senior tech for complex jobs
  6. Present top 3 slot options
  7. Book appointment on confirmation
  8. Update tech calendar
  9. Send confirmations (SMS + Email)
  10. Create prep checklist for tech
```

#### 6. **Daily Route Optimization**
```yaml
Name: optimize-daily-routes
Trigger: Every day at 5 AM
Steps:
  1. Get all appointments for today
  2. Group by technician
  3. For each technician:
     - Get home/start location
     - Calculate optimal route (Google Maps API)
     - Consider traffic patterns
     - Add buffer time between jobs
  4. Generate route map and directions
  5. Send to technician mobile app
  6. Email summary to dispatch
```

### 💼 Job Management Workflows

#### 7. **Job Completion Flow**
```yaml
Name: complete-job-full-cycle
Trigger: Tech marks job complete in app
Steps:
  1. Validate job completion data
  2. Process photos (resize, watermark, store)
  3. Generate invoice from job details
  4. Create invoice in QuickBooks
  5. Update Pipedrive deal stage to "Won"
  6. Send completion notification to customer
  7. Include invoice and payment link
  8. Schedule review request for +3 days
  9. Create maintenance reminder for +6 months
  10. Update technician productivity metrics
  11. If commercial client: update contract usage
```

#### 8. **Estimate to Job Conversion**
```yaml
Name: convert-estimate-to-job
Trigger: Customer approves estimate
Steps:
  1. Update deal stage in Pipedrive
  2. Create project in job tracking system
  3. Check inventory for required parts
  4. Auto-order if low stock
  5. Schedule job based on availability
  6. Assign team based on requirements
  7. Send confirmation to customer
  8. Create job packet for technician
  9. Set up payment terms in QuickBooks
```

### 💰 Financial Workflows

#### 9. **Payment Processing & Follow-up**
```yaml
Name: process-payment-with-retry
Trigger: Invoice due date reached
Steps:
  1. Check payment status in QuickBooks
  2. If unpaid:
     - Send friendly reminder SMS
     - Include payment link
  3. Wait 3 days
  4. If still unpaid:
     - Send email reminder
     - Call customer (log attempt)
  5. After 7 days:
     - Create task for collections
     - Apply late fee if configured
  6. If paid:
     - Send thank you message
     - Update all systems
     - Trigger review request
```

#### 10. **Revenue Recognition**
```yaml
Name: recognize-revenue-monthly
Trigger: First day of month
Steps:
  1. Get all completed jobs from last month
  2. Match with QuickBooks invoices
  3. Calculate recognized revenue
  4. Handle partial completions
  5. Adjust for refunds/credits
  6. Generate revenue report
  7. Update financial dashboard
  8. Email to management
```

### 🤖 AI-Powered Workflows

#### 11. **AI Knowledge Base Update**
```yaml
Name: update-ai-assistant-knowledge
Trigger: Daily at 2 AM + Manual
Steps:
  1. Extract new FAQs from support tickets
  2. Get updated service information
  3. Pull recent customer interactions
  4. Generate training data format
  5. Update AI assistant context
  6. Test with sample questions
  7. Log performance metrics
  8. Alert if accuracy drops
```

#### 12. **Predictive Maintenance Alerts**
```yaml
Name: predict-maintenance-needs
Trigger: Weekly analysis
Steps:
  1. Query customer equipment history
  2. Calculate time since last service
  3. Check manufacturer recommendations
  4. Analyze failure patterns
  5. Factor in usage patterns
  6. Generate maintenance predictions
  7. Create targeted campaigns
  8. Send personalized reminders
  9. Pre-book tentative appointments
```

### 📊 Reporting Workflows

#### 13. **Daily Business Intelligence**
```yaml
Name: generate-daily-kpi-report
Trigger: Every day at 6 PM
Steps:
  1. Aggregate data from all systems
  2. Calculate KPIs:
     - Jobs completed
     - Revenue generated
     - Average job time
     - Customer satisfaction
     - Tech utilization
  3. Compare to targets
  4. Identify anomalies
  5. Generate insights using AI
  6. Create visual dashboard
  7. Send to management
  8. Post key metrics to Slack
```

### 🔧 Utility Workflows

#### 14. **Data Quality Monitor**
```yaml
Name: monitor-data-quality
Trigger: Every 6 hours
Steps:
  1. Check for duplicate records
  2. Validate required fields
  3. Verify data consistency across systems
  4. Flag anomalies:
     - Customers without contacts
     - Deals without activities
     - Invoices without deals
  5. Auto-fix simple issues
  6. Create tasks for complex issues
  7. Generate quality report
```

#### 15. **System Health Check**
```yaml
Name: check-integration-health
Trigger: Every 30 minutes
Steps:
  1. Ping all API endpoints
  2. Verify authentication tokens
  3. Check rate limits
  4. Test sample operations
  5. Monitor sync delays
  6. If issues detected:
     - Attempt auto-recovery
     - Switch to backup if available
     - Alert technical team
     - Update status page
```

## Workflow Development Guidelines

### Template Structure
```javascript
{
  "name": "workflow-name",
  "nodes": [
    {
      "type": "webhook",
      "parameters": {
        "path": "workflow-name",
        "responseMode": "lastNode"
      }
    },
    {
      "type": "function",
      "parameters": {
        "code": "// Data validation and transformation"
      }
    },
    {
      "type": "if",
      "parameters": {
        "conditions": "// Business logic"
      }
    },
    {
      "type": "http-request",
      "parameters": {
        "url": "// External API call"
      }
    }
  ],
  "settings": {
    "errorWorkflow": "error-handler",
    "timezone": "America/New_York",
    "saveExecutionProgress": true
  }
}
```

### Error Handling Pattern
Every workflow should include:
1. Try-catch blocks around external calls
2. Retry logic with exponential backoff
3. Error notification workflow trigger
4. Graceful degradation options
5. Manual intervention tasks when needed

### Performance Optimization
1. Use batch operations where possible
2. Implement caching for frequent lookups
3. Parallel execution for independent steps
4. Pagination for large data sets
5. Async processing for long operations

## Deployment Strategy

### Environments
- **Development**: Test new workflows
- **Staging**: Integration testing
- **Production**: Live workflows

### Version Control
```
workflows/
├── core/
│   ├── sync-contacts-v2.json
│   ├── process-payment-v3.json
├── custom/
│   ├── client-specific/
├── deprecated/
│   ├── old-workflow-v1.json
└── README.md
```

### Monitoring Dashboard
Track for each workflow:
- Execution count
- Success rate
- Average duration
- Error frequency
- Resource usage