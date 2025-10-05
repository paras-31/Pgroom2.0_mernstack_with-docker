// filepath: /src/types/admin.ts

export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  address: string;
  stateId: number;
  cityId: number;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  verified: boolean;
  rating: number;
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  monthlyRevenue: number;
  properties: Property[];
  recentActivity: string;
  documents: {
    aadhar: boolean;
    pan: boolean;
    agreement: boolean;
  };
}

export interface Property {
  id: number;
  propertyName: string;
  propertyAddress: string;
  totalRooms: number;
  occupiedRooms: number;
}

export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  age: number;
  occupation: string;
  company: string;
  joinDate: string;
  status: 'active' | 'suspended';
  property: string;
  propertyLocation: string;
  roomNumber: string;
  rentAmount: number;
  depositAmount: number;
  dueDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  documents: {
    aadhar: boolean;
    pan: boolean;
    agreement: boolean;
  };
  rating: number;
  issuesReported: number;
  lastPayment: string;
}

export interface AdminStats {
  totalOwners: number;
  activeOwners: number;
  totalProperties: number;
  totalRevenue: number;
  averageOccupancy: number;
}

export interface FilterOptions {
  searchTerm: string;
  statusFilter: string;
  locationFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
