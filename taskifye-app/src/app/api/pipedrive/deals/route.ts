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

    const pipedrive = new PipedriveService(apiKey)

    // Extract deal data
    const { 
      title, 
      value, 
      currency = 'USD',
      personId, 
      orgId,
      stage_id,
      status = 'open',
      expected_close_date,
      customFields,
      // Job-specific fields
      jobType,
      serviceType,
      priority,
      address,
      description,
      scheduledDate
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      )
    }

    // Build deal data
    const dealData: any = {
      title,
      value: value || 0,
      currency,
      status,
      add_time: new Date().toISOString(),
    }

    if (personId) dealData.person_id = personId
    if (orgId) dealData.org_id = orgId
    if (stage_id) dealData.stage_id = stage_id
    if (expected_close_date) dealData.expected_close_date = expected_close_date

    // Add custom fields if provided
    if (customFields) {
      Object.assign(dealData, customFields)
    }

    // Create the deal
    const result = await pipedrive.createDeal(dealData)

    if (!result.success) {
      throw new Error(result.error || 'Failed to create deal')
    }

    // Add notes with job details if provided
    if (result.deal?.id && (description || address || jobType || serviceType || scheduledDate)) {
      const noteContent = `
Job Details:
${jobType ? `Type: ${jobType}` : ''}
${serviceType ? `Service: ${serviceType}` : ''}
${priority ? `Priority: ${priority}` : ''}
${address ? `Location: ${address}` : ''}
${scheduledDate ? `Scheduled: ${scheduledDate}` : ''}
${description ? `\nDescription:\n${description}` : ''}
      `.trim()

      await pipedrive.addNote('deal', result.deal.id, noteContent)
    }

    // Create an activity if scheduled date is provided
    if (result.deal?.id && scheduledDate) {
      await fetch(`https://api.pipedrive.com/v1/activities?api_token=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `Service: ${title}`,
          type: 'task',
          deal_id: result.deal.id,
          person_id: personId,
          due_date: scheduledDate.split('T')[0],
          due_time: scheduledDate.split('T')[1]?.split(':').slice(0, 2).join(':') || '09:00',
          note: `Service appointment for ${serviceType || 'general service'}`
        })
      })
    }

    return NextResponse.json({
      success: true,
      job: result.deal
    })

  } catch (error: any) {
    console.error('Error creating job in Pipedrive:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'open'
    
    const apiKey = request.headers.get('x-pipedrive-api-key') || 
                  process.env.PIPEDRIVE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Pipedrive API key not configured' },
        { status: 401 }
      )
    }

    const pipedrive = new PipedriveService(apiKey)
    const results = await pipedrive.getDeals({ status })
    
    return NextResponse.json(results)

  } catch (error: any) {
    console.error('Error fetching jobs from Pipedrive:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}