import { NextRequest, NextResponse } from 'next/server'

// Define the custom fields we need for Taskifye
const DEAL_CUSTOM_FIELDS = [
  {
    name: 'Service Type',
    field_type: 'enum',
    options: [
      'HVAC Repair',
      'HVAC Maintenance',
      'AC Installation',
      'Furnace Repair',
      'Plumbing',
      'Electrical',
      'Emergency Service',
      'Other'
    ]
  },
  {
    name: 'Priority',
    field_type: 'enum',
    options: ['Low', 'Medium', 'High', 'Urgent']
  },
  {
    name: 'Job Type',
    field_type: 'enum',
    options: ['Service Call', 'Maintenance', 'Installation', 'Emergency', 'Quote Only']
  },
  {
    name: 'Service Address',
    field_type: 'address'
  },
  {
    name: 'Scheduled Time',
    field_type: 'time'
  },
  {
    name: 'Technician Notes',
    field_type: 'text'
  },
  {
    name: 'Materials Used',
    field_type: 'text'
  },
  {
    name: 'Time Spent (hours)',
    field_type: 'double'
  },
  {
    name: 'Before Photos URL',
    field_type: 'text'
  },
  {
    name: 'After Photos URL',
    field_type: 'text'
  },
  {
    name: 'Customer Signature URL',
    field_type: 'text'
  },
  {
    name: 'Invoice Number',
    field_type: 'text'
  },
  {
    name: 'Invoice Status',
    field_type: 'enum',
    options: ['Not Created', 'Sent', 'Paid', 'Overdue']
  }
]

const PERSON_CUSTOM_FIELDS = [
  {
    name: 'Customer Type',
    field_type: 'enum',
    options: ['Residential', 'Commercial', 'Industrial']
  },
  {
    name: 'Preferred Contact Method',
    field_type: 'enum',
    options: ['Phone', 'Email', 'SMS']
  },
  {
    name: 'Equipment Details',
    field_type: 'text'
  },
  {
    name: 'Service Agreement',
    field_type: 'enum',
    options: ['None', 'Basic', 'Premium', 'Commercial']
  },
  {
    name: 'Last Service Date',
    field_type: 'date'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    const results: {
      dealFields: Array<{ name: string; key: string; id: number }>;
      personFields: Array<{ name: string; key: string; id: number }>;
      errors: string[];
    } = {
      dealFields: [],
      personFields: [],
      errors: []
    }

    // Create Deal Custom Fields
    for (const field of DEAL_CUSTOM_FIELDS) {
      try {
        const response = await fetch(
          `https://api.pipedrive.com/v1/dealFields?api_token=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(field)
          }
        )

        const data = await response.json()
        
        if (data.success) {
          results.dealFields.push({
            name: field.name,
            key: data.data.key,
            id: data.data.id
          })
        } else {
          // Field might already exist, try to get it
          const getResponse = await fetch(
            `https://api.pipedrive.com/v1/dealFields?api_token=${apiKey}`
          )
          const fields = await getResponse.json()
          
          const existing = fields.data?.find((f: any) => f.name === field.name)
          if (existing) {
            results.dealFields.push({
              name: field.name,
              key: existing.key,
              id: existing.id
            })
          } else {
            results.errors.push(`Failed to create deal field: ${field.name}`)
          }
        }
      } catch (error) {
        results.errors.push(`Error creating deal field ${field.name}: ${error}`)
      }
    }

    // Create Person Custom Fields
    for (const field of PERSON_CUSTOM_FIELDS) {
      try {
        const response = await fetch(
          `https://api.pipedrive.com/v1/personFields?api_token=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(field)
          }
        )

        const data = await response.json()
        
        if (data.success) {
          results.personFields.push({
            name: field.name,
            key: data.data.key,
            id: data.data.id
          })
        } else {
          // Field might already exist, try to get it
          const getResponse = await fetch(
            `https://api.pipedrive.com/v1/personFields?api_token=${apiKey}`
          )
          const fields = await getResponse.json()
          
          const existing = fields.data?.find((f: any) => f.name === field.name)
          if (existing) {
            results.personFields.push({
              name: field.name,
              key: existing.key,
              id: existing.id
            })
          } else {
            results.errors.push(`Failed to create person field: ${field.name}`)
          }
        }
      } catch (error) {
        results.errors.push(`Error creating person field ${field.name}: ${error}`)
      }
    }

    // Save field mappings to local storage or database
    // This is important so the app knows which field IDs to use
    const fieldMappings = {
      dealFields: results.dealFields.reduce((acc, field) => {
        acc[field.name.toLowerCase().replace(/\s+/g, '_')] = field.key
        return acc
      }, {} as Record<string, string>),
      personFields: results.personFields.reduce((acc, field) => {
        acc[field.name.toLowerCase().replace(/\s+/g, '_')] = field.key
        return acc
      }, {} as Record<string, string>)
    }

    return NextResponse.json({
      success: true,
      fieldMappings,
      results,
      message: 'Custom fields created successfully. Save the fieldMappings for use in the application.'
    })

  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to setup custom fields' },
      { status: 500 }
    )
  }
}

// GET endpoint to check existing fields
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get('apiKey')

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 400 }
    )
  }

  try {
    const [dealFieldsRes, personFieldsRes] = await Promise.all([
      fetch(`https://api.pipedrive.com/v1/dealFields?api_token=${apiKey}`),
      fetch(`https://api.pipedrive.com/v1/personFields?api_token=${apiKey}`)
    ])

    const [dealFields, personFields] = await Promise.all([
      dealFieldsRes.json(),
      personFieldsRes.json()
    ])

    // Filter to show only our custom fields
    const ourDealFields = dealFields.data?.filter((f: any) => 
      DEAL_CUSTOM_FIELDS.some(cf => cf.name === f.name)
    )

    const ourPersonFields = personFields.data?.filter((f: any) => 
      PERSON_CUSTOM_FIELDS.some(cf => cf.name === f.name)
    )

    return NextResponse.json({
      dealFields: ourDealFields || [],
      personFields: ourPersonFields || [],
      fieldMappings: {
        dealFields: ourDealFields?.reduce((acc: any, field: any) => {
          acc[field.name.toLowerCase().replace(/\s+/g, '_')] = field.key
          return acc
        }, {}),
        personFields: ourPersonFields?.reduce((acc: any, field: any) => {
          acc[field.name.toLowerCase().replace(/\s+/g, '_')] = field.key
          return acc
        }, {})
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fields' },
      { status: 500 }
    )
  }
}