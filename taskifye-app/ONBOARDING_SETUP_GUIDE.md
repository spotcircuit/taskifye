# Taskifye - Onboarding & Setup Guide

## 🚀 Quick Setup (Development)

### 1. Environment Setup
```bash
# Clone and install
git clone <repo>
cd taskifye-app
npm install

# Environment variables
cp .env.example .env.local
```

### 2. Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskifye"

# Pipedrive Integration
PIPEDRIVE_API_KEY="your-pipedrive-api-key"

# Communications
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# AI Features
OPENAI_API_KEY="your-openai-key"
BLAND_AI_API_KEY="your-bland-ai-key"

# Email
SENDGRID_API_KEY="your-sendgrid-key"
RESEND_API_KEY="your-resend-key"

# Other Integrations
REACHINBOX_API_KEY="your-reachinbox-key"
CALENDLY_API_KEY="your-calendly-key"
WHEN_I_WORK_API_KEY="your-wheniwork-key"

# n8n Automation
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"
N8N_API_KEY="your-n8n-api-key"
```

### 3. Database Setup
```bash
# Initialize Prisma
npx prisma generate
npx prisma db push

# Seed with demo data (optional)
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🎨 Branding Customization

### White-Label Setup
1. **Navigate to Settings** → **Branding**
2. **Configure Company Identity**:
   - Company Name
   - Slogan/Tagline
   - Business Type (HVAC, Plumbing, Electrical, etc.)
3. **Upload Logo**: Drag-drop or click to upload
4. **Set Brand Colors**:
   - Primary color (main brand color)
   - Secondary color (accent color)
5. **Contact Information**:
   - Support email
   - Phone number
   - Website URL
   - Email signature template

### Business Templates
Choose from pre-configured templates:
- **HVAC Services**: Heating, cooling, ventilation
- **Plumbing Services**: Repairs, installations, maintenance
- **Electrical Services**: Wiring, panels, troubleshooting
- **Roofing Services**: Repairs, installations, inspections
- **Landscaping**: Design, maintenance, installation
- **Cleaning Services**: Residential, commercial
- **Pest Control**: Inspection, treatment, prevention
- **Appliance Repair**: Diagnostics, parts, service

---

## 🔌 Integration Setup

### Pipedrive CRM
1. **Get API Key**: Pipedrive Settings → Personal → API
2. **Connect**: Dashboard → Integrations → Pipedrive
3. **Auto-Setup Fields**: Custom fields will be created automatically
4. **Test Connection**: Verify with test deal creation

### Communication Tools

#### Twilio (SMS)
1. **Create Account**: [twilio.com](https://twilio.com)
2. **Get Credentials**: Account SID, Auth Token, Phone Number
3. **Configure Webhooks**: Point to `/api/webhooks/twilio`

#### Email (SendGrid/Resend)
1. **Choose Provider**: SendGrid for volume, Resend for simplicity
2. **Get API Key**: From provider dashboard
3. **Configure Templates**: Default templates provided

### AI Features

#### Voice AI Receptionist
1. **Choose Provider**:
   - **Bland.ai**: Easy setup, good for small businesses
   - **Vapi**: Advanced features, custom voices
   - **Custom**: Build your own with OpenAI
2. **Configure Business Context**:
   - Business name and services
   - Operating hours
   - Common questions and responses
3. **Test Integration**: Use demo page to verify

#### Chatbot
1. **OpenAI Setup**: Get API key from OpenAI
2. **Configure Context**: Business-specific responses
3. **Lead Qualification**: Set up qualification questions

### Scheduling

#### Calendly
1. **Create Account**: [calendly.com](https://calendly.com)
2. **Generate API Key**: Developer settings
3. **Configure Webhooks**: Point to `/api/webhooks/calendly`
4. **Map Services**: Link Calendly events to job types

#### When I Work (Employee Scheduling)
1. **Business Account**: Set up team scheduling
2. **API Access**: Get API key from settings
3. **Sync Schedule**: Technician availability integration

---

## 🏢 Agency/Multi-Tenant Setup

### Agency Registration
1. **Agency Account**: Create master agency account
2. **Configure Billing**: Set up agency billing and plans
3. **Branding Templates**: Create default templates for clients

### Client Onboarding Flow
1. **Create Client**: Add new client to agency portal
2. **Choose Template**: Select business type template
3. **Configure Branding**: Client-specific customization
4. **Setup Integrations**: Connect client's tools
5. **Deploy Instance**: Provision client environment

### Client Management
- **Dashboard Overview**: All clients at a glance
- **Revenue Tracking**: Per-client billing and metrics
- **Support Management**: Client support tickets
- **Template Updates**: Push updates to all clients

---

## 🛠️ Advanced Configuration

### Custom Fields Setup
```javascript
// Business-specific custom fields
const hvacFields = {
  systemType: 'Heat Pump|Furnace|AC Unit|Boiler',
  systemAge: 'number',
  maintenanceContract: 'boolean',
  emergencyService: 'boolean'
}
```

### Workflow Automation (n8n)
1. **Install n8n**: Self-hosted or cloud
2. **Import Templates**: Pre-built service business workflows
3. **Configure Webhooks**: Connect to Taskifye
4. **Test Workflows**: Verify automation triggers

### Custom Business Rules
```javascript
// Example: Auto-assign urgent jobs
const urgentJobRule = {
  trigger: 'job.priority === "urgent"',
  action: 'assignToNextAvailableTechnician()',
  notification: 'sendSMSToTechnician()'
}
```

---

## 📱 Mobile Optimization

### Technician App Setup
1. **Responsive Design**: Works on all devices
2. **Offline Capability**: Basic job info cached
3. **GPS Integration**: Location tracking for jobs
4. **Photo Upload**: Job completion documentation

### Customer Portal
1. **Service Requests**: Online booking
2. **Job Status**: Real-time updates
3. **Payment**: Secure payment processing
4. **Communication**: Direct messaging with technicians

---

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: All API keys encrypted at rest
- **Multi-tenant Isolation**: Strict data separation
- **Audit Logging**: All changes tracked
- **Backup Strategy**: Automated daily backups

### Access Controls
- **Role-based Permissions**: Granular access control
- **Two-factor Authentication**: Optional 2FA setup
- **API Rate Limiting**: Prevent abuse
- **IP Whitelisting**: Restrict access by location

---

## 📞 Support & Training

### Getting Help
- **Documentation**: Comprehensive guides and APIs
- **Video Tutorials**: Step-by-step setup guides
- **Support Chat**: In-app support widget
- **Community Forum**: User community and best practices

### Training Resources
- **Admin Training**: 2-hour onboarding session
- **User Training**: Role-specific training modules
- **Best Practices**: Industry-specific workflows
- **Advanced Features**: Power user capabilities

---

## 🔄 Maintenance & Updates

### Regular Updates
- **Feature Updates**: Monthly feature releases
- **Security Patches**: Immediate security updates
- **Integration Updates**: API version compatibility
- **Performance Monitoring**: Continuous optimization

### Backup & Recovery
- **Automated Backups**: Daily incremental backups
- **Point-in-time Recovery**: Restore to any point
- **Disaster Recovery**: Multi-region failover
- **Data Export**: Full data export capabilities

This guide provides comprehensive setup instructions for all aspects of Taskifye, from basic installation to advanced multi-tenant agency configurations.