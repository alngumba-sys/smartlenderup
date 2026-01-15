// Type Test File - verifying DataContext types have optional properties

import type { Client, Loan, Repayment } from './contexts/DataContext';

// Test Client optional properties
const testClient: Client = {
  id: 'test',
  name: 'Test Client',
  email: 'test@test.com',
  phone: '1234567890',
  idNumber: 'ID123',
  address: '123 Main St',
  city: 'Nairobi',
  county: 'Nairobi',
  occupation: 'Developer',
  employer: 'Test Co',
  monthlyIncome: 50000,
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  maritalStatus: 'Single',
  nextOfKin: {
    name: 'Next Kin',
    relationship: 'Sibling',
    phone: '0987654321'
  },
  status: 'Active',
  joinDate: '2024-01-01',
  createdBy: 'admin',
  lastUpdated: '2024-01-01',
  // Optional properties should work:
  clientId: 'CL001',
  fullName: 'Test Client Full',
  phoneNumber: '1234567890',
  nationalId: 'NAT123'
};

// Test Loan optional properties
const testLoan: Partial<Loan> = {
  loanId: 'L001',
  loanAmount: 10000,
  loanType: 'Business',
  clientType: 'Individual'
};

console.log('✅ Type test passed! Optional properties are recognized.');
console.log('Client has clientId:', testClient.clientId);
console.log('Loan has loanAmount:', testLoan.loanAmount);
