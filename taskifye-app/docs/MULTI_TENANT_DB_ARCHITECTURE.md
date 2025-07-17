# Multi-Tenant Database Architecture

## Overview
The Taskifye platform now supports a full multi-tenant architecture with agency/client separation.

## Database Structure

### 1. Agency Model
- Top-level account that owns multiple clients
- Agency users can access all clients under the agency
- Fields: name, slug, email, phone, isActive

### 2. Client Model (formerly Tenant)
- Individual businesses under an agency
- Each client has their own:
  - Branding settings
  - API credentials
  - Jobs, payments, and other data
- Fields: name, slug, businessType, contact info

### 3. Branding Model
- Per-client customization
- Custom colors, logos, taglines
- Support contact information
- Optional custom CSS

### 4. ApiSettings Model
- Encrypted storage for all integration credentials
- Per-client API keys for:
  - Pipedrive CRM
  - Twilio SMS
  - ReachInbox Email
  - QuickBooks
  - Google Maps
  - OpenAI

### 5. User & ClientUser Models
- Users can belong to an agency (agency-level access)
- ClientUser junction table for client-specific access
- Role-based permissions:
  - super_admin: Platform admin
  - agency_admin: Full agency access
  - client_admin: Single client admin
  - user: Regular user

## Key Features

1. **Data Isolation**: Each client's data is completely separated
2. **Flexible Access**: Users can access multiple clients
3. **Encrypted Credentials**: All API keys are encrypted in the database
4. **Custom Branding**: Each client can have unique branding
5. **Scalable**: Supports unlimited agencies and clients

## Migration Steps

To migrate to the new structure:

1. Generate migration:
   ```bash
   npx prisma migrate dev --name add_multi_tenancy
   ```

2. Update all references from `tenantId` to `clientId` in the codebase

3. Create seed data for testing:
   - Default agency
   - Sample clients
   - Test users with different access levels

## API Endpoints Needed

1. **Agency Management**
   - GET /api/agencies
   - POST /api/agencies
   - PUT /api/agencies/:id

2. **Client Management**
   - GET /api/clients (filtered by agency)
   - POST /api/clients
   - PUT /api/clients/:id

3. **Branding**
   - GET /api/clients/:id/branding
   - PUT /api/clients/:id/branding

4. **API Settings**
   - GET /api/clients/:id/settings
   - PUT /api/clients/:id/settings (encrypted)

5. **User Access**
   - POST /api/users/:id/grant-access
   - DELETE /api/users/:id/revoke-access

## Security Considerations

1. **Encryption**: All API keys must be encrypted before storage
2. **Access Control**: Strict validation of user permissions
3. **Audit Logging**: Track all changes to sensitive data
4. **Session Management**: Handle multi-client sessions properly

## Environment Variables

For encryption, add:
```env
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Next Steps

1. Implement encryption utilities
2. Create API endpoints for management
3. Update authentication to handle multi-tenancy
4. Build UI for agency/client management
5. Migrate existing data to new structure