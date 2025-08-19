// Mock data for dashboard components
export const mockDashboardData = {
  stats: {
    totalDrugs: {
      value: 1247,
      change: '+12% from last month'
    },
    todaySales: {
      value: '₵2,450',
      change: '+8% from yesterday'
    },
    activePrescriptions: {
      value: 89,
      change: '+5% from last week'
    },
    registeredUsers: {
      value: 24,
      change: '+2 this month'
    }
  },
  
  alerts: [
    {
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Several medications are running low and need reordering soon.',
      severity: 'warning' as const,
      drugs: [
        { name: 'Paracetamol 500mg', quantity: 15, reorderLevel: 50 },
        { name: 'Amoxicillin 500mg', quantity: 8, reorderLevel: 30 },
        { name: 'Ibuprofen 400mg', quantity: 22, reorderLevel: 40 }
      ]
    },
    {
      type: 'danger',
      title: 'Expiry Warning',
      message: 'Some medications will expire within the next 30 days.',
      severity: 'danger' as const,
      drugs: [
        { name: 'Metronidazole 400mg', quantity: 45, expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
        { name: 'Ciprofloxacin 500mg', quantity: 32, expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) }
      ]
    },
    {
      type: 'info',
      title: 'New Staff Member',
      message: 'Welcome Abena Mensah to the pharmacy team as a new Cashier.',
      severity: 'info' as const
    }
  ],
  
  activities: [
    {
      id: '1',
      action: 'Sale completed',
      item: 'Paracetamol 500mg x 2 packs',
      time: '2 minutes ago',
      type: 'success' as const
    },
    {
      id: '2',
      action: 'Inventory updated',
      item: 'Amoxicillin 500mg stock increased',
      time: '15 minutes ago',
      type: 'info' as const
    },
    {
      id: '3',
      action: 'Prescription filled',
      item: 'For patient Kwame Asante',
      time: '1 hour ago',
      type: 'success' as const
    },
    {
      id: '4',
      action: 'Low stock alert',
      item: 'Ibuprofen 400mg below reorder level',
      time: '2 hours ago',
      type: 'warning' as const
    },
    {
      id: '5',
      action: 'New user registered',
      item: 'Yaw Darko - Store Manager',
      time: '3 hours ago',
      type: 'info' as const
    },
    {
      id: '6',
      action: 'Expiry check completed',
      item: 'Monthly inventory expiry review',
      time: '4 hours ago',
      type: 'info' as const
    }
  ]
};

// Mock user data with Ghanaian names
export const mockUsers = [
  {
    id: '1',
    name: 'Kwame Addo',
    email: 'kwame.addo@jelppharm.com',
    role: 'Administrator',
    phone: '+233 24 123 4567',
    storeName: 'Addo Pharmacy',
    storeAddress: '123 High Street, Accra, Ghana'
  },
  {
    id: '2',
    name: 'Ama Osei',
    email: 'ama.osei@jelppharm.com',
    role: 'Pharmacist',
    phone: '+233 20 987 6543',
    storeName: 'Addo Pharmacy',
    storeAddress: '123 High Street, Accra, Ghana'
  },
  {
    id: '3',
    name: 'Yaw Darko',
    email: 'yaw.darko@jelppharm.com',
    role: 'Store Manager',
    phone: '+233 26 456 7890',
    storeName: 'Addo Pharmacy',
    storeAddress: '123 High Street, Accra, Ghana'
  },
  {
    id: '4',
    name: 'Abena Mensah',
    email: 'abena.mensah@jelppharm.com',
    role: 'Cashier',
    phone: '+233 27 789 0123',
    storeName: 'Addo Pharmacy',
    storeAddress: '123 High Street, Accra, Ghana'
  },
  {
    id: '5',
    name: 'Kofi Asante',
    email: 'kofi.asante@jelppharm.com',
    role: 'Pharmacist',
    phone: '+233 54 321 0987',
    storeName: 'Addo Pharmacy',
    storeAddress: '123 High Street, Accra, Ghana'
  }
];

// Mock pharmacy locations in Ghana
export const mockPharmacyLocations = [
  {
    name: 'Addo Pharmacy - Accra Central',
    address: '123 High Street, Accra, Ghana',
    phone: '+233 24 123 4567',
    manager: 'Kwame Addo'
  },
  {
    name: 'Addo Pharmacy - Kumasi Branch',
    address: '456 Market Road, Kumasi, Ghana',
    phone: '+233 32 456 7890',
    manager: 'Yaw Darko'
  },
  {
    name: 'Addo Pharmacy - Takoradi Branch',
    address: '789 Harbor Drive, Takoradi, Ghana',
    phone: '+233 31 789 0123',
    manager: 'Ama Osei'
  }
];

// Mock Ghanaian cities and regions
export const ghanaianCities = [
  'Accra',
  'Kumasi',
  'Takoradi',
  'Tamale',
  'Tema',
  'Cape Coast',
  'Sekondi',
  'Ho',
  'Koforidua',
  'Sunyani'
];

export const ghanaianRegions = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Northern',
  'Eastern',
  'Central',
  'Volta',
  'Upper East',
  'Upper West',
  'Bono East',
  'Bono',
  'Ahafo',
  'Savannah',
  'North East',
  'Oti',
  'Western North'
];
