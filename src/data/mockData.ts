// Demo data for testing when backend is unavailable
import { Complaint, Customer } from '../types/complaint';
import { User } from '../types/user';

// Demo users for testing all roles
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@eeu.gov.et',
    name: 'System Administrator',
    role: 'admin',
    region: 'North Addis Ababa',
    serviceCenter: 'NAAR No.1',
    phone: '+251-91-167-6346',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    email: 'manager@eeu.gov.et',
    name: 'Operations Manager',
    role: 'manager',
    region: 'Oromia',
    serviceCenter: 'Regional Office',
    phone: '+251-91-234-5678',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    email: 'foreman@eeu.gov.et',
    name: 'Field Foreman',
    role: 'foreman',
    region: 'Amhara',
    serviceCenter: 'Field Operations',
    phone: '+251-91-345-6789',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    email: 'attendant@eeu.gov.et',
    name: 'Call Attendant',
    role: 'call-attendant',
    region: 'North Addis Ababa',
    serviceCenter: 'Customer Service',
    phone: '+251-91-456-7890',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    email: 'technician@eeu.gov.et',
    name: 'Field Technician',
    role: 'technician',
    region: 'Addis Ababa',
    serviceCenter: 'Field Service',
    phone: '+251-91-567-8901',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

// Demo customers
export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+251911234567',
    address: 'Addis Ababa, Ethiopia',
    accountNumber: 'EEU001234',
    customerType: 'residential',
    registrationDate: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+251922345678',
    address: 'Bahir Dar, Ethiopia',
    accountNumber: 'EEU002345',
    customerType: 'commercial',
    registrationDate: new Date('2024-02-01')
  }
];

// Demo complaints with diverse statuses and recent dates for realistic testing
export const mockComplaints: Complaint[] = [
  // Today's complaints
  {
    id: '1',
    title: 'Critical Power Outage in Bole Area',
    description: 'Complete power failure affecting entire commercial district',
    category: 'power_outage',
    priority: 'critical',
    status: 'open',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+251911234567',
    location: 'Bole, Addis Ababa',
    assignedTo: 'staff@eeu.gov.et',
    createdAt: new Date(),
    updatedAt: new Date(),
    expectedResolution: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    attachments: []
  },
  {
    id: '2',
    title: 'Meter Reading Issue',
    description: 'Smart meter not recording consumption properly',
    category: 'meter_reading',
    priority: 'high',
    status: 'in_progress',
    customerId: '2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+251922345678',
    location: 'Bahir Dar',
    assignedTo: 'technician@eeu.gov.et',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    expectedResolution: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    attachments: []
  },
  {
    id: '3',
    title: 'Voltage Fluctuation',
    description: 'Unstable voltage causing equipment damage',
    category: 'technical_issue',
    priority: 'high',
    status: 'escalated',
    customerId: '1',
    customerName: 'Ahmed Hassan',
    customerEmail: 'ahmed@example.com',
    customerPhone: '+251933456789',
    location: 'Kirkos, Addis Ababa',
    assignedTo: 'foreman@eeu.gov.et',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    expectedResolution: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    attachments: []
  },

  // Yesterday's complaints
  {
    id: '4',
    title: 'Billing Discrepancy',
    description: 'Incorrect billing amount for last month',
    category: 'billing',
    priority: 'medium',
    status: 'resolved',
    customerId: '2',
    customerName: 'Meron Tadesse',
    customerEmail: 'meron@example.com',
    customerPhone: '+251944567890',
    location: 'Yeka, Addis Ababa',
    assignedTo: 'attendant@eeu.gov.et',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    expectedResolution: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    attachments: []
  },
  {
    id: '5',
    title: 'New Connection Request',
    description: 'Request for new electrical connection for residential building',
    category: 'new_connection',
    priority: 'low',
    status: 'pending',
    customerId: '1',
    customerName: 'Dawit Bekele',
    customerEmail: 'dawit@example.com',
    customerPhone: '+251955678901',
    location: 'Nifas Silk, Addis Ababa',
    assignedTo: 'manager@eeu.gov.et',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // Yesterday
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // Yesterday
    expectedResolution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    attachments: []
  },

  // This week's complaints
  {
    id: '6',
    title: 'Street Light Malfunction',
    description: 'Multiple street lights not working in residential area',
    category: 'street_lighting',
    priority: 'medium',
    status: 'closed',
    customerId: '2',
    customerName: 'Sara Mohammed',
    customerEmail: 'sara@example.com',
    customerPhone: '+251966789012',
    location: 'Gulele, Addis Ababa',
    assignedTo: 'technician@eeu.gov.et',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expectedResolution: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    attachments: []
  },
  {
    id: '7',
    title: 'Transformer Noise Issue',
    description: 'Loud humming noise from neighborhood transformer',
    category: 'technical_issue',
    priority: 'low',
    status: 'in_progress',
    customerId: '1',
    customerName: 'Hanan Ali',
    customerEmail: 'hanan@example.com',
    customerPhone: '+251977890123',
    location: 'Arada, Addis Ababa',
    assignedTo: 'foreman@eeu.gov.et',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expectedResolution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    attachments: []
  },

  // This month's complaints
  {
    id: '8',
    title: 'Power Quality Issues',
    description: 'Frequent voltage spikes damaging electronic equipment',
    category: 'power_quality',
    priority: 'critical',
    status: 'resolved',
    customerId: '2',
    customerName: 'Yonas Girma',
    customerEmail: 'yonas@example.com',
    customerPhone: '+251988901234',
    location: 'Lideta, Addis Ababa',
    assignedTo: 'manager@eeu.gov.et',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    expectedResolution: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    attachments: []
  },
  {
    id: '9',
    title: 'Meter Tampering Report',
    description: 'Suspected unauthorized modification of electricity meter',
    category: 'meter_tampering',
    priority: 'high',
    status: 'escalated',
    customerId: '1',
    customerName: 'Tigist Haile',
    customerEmail: 'tigist@example.com',
    customerPhone: '+251999012345',
    location: 'Akaki Kality, Addis Ababa',
    assignedTo: 'admin@eeu.gov.et',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    expectedResolution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    attachments: []
  },
  {
    id: '10',
    title: 'Service Disconnection Request',
    description: 'Request to disconnect service due to relocation',
    category: 'service_request',
    priority: 'low',
    status: 'cancelled',
    customerId: '2',
    customerName: 'Bereket Teshome',
    customerEmail: 'bereket@example.com',
    customerPhone: '+251900123456',
    location: 'Kolfe Keranio, Addis Ababa',
    assignedTo: 'attendant@eeu.gov.et',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    expectedResolution: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    attachments: []
  }
];