// Constants for the EEU Complaint Management System

export const COMPLAINT_CATEGORIES = [
  { value: 'power_outage', label: 'Power Outage', priority: 'critical' },
  { value: 'billing_issue', label: 'Billing Issue', priority: 'medium' },
  { value: 'meter_problem', label: 'Meter Problem', priority: 'high' },
  { value: 'connection_request', label: 'New Connection Request', priority: 'medium' },
  { value: 'voltage_fluctuation', label: 'Voltage Fluctuation', priority: 'high' },
  { value: 'equipment_damage', label: 'Equipment Damage', priority: 'high' },
  { value: 'service_quality', label: 'Service Quality', priority: 'medium' },
  { value: 'safety_concern', label: 'Safety Concern', priority: 'critical' },
  { value: 'other', label: 'Other', priority: 'low' }
];

export const COMPLAINT_TITLES = {
  power_outage: [
    'Complete power failure in area',
    'Partial power outage affecting multiple buildings',
    'Frequent power interruptions',
    'Power outage after storm/weather event',
    'Scheduled maintenance overrun'
  ],
  billing_issue: [
    'Incorrect billing amount',
    'Missing payment not reflected',
    'Duplicate charges on account',
    'Billing cycle discrepancy',
    'Meter reading dispute'
  ],
  meter_problem: [
    'Meter not working/displaying error',
    'Suspected meter tampering',
    'Meter reading inconsistency',
    'Digital meter malfunction',
    'Meter replacement request'
  ],
  connection_request: [
    'New residential connection',
    'Commercial connection request',
    'Temporary connection needed',
    'Connection upgrade request',
    'Reconnection after disconnection'
  ],
  voltage_fluctuation: [
    'High voltage damaging appliances',
    'Low voltage affecting equipment',
    'Voltage spikes during peak hours',
    'Unstable voltage supply',
    'Three-phase voltage imbalance'
  ],
  equipment_damage: [
    'Transformer malfunction',
    'Damaged power lines',
    'Faulty distribution equipment',
    'Street light not working',
    'Electrical pole damage'
  ],
  service_quality: [
    'Poor customer service experience',
    'Delayed response to complaints',
    'Unprofessional staff behavior',
    'Lack of communication',
    'Service accessibility issues'
  ],
  safety_concern: [
    'Exposed electrical wires',
    'Electrical hazard in public area',
    'Unsafe electrical installation',
    'Risk of electrocution',
    'Fire hazard from electrical equipment'
  ],
  other: [
    'General inquiry',
    'Feedback or suggestion',
    'Complaint not listed above',
    'Multiple issues combined',
    'Follow-up on previous complaint'
  ]
};

export const REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'SNNPR',
  'Somali',
  'Tigray'
];

export const SERVICE_CENTERS = [
  'NAAR No.1',
  'NAAR No.2', 
  'SAAR No.1',
  'SAAR No.2',
  'EAAR No.1',
  'EAAR No.2',
  'WAAR No.1',
  'WAAR No.2',
  'Regional Office',
  'Customer Service Center',
  'Field Operations',
  'Technical Support',
  'Billing Department',
  'Emergency Response'
];

export const ETHIOPIAN_REGIONS = REGIONS;

export const COMPLAINT_STATUSES = [
  'open',
  'in_progress', 
  'pending',
  'resolved',
  'closed',
  'cancelled'
];

export const COMPLAINT_PRIORITIES = [
  'low',
  'medium',
  'high', 
  'critical'
];

export const USER_ROLES = [
  'admin',
  'manager',
  'foreman',
  'call-attendant',
  'technician',
  'customer'
];