# Taskifye Deployment Guide

## Initial Setup for New Customers

### 1. Pipedrive Custom Fields Setup

When onboarding a new customer, the following custom fields need to be created in their Pipedrive account:

#### Deal (Job) Custom Fields:
```javascript
// Run this setup script via API or use the setup endpoint
const customFields = [
  {
    name: "Service Type",
    field_type: "enum",
    options: [
      "HVAC Repair",
      "HVAC Maintenance", 
      "AC Installation",
      "Furnace Repair",
      "Plumbing",
      "Electrical",
      "Emergency Service",
      "Other"
    ]
  },
  {
    name: "Priority",
    field_type: "enum", 
    options: ["Low", "Medium", "High", "Urgent"]
  },
  {
    name: "Service Address",
    field_type: "address"
  },
  {
    name: "Scheduled Time",
    field_type: "time"
  },
  {
    name: "Job Type",
    field_type: "enum",
    options: ["Service Call", "Maintenance", "Installation", "Emergency", "Quote Only"]
  },
  {
    name: "Technician Notes",
    field_type: "text"
  },
  {
    name: "Materials Used",
    field_type: "text"
  },
  {
    name: "Time Spent (hours)",
    field_type: "double"
  },
  {
    name: "Before Photos URL",
    field_type: "text"
  },
  {
    name: "After Photos URL", 
    field_type: "text"
  },
  {
    name: "Customer Signature URL",
    field_type: "text"
  },
  {
    name: "Invoice Number",
    field_type: "text"
  },
  {
    name: "Invoice Status",
    field_type: "enum",
    options: ["Not Created", "Sent", "Paid", "Overdue"]
  }
]
```

#### Person (Customer) Custom Fields:
```javascript
const personCustomFields = [
  {
    name: "Customer Type",
    field_type: "enum",
    options: ["Residential", "Commercial", "Industrial"]
  },
  {
    name: "Service Address",
    field_type: "address"
  },
  {
    name: "Preferred Contact Method",
    field_type: "enum",
    options: ["Phone", "Email", "SMS"]
  },
  {
    name: "Equipment Details",
    field_type: "text"
  },
  {
    name: "Service Agreement",
    field_type: "enum",
    options: ["None", "Basic", "Premium", "Commercial"]
  },
  {
    name: "Last Service Date",
    field_type: "date"
  }
]
```

### 2. Pipedrive Pipeline Stages Setup

Create stages that match the job workflow:

```javascript
const pipelineStages = [
  { name: "New Lead", order_nr: 1 },
  { name: "Estimate Sent", order_nr: 2 },
  { name: "Scheduled", order_nr: 3 },
  { name: "In Progress", order_nr: 4 },
  { name: "Completed", order_nr: 5 },
  { name: "Invoiced", order_nr: 6 }
]
```

### 3. Environment Variables

Each customer needs these configured:

```bash
# Pipedrive
PIPEDRIVE_API_KEY=customer_api_key_here
PIPEDRIVE_COMPANY_DOMAIN=customercompany

# ReachInbox (shared or per-customer)
REACHINBOX_API_KEY=api_key_here
REACHINBOX_WORKSPACE_ID=workspace_id_here

# Calendly
CALENDLY_API_KEY=api_key_here

# Voice AI (if using)
VOICE_AI_PROVIDER=bland
BLAND_AI_API_KEY=api_key_here

# n8n Webhooks
N8N_RECEPTIONIST_WEBHOOK_URL=https://customer.n8n.io/webhook/receptionist
N8N_API_KEY=n8n_api_key_here
```

### 4. API Endpoint for Initial Setup

Create this endpoint to run during customer onboarding:

`/api/setup/pipedrive-fields`

This will:
1. Create all custom fields
2. Map field IDs for use in the application
3. Create pipeline stages
4. Store field mappings in database

### 5. Additional Integrations Setup

#### For Photo Storage:
- Option 1: Use Supabase Storage (already in stack)
- Option 2: Customer's S3 bucket
- Option 3: Cloudinary

#### For Time Tracking:
- Store in Supabase database
- Or integrate with existing time tracking tools

#### For Digital Signatures:
- Integrate DocuSign or HelloSign
- Or use simple canvas signature stored in Supabase

#### For Invoicing:
- Can use Pipedrive's Products feature
- Or integrate with QuickBooks/Xero
- Or build simple invoicing in Supabase

### 6. n8n Workflows to Deploy

1. **Receptionist Bot Workflow**
   - Webhook receiver
   - OpenAI/Claude integration
   - Pipedrive deal creation
   - Calendar booking

2. **Review Request Automation**
   - Trigger: Deal moves to "Completed"
   - Wait 24 hours
   - Send review request via ReachInbox

3. **Invoice Reminder Workflow**
   - Check overdue invoices daily
   - Send reminders via ReachInbox

4. **Service Reminder Workflow**
   - Check last service dates
   - Send annual maintenance reminders

### 7. Database Schema (Supabase)

Tables needed for features not in Pipedrive:

```sql
-- Time tracking
CREATE TABLE time_entries (
  id UUID PRIMARY KEY,
  pipedrive_deal_id INTEGER,
  technician_id INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Photo storage references
CREATE TABLE job_photos (
  id UUID PRIMARY KEY,
  pipedrive_deal_id INTEGER,
  photo_type VARCHAR(50), -- 'before' or 'after'
  photo_url TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Digital signatures
CREATE TABLE signatures (
  id UUID PRIMARY KEY,
  pipedrive_deal_id INTEGER,
  signature_data TEXT, -- Base64 or URL
  signed_by VARCHAR(255),
  signed_at TIMESTAMP DEFAULT NOW()
);

-- Parts/Materials (if not using external inventory)
CREATE TABLE job_materials (
  id UUID PRIMARY KEY,
  pipedrive_deal_id INTEGER,
  material_name VARCHAR(255),
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  added_at TIMESTAMP DEFAULT NOW()
);
```

### 8. Deployment Checklist

- [ ] Create Pipedrive API token for customer
- [ ] Run custom fields setup script
- [ ] Configure pipeline stages
- [ ] Set up environment variables
- [ ] Deploy n8n workflows
- [ ] Create Supabase tables
- [ ] Configure integrations (ReachInbox, Calendly, etc.)
- [ ] Test all integrations
- [ ] Train customer on system usage

### 9. Maintenance

- Field mappings are stored and cached
- Check for field changes monthly
- Monitor API usage limits
- Update custom field options as needed

## Feature Roadmap & Tech Stack Analysis

### 🟢 **Can Do with CURRENT Tech Stack (Pipedrive + Local DB)**

#### **High Priority Features:**
- ✅ **Schedule/Calendar page** - Use Pipedrive Activities API + local calendar view
- ✅ **Quotes page** - Pipedrive Products/Quotes API + templates in local DB
- ✅ **Invoices page** - Pipedrive custom fields + payment tracking in local DB
- ✅ **Reports & Analytics** - Aggregate Pipedrive data + local analytics DB
- ✅ **Emergency dispatch** - Pipedrive workflow triggers + SMS via existing integrations

#### **Medium Priority Features:**
- ✅ **Team/technician management** - Pipedrive Users API + local user management
- ✅ **Notifications center** - Pipedrive webhooks + local notification storage
- ✅ **Recurring service agreements** - Pipedrive custom fields + local scheduling logic
- ✅ **Performance dashboards** - Pipedrive data aggregation + local analytics
- ✅ **Lead scoring** - Pipedrive custom fields + local scoring algorithms
- ✅ **Multi-location support** - Pipedrive Organizations + local location management
- ✅ **Document management** - File URLs in Pipedrive custom fields + local file metadata
- ✅ **Quality control workflows** - Pipedrive Activities + custom field checklists
- ✅ **Customer communication portal** - Pipedrive data + local customer portal

#### **Lower Priority Features:**
- ✅ **Service agreements/warranties** - Pipedrive custom fields + local contract storage
- ✅ **Review/rating system** - Pipedrive Activities + local review aggregation
- ✅ **Warranty tracking** - Pipedrive custom fields + local warranty database
- ✅ **Marketing automation** - Pipedrive triggers + ReachInbox integration (already have)

### 🟡 **Needs ADDITIONAL Storage (but works with current stack)**

#### **Medium Priority Features:**
- 🔄 **Photo upload/management** - Local file storage + Pipedrive custom field URLs
- 🔄 **Digital signatures** - Local signature storage + Pipedrive custom field URLs
- 🔄 **Time tracking** - Local time tracking DB + sync to Pipedrive custom fields
- 🔄 **Equipment/Asset tracking** - Local asset DB + link to Pipedrive deals
- 🔄 **Inventory management** - Local inventory DB + link to Pipedrive products
- 🔄 **Mobile technician view** - PWA using existing Pipedrive data

### 🔴 **Requires NEW Tech Stack**

#### **Advanced Features:**
- ❌ **GPS tracking/route optimization** - Needs Google Maps API + GPS tracking service
- ❌ **Parts ordering integration** - Needs integration with parts suppliers (Ferguson, etc.)
- ❌ **Compliance/safety checklists** - Might need specialized compliance platform
- ❌ **Customer self-service portal** - Needs customer authentication system

### **Recommended Implementation Order:**

#### **Phase 1: Core Pipedrive Features (Months 1-2)**
1. Schedule/Calendar page with Pipedrive Activities
2. Quotes page with Pipedrive Products API
3. Enhanced Reports using Pipedrive data aggregation
4. Team management with Pipedrive Users API

#### **Phase 2: Local DB Enhancement (Months 3-4)**
5. Time tracking with local DB + Pipedrive sync
6. Photo management with local storage
7. Digital signatures with local capture
8. Performance dashboards with local analytics

#### **Phase 3: Advanced Features (Months 5-6)**
9. Recurring service agreements
10. Equipment/Asset tracking
11. Customer communication portal
12. Quality control workflows

#### **Phase 4: External Integrations (Future)**
13. GPS tracking and route optimization
14. Parts ordering integration
15. Advanced compliance tools
16. Customer self-service portal

### **Database Schema Extensions for Local Features:**

```sql
-- Extend existing Prisma schema
model TimeEntry {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  pipedriveDeaId  Int
  technicianId    String
  startTime       DateTime
  endTime         DateTime?
  durationMinutes Int?
  notes           String?
  createdAt       DateTime @default(now())
}

model JobPhoto {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  pipedriveDeaId  Int
  photoType       String   // 'before', 'after', 'parts', 'issue'
  photoUrl        String
  uploadedAt      DateTime @default(now())
}

model DigitalSignature {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  pipedriveDeaId  Int
  signatureData   String   // Base64 or file URL
  signedBy        String
  signedAt        DateTime @default(now())
}

model Equipment {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  pipedrivePersonId Int?   // Link to customer
  equipmentType   String
  manufacturer    String?
  model           String?
  serialNumber    String?
  installDate     DateTime?
  warrantyExpires DateTime?
  lastServiceDate DateTime?
  notes           String?
  createdAt       DateTime @default(now())
}

model InventoryItem {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  name            String
  description     String?
  sku             String?
  category        String
  currentStock    Int      @default(0)
  minStock        Int      @default(0)
  unitCost        Decimal? @db.Decimal(10, 2)
  unitPrice       Decimal? @db.Decimal(10, 2)
  supplier        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model RecurringService {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  pipedrivePersonId Int
  serviceType     String
  frequency       String   // 'monthly', 'quarterly', 'annually'
  nextServiceDate DateTime
  isActive        Boolean  @default(true)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### **Key Benefits of This Approach:**
1. **Maximize Pipedrive Investment** - Use 80% of features with existing Pipedrive setup
2. **Minimal Additional Costs** - Only add storage/services when needed
3. **Gradual Scaling** - Add complexity as business grows
4. **Data Consistency** - Pipedrive remains source of truth for core business data
5. **Easy Deployment** - Most features work with just Pipedrive API key