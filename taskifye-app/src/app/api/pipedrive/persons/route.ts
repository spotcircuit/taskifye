import { NextRequest, NextResponse } from 'next/server'
import { PipedriveService } from '@/lib/integrations/pipedrive'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get API key from storage or headers
    const apiKey = request.headers.get('x-pipedrive-api-key') || 
                  process.env.PIPEDRIVE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Pipedrive API key not configured' },
        { status: 401 }
      )
    }

    const pipedrive = new PipedriveService()

    // Handle bulk upload
    if (body.bulk && Array.isArray(body.persons)) {
      const results = []
      const errors = []

      for (const person of body.persons) {
        try {
          const result = await pipedrive.createPerson({
            name: person.name,
            email: person.email ? [person.email] : [],
            phone: person.phone ? [person.phone] : [],
            add_time: new Date().toISOString(),
            ...person.customFields
          })
          results.push(result)
        } catch (error: any) {
          errors.push({
            person,
            error: error.message
          })
        }
      }

      return NextResponse.json({
        success: true,
        created: results.length,
        failed: errors.length,
        results,
        errors
      })
    }

    // Handle single person creation
    const { name, email, phone, address, company, notes, customFields } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const personData: any = {
      name,
      add_time: new Date().toISOString(),
    }

    if (email) {
      personData.email = [email]
    }

    if (phone) {
      personData.phone = [phone]
    }

    if (company) {
      // First check if company exists, if not create it
      const orgResponse = await fetch(`https://api.pipedrive.com/v1/organizations/search?term=${encodeURIComponent(company)}&api_token=${apiKey}`)
      const orgData = await orgResponse.json()
      
      if (orgData.data?.items?.length > 0) {
        personData.org_id = orgData.data.items[0].item.id
      } else {
        // Create new organization
        const newOrgResponse = await fetch(`https://api.pipedrive.com/v1/organizations?api_token=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: company })
        })
        const newOrg = await newOrgResponse.json()
        if (newOrg.success) {
          personData.org_id = newOrg.data.id
        }
      }
    }

    // Add custom fields if provided
    if (customFields) {
      Object.assign(personData, customFields)
    }

    const result = await pipedrive.createPerson(personData)

    // If notes provided, add them to the person
    if (notes && result.person?.id) {
      await fetch(`https://api.pipedrive.com/v1/notes?api_token=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: notes,
          person_id: result.person.id,
          add_time: new Date().toISOString()
        })
      })
    }

    // If address provided, update the person with address
    if (address && result.person?.id) {
      await fetch(`https://api.pipedrive.com/v1/persons/${result.person.id}?api_token=${apiKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address
        })
      })
    }

    return NextResponse.json({
      success: true,
      person: result.person
    })

  } catch (error: any) {
    console.error('Error creating person in Pipedrive:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create person' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const apiKey = request.headers.get('x-pipedrive-api-key') || 
                  process.env.PIPEDRIVE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Pipedrive API key not configured' },
        { status: 401 }
      )
    }

    const pipedrive = new PipedriveService()

    if (search) {
      // Search for persons
      const results = await pipedrive.searchPersons(search)
      return NextResponse.json(results)
    } else {
      // Get all persons
      const results = await pipedrive.getPersons()
      return NextResponse.json(results)
    }

  } catch (error: any) {
    console.error('Error fetching persons from Pipedrive:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch persons' },
      { status: 500 }
    )
  }
}