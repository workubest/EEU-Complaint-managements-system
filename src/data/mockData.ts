// Demo data for testing when backend is unavailable
import { Complaint, Customer } from '../types/complaint';
import { User } from '../types/user';

// Demo users for testing
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@eeu.gov.et',
    name: 'System Administrator',
    role: 'admin',
    department: 'IT',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    email: 'manager@eeu.gov.et',
    name: 'Operations Manager',
    role: 'manager',
    department: 'Operations',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '3',
    email: 'staff@eeu.gov.et',
    name: 'Support Staff',
    role: 'staff',
    department: 'Customer Service',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
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

// Demo complaints
export const mockComplaints: Complaint[] = [
  {
    id: '1',
    title: 'Power Outage in Bole Area',
    description: 'Frequent power outages affecting our business operations',
    category: 'power_outage',
    priority: 'high',
    status: 'in_progress',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+251911234567',
    location: 'Bole, Addis Ababa',
    assignedTo: 'staff@eeu.gov.et',
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-12'),
    expectedResolution: new Date('2024-08-15'),
    attachments: []
  },
  {
    id: '2',
    title: 'Billing Discrepancy',
    description: 'Incorrect billing amount for last month',
    category: 'billing',
    priority: 'medium',
    status: 'pending',
    customerId: '2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+251922345678',
    location: 'Bahir Dar',
    createdAt: new Date('2024-08-11'),
    updatedAt: new Date('2024-08-11'),
    attachments: []
  }
];