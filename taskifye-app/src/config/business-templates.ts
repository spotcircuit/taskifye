// Business Templates for Different Field Service Industries
// This allows customization per business type during deployment

export interface BusinessTemplate {
  id: string
  name: string
  description: string
  serviceTypes: string[]
  jobTypes: string[]
  equipmentTypes?: string[]
  customFields?: Array<{
    name: string
    field_type: string
    options?: string[]
    category: 'deal' | 'person'
  }>
}

export const businessTemplates: Record<string, BusinessTemplate> = {
  hvac: {
    id: 'hvac',
    name: 'HVAC',
    description: 'Heating, Ventilation, and Air Conditioning',
    serviceTypes: [
      'AC Repair',
      'AC Installation',
      'AC Maintenance',
      'Furnace Repair',
      'Furnace Installation',
      'Furnace Maintenance',
      'Heat Pump Service',
      'Duct Cleaning',
      'Thermostat Installation',
      'Emergency Service',
      'System Inspection',
      'Other'
    ],
    jobTypes: [
      'Service Call',
      'Maintenance',
      'Installation',
      'Emergency',
      'Inspection',
      'Quote Only'
    ],
    equipmentTypes: [
      'Central AC',
      'Split System',
      'Furnace',
      'Heat Pump',
      'Boiler',
      'Thermostat',
      'Air Handler'
    ]
  },

  plumbing: {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Plumbing services and repairs',
    serviceTypes: [
      'Leak Repair',
      'Drain Cleaning',
      'Water Heater Repair',
      'Water Heater Installation',
      'Toilet Repair',
      'Faucet Installation',
      'Pipe Replacement',
      'Sewer Line Service',
      'Emergency Service',
      'Inspection',
      'Fixture Installation',
      'Other'
    ],
    jobTypes: [
      'Service Call',
      'Installation',
      'Emergency',
      'Inspection',
      'Maintenance',
      'Quote Only'
    ],
    equipmentTypes: [
      'Water Heater',
      'Toilet',
      'Faucet',
      'Garbage Disposal',
      'Sump Pump',
      'Water Softener'
    ]
  },

  electrical: {
    id: 'electrical',
    name: 'Electrical',
    description: 'Electrical services and installations',
    serviceTypes: [
      'Outlet Installation',
      'Switch Replacement',
      'Circuit Breaker Service',
      'Panel Upgrade',
      'Wiring Repair',
      'Lighting Installation',
      'Ceiling Fan Installation',
      'Generator Installation',
      'EV Charger Installation',
      'Emergency Service',
      'Inspection',
      'Other'
    ],
    jobTypes: [
      'Service Call',
      'Installation',
      'Emergency',
      'Inspection',
      'Upgrade',
      'Quote Only'
    ],
    equipmentTypes: [
      'Circuit Panel',
      'Generator',
      'EV Charger',
      'Smart Home Device'
    ]
  },

  roofing: {
    id: 'roofing',
    name: 'Roofing',
    description: 'Roofing repair and replacement',
    serviceTypes: [
      'Leak Repair',
      'Shingle Replacement',
      'Full Roof Replacement',
      'Gutter Cleaning',
      'Gutter Installation',
      'Roof Inspection',
      'Storm Damage Repair',
      'Skylight Installation',
      'Ventilation Service',
      'Emergency Tarping',
      'Other'
    ],
    jobTypes: [
      'Repair',
      'Replacement',
      'Installation',
      'Emergency',
      'Inspection',
      'Quote Only'
    ]
  },

  locksmith: {
    id: 'locksmith',
    name: 'Locksmith',
    description: 'Lock and security services',
    serviceTypes: [
      'Lockout Service',
      'Lock Rekey',
      'Lock Installation',
      'Key Duplication',
      'Safe Opening',
      'Access Control Installation',
      'Car Key Programming',
      'Emergency Service',
      'Security Consultation',
      'Other'
    ],
    jobTypes: [
      'Emergency',
      'Service Call',
      'Installation',
      'Consultation',
      'Quote Only'
    ]
  },

  garage_door: {
    id: 'garage_door',
    name: 'Garage Door',
    description: 'Garage door repair and installation',
    serviceTypes: [
      'Spring Repair',
      'Opener Repair',
      'Door Installation',
      'Opener Installation',
      'Cable Repair',
      'Track Alignment',
      'Remote Programming',
      'Safety Inspection',
      'Emergency Service',
      'Other'
    ],
    jobTypes: [
      'Repair',
      'Installation',
      'Emergency',
      'Maintenance',
      'Inspection',
      'Quote Only'
    ]
  },

  appliance_repair: {
    id: 'appliance_repair',
    name: 'Appliance Repair',
    description: 'Home appliance repair services',
    serviceTypes: [
      'Refrigerator Repair',
      'Washer Repair',
      'Dryer Repair',
      'Dishwasher Repair',
      'Oven/Range Repair',
      'Microwave Repair',
      'Garbage Disposal Repair',
      'Ice Maker Repair',
      'Diagnostic Service',
      'Other'
    ],
    jobTypes: [
      'Repair',
      'Diagnostic',
      'Installation',
      'Maintenance',
      'Quote Only'
    ],
    equipmentTypes: [
      'Refrigerator',
      'Washer',
      'Dryer',
      'Dishwasher',
      'Oven/Range',
      'Microwave'
    ]
  },

  pest_control: {
    id: 'pest_control',
    name: 'Pest Control',
    description: 'Pest control and extermination',
    serviceTypes: [
      'General Pest Treatment',
      'Termite Treatment',
      'Bed Bug Treatment',
      'Rodent Control',
      'Ant Treatment',
      'Cockroach Treatment',
      'Mosquito Control',
      'Wildlife Removal',
      'Inspection',
      'Preventive Treatment',
      'Other'
    ],
    jobTypes: [
      'Treatment',
      'Inspection',
      'Emergency',
      'Preventive Service',
      'Quote Only'
    ]
  },

  landscaping: {
    id: 'landscaping',
    name: 'Landscaping',
    description: 'Lawn care and landscaping services',
    serviceTypes: [
      'Lawn Mowing',
      'Fertilization',
      'Weed Control',
      'Tree Trimming',
      'Mulching',
      'Leaf Removal',
      'Irrigation Repair',
      'Landscape Design',
      'Sod Installation',
      'Seasonal Cleanup',
      'Other'
    ],
    jobTypes: [
      'Maintenance',
      'Installation',
      'Design',
      'Seasonal Service',
      'Quote Only'
    ]
  },

  pool_service: {
    id: 'pool_service',
    name: 'Pool Service',
    description: 'Pool maintenance and repair',
    serviceTypes: [
      'Weekly Cleaning',
      'Chemical Balance',
      'Filter Cleaning',
      'Pump Repair',
      'Heater Repair',
      'Leak Detection',
      'Equipment Installation',
      'Pool Opening',
      'Pool Closing',
      'Emergency Service',
      'Other'
    ],
    jobTypes: [
      'Maintenance',
      'Repair',
      'Installation',
      'Seasonal Service',
      'Emergency',
      'Quote Only'
    ]
  },

  cleaning: {
    id: 'cleaning',
    name: 'Cleaning Service',
    description: 'Residential and commercial cleaning',
    serviceTypes: [
      'Regular Cleaning',
      'Deep Cleaning',
      'Move-in/Move-out Cleaning',
      'Post-Construction Cleaning',
      'Office Cleaning',
      'Window Cleaning',
      'Carpet Cleaning',
      'Pressure Washing',
      'Disinfection Service',
      'Other'
    ],
    jobTypes: [
      'One-time Service',
      'Recurring Service',
      'Deep Clean',
      'Commercial',
      'Quote Only'
    ]
  }
}

// Generic custom fields that apply to all businesses
export const genericCustomFields = {
  deal: [
    {
      name: 'Priority',
      field_type: 'enum',
      options: ['Low', 'Medium', 'High', 'Urgent']
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
    },
    {
      name: 'Payment Method',
      field_type: 'enum',
      options: ['Cash', 'Check', 'Credit Card', 'ACH', 'Other']
    },
    {
      name: 'Warranty Status',
      field_type: 'enum',
      options: ['None', 'Under Warranty', 'Extended Warranty', 'Expired']
    }
  ],
  person: [
    {
      name: 'Customer Type',
      field_type: 'enum',
      options: ['Residential', 'Commercial', 'Industrial', 'Government']
    },
    {
      name: 'Preferred Contact Method',
      field_type: 'enum',
      options: ['Phone', 'Email', 'SMS', 'No Preference']
    },
    {
      name: 'Service Agreement',
      field_type: 'enum',
      options: ['None', 'Basic', 'Premium', 'Commercial']
    },
    {
      name: 'Last Service Date',
      field_type: 'date'
    },
    {
      name: 'Customer Since',
      field_type: 'date'
    },
    {
      name: 'Special Instructions',
      field_type: 'text'
    },
    {
      name: 'Gate Code',
      field_type: 'text'
    },
    {
      name: 'Billing Address',
      field_type: 'address'
    }
  ]
}

// Function to get custom fields for a specific business type
export function getCustomFieldsForBusiness(businessType: string) {
  const template = businessTemplates[businessType] || businessTemplates.hvac
  
  const dealFields = [
    ...genericCustomFields.deal,
    {
      name: 'Service Type',
      field_type: 'enum',
      options: template.serviceTypes
    },
    {
      name: 'Job Type',
      field_type: 'enum',
      options: template.jobTypes
    }
  ]

  const personFields = [
    ...genericCustomFields.person
  ]

  // Add equipment details field if the business type uses equipment
  if (template.equipmentTypes) {
    personFields.push({
      name: 'Equipment Details',
      field_type: 'text'
    })
  }

  // Add any template-specific custom fields
  if (template.customFields) {
    template.customFields.forEach(field => {
      if (field.category === 'deal') {
        dealFields.push(field)
      } else {
        personFields.push(field)
      }
    })
  }

  return {
    dealFields,
    personFields,
    template
  }
}