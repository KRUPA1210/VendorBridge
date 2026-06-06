// Centralized mock data storage for VendorBridge ERP

export interface ChartDataPoint {
  month: string;
  spend: number;      // Total Procurement Spend (Area Chart)
  officeSupplies: number;
  itHardware: number;
  consulting: number;
  logistics: number;
}

export interface PurchaseOrder {
  id: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Draft' | 'Pending' | 'Pending Approval' | 'Accepted' | 'Cancelled' | 'Closed' | 'Sent' | 'Active' | 'Rejected';
  total: string;
  vendorName?: string;
  department?: string;
  paymentTerms?: string;
}

export interface Vendor {
  id: string;
  name: string;
  gstNo: string;
  category: 'IT Hardware' | 'Office Supplies' | 'Professional Services' | 'Logistics' | 'Furniture' | 'Stationery';
  contactPhone: string;
  contactEmail: string;
  status: 'Active' | 'Pending' | 'Blocked';
  rating: number;
  initials: string;
}

export interface RFQItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  estPrice: number;
}

export interface RFQ {
  id: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Draft' | 'Pending' | 'Active' | 'Closed';
  closeDate: string;
  deadline: string;
  expectedDelivery: string;
  description: string;
  items: RFQItem[];
  assignedVendorsCount: number;
}

export interface QuotationLineItem {
  description: string;
  unitPrice: number;
  qty: number;
  total: number;
  notes?: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  total: number;
  deliveryTime: number; // in days
  paymentTerms: string;
  validity: number; // in days
  gstPercent: number;
  notes: string;
  isLowestPrice?: boolean;
  isFastest?: boolean;
  items: QuotationLineItem[];
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Invoice {
  id: string;
  poId: string;
  vendor: string;
  amount: string;
  status: 'Pending' | 'Paid';
  issueDate: string;
  dueDate: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  type: 'rfq' | 'quotation' | 'approval' | 'po' | 'invoice' | 'vendor' | 'system';
  color: 'blue' | 'purple' | 'green' | 'red' | 'indigo' | 'amber';
  icon: string;
}

// 12-month array with realistic procurement values
// Spending peaks in Q1 (Jan-Mar) and Q3 (Jul-Sep), dips in Q2 (Apr-Jun)
export const yearlySpendData: ChartDataPoint[] = [
  { month: 'Jan', spend: 48000, officeSupplies: 12000, itHardware: 22000, consulting: 8000, logistics: 6000 },
  { month: 'Feb', spend: 52000, officeSupplies: 10000, itHardware: 24000, consulting: 12000, logistics: 6000 },
  { month: 'Mar', spend: 65000, officeSupplies: 15000, itHardware: 30000, consulting: 14000, logistics: 6000 }, // Peak Q1
  { month: 'Apr', spend: 32000, officeSupplies: 8000, itHardware: 12000, consulting: 7000, logistics: 5000 },   // Dip Q2
  { month: 'May', spend: 28000, officeSupplies: 6000, itHardware: 10000, consulting: 8000, logistics: 4000 },
  { month: 'Jun', spend: 31000, officeSupplies: 8000, itHardware: 12000, consulting: 6000, logistics: 5000 },
  { month: 'Jul', spend: 59000, officeSupplies: 12000, itHardware: 28000, consulting: 11000, logistics: 8000 }, // Peak Q3
  { month: 'Aug', spend: 61000, officeSupplies: 14000, itHardware: 26000, consulting: 13000, logistics: 8000 },
  { month: 'Sep', spend: 63000, officeSupplies: 13000, itHardware: 29000, consulting: 12000, logistics: 9000 },
  { month: 'Oct', spend: 42000, officeSupplies: 9000, itHardware: 18000, consulting: 9000, logistics: 6000 },
  { month: 'Nov', spend: 36000, officeSupplies: 8000, itHardware: 15000, consulting: 8000, logistics: 5000 },
  { month: 'Dec', spend: 32735, officeSupplies: 7000, itHardware: 14000, consulting: 7000, logistics: 4735 },
];

export const initialVendors: Vendor[] = [
  {
    id: 'VEN-001',
    name: 'Global Tech Solutions',
    gstNo: '27AAAAA1111A1Z1',
    category: 'IT Hardware',
    contactPhone: '+91 98765 43210',
    contactEmail: 'procure@globaltech.in',
    status: 'Active',
    rating: 4.8,
    initials: 'GT',
  },
  {
    id: 'VEN-002',
    name: 'Apex Logistics Corp',
    gstNo: '27BBBBB2222B2Z2',
    category: 'Logistics',
    contactPhone: '+91 98765 11223',
    contactEmail: 'info@apexlogistics.com',
    status: 'Active',
    rating: 4.5,
    initials: 'AL',
  },
  {
    id: 'VEN-003',
    name: 'Prism Office Supplies Ltd',
    gstNo: '27CCCCC3333C3Z3',
    category: 'Office Supplies',
    contactPhone: '+91 98765 55667',
    contactEmail: 'orders@prism.co.in',
    status: 'Pending',
    rating: 4.2,
    initials: 'PO',
  },
  {
    id: 'VEN-004',
    name: 'Zenith Business Advisory',
    gstNo: '27DDDDD4444D4Z4',
    category: 'Professional Services',
    contactPhone: '+91 98765 99887',
    contactEmail: 'advisory@zenith.com',
    status: 'Active',
    rating: 4.9,
    initials: 'ZB',
  },
  {
    id: 'VEN-005',
    name: 'Infra Supplies Ltd',
    gstNo: '27EEEEE5555E5Z5',
    category: 'Furniture',
    contactPhone: '+91 91122 33445',
    contactEmail: 'contracts@infrasupplies.com',
    status: 'Active',
    rating: 4.7,
    initials: 'IS',
  },
  {
    id: 'VEN-006',
    name: 'Reliable Stationery Hub',
    gstNo: '27FFFFF6666F6Z6',
    category: 'Stationery',
    contactPhone: '+91 90011 22334',
    contactEmail: 'sales@reliablestationery.com',
    status: 'Blocked',
    rating: 3.4,
    initials: 'RS',
  },
];

export const initialRFQs: RFQ[] = [
  {
    id: 'RFQ-001',
    title: 'Office Furniture Procurement Q2',
    category: 'Furniture',
    priority: 'High',
    status: 'Active',
    closeDate: '15 Jun 2028',
    deadline: '2028-06-15',
    expectedDelivery: '2028-07-01',
    description: 'Bulk supply of ergonomic chairs, modular desks and conference tables for the new floor expansion.',
    items: [
      { id: '1', description: 'Ergonomic Executive Chairs', qty: 45, unit: 'units', estPrice: 3500 },
      { id: '2', description: 'Modular Dual Desks', qty: 20, unit: 'sets', estPrice: 8500 },
      { id: '3', description: '12-Seater Boardroom Table', qty: 1, unit: 'unit', estPrice: 28000 },
    ],
    assignedVendorsCount: 3,
  },
  {
    id: 'RFQ-002',
    title: 'Server Cabinets & Laptop Upgrades',
    category: 'IT Hardware',
    priority: 'Urgent',
    status: 'Active',
    closeDate: '10 Jun 2028',
    deadline: '2028-06-10',
    expectedDelivery: '2028-06-25',
    description: 'Enterprise grade server chassis, Cisco switches, and core developer workstations.',
    items: [
      { id: '1', description: 'Core i9 Professional Laptops', qty: 15, unit: 'units', estPrice: 95000 },
      { id: '2', description: '42U Server Rack Cabinets', qty: 4, unit: 'units', estPrice: 45000 },
    ],
    assignedVendorsCount: 2,
  },
  {
    id: 'RFQ-003',
    title: 'Consulting Service Contracts',
    category: 'Professional Services',
    priority: 'Medium',
    status: 'Pending',
    closeDate: '25 Jun 2028',
    deadline: '2028-06-25',
    expectedDelivery: '2028-08-01',
    description: 'Legal consultancy retainer service and internal ERP migration support.',
    items: [
      { id: '1', description: 'Hourly Legal Consultant Support', qty: 120, unit: 'hours', estPrice: 1500 },
    ],
    assignedVendorsCount: 1,
  },
  {
    id: 'RFQ-004',
    title: 'Stationery Kits & Printing SLA',
    category: 'Stationery',
    priority: 'Low',
    status: 'Draft',
    closeDate: '30 Jun 2028',
    deadline: '2028-06-30',
    expectedDelivery: '2028-07-15',
    description: 'Standard back-to-office stationery kits including brand books, pens, and standard pads.',
    items: [
      { id: '1', description: 'Custom Stationery Welcome Kits', qty: 200, unit: 'packs', estPrice: 450 },
    ],
    assignedVendorsCount: 2,
  },
];

export const initialQuotations: Quotation[] = [
  {
    id: 'QT-2028-001',
    rfqId: 'RFQ-001',
    rfqTitle: 'Office Furniture Procurement Q2',
    vendorId: 'VEN-005',
    vendorName: 'Infra Supplies Ltd',
    vendorRating: 4.7,
    total: 185900,
    deliveryTime: 14,
    paymentTerms: 'Net 30',
    validity: 60,
    gstPercent: 18,
    notes: 'Premium ergonomic mesh alignment. Hardwood laminate structure on multi-desks with wire channels included.',
    isLowestPrice: true,
    isFastest: false,
    status: 'Pending',
    items: [
      { description: 'Ergonomic Executive Chairs', unitPrice: 3200, qty: 45, total: 144000 },
      { description: 'Modular Dual Desks', unitPrice: 8000, qty: 20, total: 160000 },
      { description: '12-Seater Boardroom Table', unitPrice: 25000, qty: 1, total: 25000 },
    ],
  },
  {
    id: 'QT-2028-002',
    rfqId: 'RFQ-001',
    rfqTitle: 'Office Furniture Procurement Q2',
    vendorId: 'VEN-003',
    vendorName: 'Prism Office Supplies Ltd',
    vendorRating: 4.2,
    total: 198000,
    deliveryTime: 10,
    paymentTerms: 'Advance',
    validity: 30,
    gstPercent: 18,
    notes: 'Quick-ship catalog items with immediate deployment directly from regional logistics warehouses.',
    isLowestPrice: false,
    isFastest: true,
    status: 'Pending',
    items: [
      { description: 'Ergonomic Executive Chairs', unitPrice: 3400, qty: 45, total: 153000 },
      { description: 'Modular Dual Desks', unitPrice: 8500, qty: 20, total: 170000 },
      { description: '12-Seater Boardroom Table', unitPrice: 29000, qty: 1, total: 29000 },
    ],
  },
  {
    id: 'QT-2028-003',
    rfqId: 'RFQ-001',
    rfqTitle: 'Office Furniture Procurement Q2',
    vendorId: 'VEN-001',
    vendorName: 'Global Tech Solutions',
    vendorRating: 4.8,
    total: 215000,
    deliveryTime: 20,
    paymentTerms: 'Net 45',
    validity: 90,
    gstPercent: 18,
    notes: 'Premium steel frame supports with orthopaedic padding upgrades included free of charge.',
    isLowestPrice: false,
    isFastest: false,
    status: 'Pending',
    items: [
      { description: 'Ergonomic Executive Chairs', unitPrice: 3800, qty: 45, total: 171000 },
      { description: 'Modular Dual Desks', unitPrice: 9000, qty: 20, total: 180000 },
      { description: '12-Seater Boardroom Table', unitPrice: 31000, qty: 1, total: 31000 },
    ],
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'VB-PO-2024-001',
    orderDate: '30/01/24 · 12:51 PM',
    deliveryDate: '01/02/25 · 07:00 PM',
    status: 'Pending',
    total: '₹143.00',
    vendorName: 'Prism Office Supplies Ltd',
    department: 'Administration',
    paymentTerms: 'Net 30 Days',
  },
  {
    id: 'VB-PO-2024-002',
    orderDate: '28/01/24 · 11:00 AM',
    deliveryDate: '01/02/25 · 12:00 PM',
    status: 'Accepted',
    total: '₹78.00',
    vendorName: 'Global Tech Solutions',
    department: 'IT Hardware Support',
    paymentTerms: 'On Delivery',
  },
  {
    id: 'VB-PO-2024-003',
    orderDate: '27/01/24 · 01:35 PM',
    deliveryDate: '31/01/24 · 04:00 PM',
    status: 'Cancelled',
    total: '₹360.00',
    vendorName: 'Reliable Stationery Hub',
    department: 'Marketing',
    paymentTerms: 'Advance',
  },
  {
    id: 'VB-PO-2024-004',
    orderDate: '26/01/24 · 05:00 PM',
    deliveryDate: '04/02/24 · 07:00 PM',
    status: 'Closed',
    total: '₹116.00',
    vendorName: 'Apex Logistics Corp',
    department: 'Logistics',
    paymentTerms: 'Net 30 Days',
  },
  {
    id: 'VB-PO-2024-005',
    orderDate: '06/06/26 · 03:00 PM',
    deliveryDate: '25/06/26 · 02:00 PM',
    status: 'Pending Approval',
    total: '₹1,85,900.00',
    vendorName: 'Infra Supplies Ltd',
    department: 'Facility & Infrastructure',
    paymentTerms: 'Net 30 Days',
  },
  {
    id: 'VB-PO-2024-006',
    orderDate: '24/01/24 · 11:14 AM',
    deliveryDate: '28/01/24 · 06:00 PM',
    status: 'Accepted',
    total: '₹446.00',
    vendorName: 'Global Tech Solutions',
    department: 'Engineering',
    paymentTerms: 'Net 30 Days',
  },
  {
    id: 'VB-PO-2024-007',
    orderDate: '23/01/24 · 11:01 AM',
    deliveryDate: '27/01/24 · 12:00 PM',
    status: 'Closed',
    total: '₹264.00',
    vendorName: 'Zenith Business Advisory',
    department: 'Human Resources',
    paymentTerms: 'Net 45 Days',
  },
  {
    id: 'VB-PO-2024-008',
    orderDate: '06/06/26 · 11:51 AM',
    deliveryDate: '15/06/26 · 01:00 PM',
    status: 'Pending',
    total: '₹529.00',
    vendorName: 'Prism Office Supplies Ltd',
    department: 'Administration',
    paymentTerms: 'Advance',
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-2026-901',
    poId: 'VB-PO-2024-001',
    vendor: 'Prism Office Supplies Ltd',
    amount: '₹14,350',
    status: 'Paid',
    issueDate: '12/02/25 · 10:00 AM',
    dueDate: '12/03/25 · 05:00 PM',
  },
  {
    id: 'INV-2026-902',
    poId: 'VB-PO-2024-002',
    vendor: 'Global Tech Solutions',
    amount: '₹7,800',
    status: 'Pending',
    issueDate: '15/02/25 · 09:30 AM',
    dueDate: '15/03/25 · 05:00 PM',
  },
  {
    id: 'INV-2026-903',
    poId: 'VB-PO-2024-004',
    vendor: 'Apex Logistics Corp',
    amount: '₹11,600',
    status: 'Paid',
    issueDate: '18/02/25 · 11:15 AM',
    dueDate: '18/03/25 · 05:00 PM',
  },
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 1,
    action: 'Quotation submitted — office furniture Q2',
    timestamp: '06 Jun 2026 · 09:30 AM',
    user: 'Vendor: Infra Supplies Ltd',
    details: 'Infra Supplies Ltd submitted Quotation QT-2028-001 for RFQ-001 of ₹1,85,900.00',
    type: 'quotation',
    color: 'purple',
    icon: 'FileText',
  },
  {
    id: 2,
    action: 'RFQ approved',
    timestamp: '05 Jun 2026 · 03:00 PM',
    user: 'Aman S. (Head of Procurement)',
    details: 'RFQ-001 has been approved and published to the Vendor Bridge preferred network',
    type: 'approval',
    color: 'green',
    icon: 'BadgeCheck',
  },
  {
    id: 3,
    action: 'RFQ created',
    timestamp: '05 Jun 2026 · 02:45 PM',
    user: 'Denish V. (Procurement Officer)',
    details: 'RFQ-001 "Office Furniture Procurement Q2" initialized with 3 line items',
    type: 'rfq',
    color: 'blue',
    icon: 'FileSearch',
  },
  {
    id: 4,
    action: 'PO generated',
    timestamp: '04 Jun 2026 · 11:00 AM',
    user: 'System Auto-Engine',
    details: 'VB-PO-2024-004 automatically generated and dispatched to Apex Logistics Corp',
    type: 'po',
    color: 'indigo',
    icon: 'ShoppingBag',
  },
  {
    id: 5,
    action: 'Invoice sent',
    timestamp: '03 Jun 2026 · 01:20 PM',
    user: 'Vendor: Prism Office Supplies Ltd',
    details: 'Invoice INV-2026-901 dispatched for PO VB-PO-2024-001 of ₹14,350.00',
    type: 'invoice',
    color: 'green',
    icon: 'Mail',
  },
  {
    id: 6,
    action: 'Vendor added',
    timestamp: '02 Jun 2026 · 04:50 PM',
    user: 'Denish V. (Procurement Officer)',
    details: 'Infra Supplies Ltd boarded onto Platform Registry as Preferenced Vendor #V-005',
    type: 'vendor',
    color: 'blue',
    icon: 'Building2',
  },
  {
    id: 7,
    action: 'Status changed',
    timestamp: '01 Jun 2026 · 10:15 AM',
    user: 'Procurement Admin',
    details: 'Reliable Stationery Hub moved to BLOCKED status due to continuous delivery delays',
    type: 'system',
    color: 'amber',
  },
];

export interface UserAccount {
  email: string;
  firstName: string;
  lastName: string;
  role: 'procurement_officer' | 'vendor' | 'manager' | 'admin';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  companyName?: string; // for vendor role
  password?: string;
  avatar?: string;
}

export const initialUsers: UserAccount[] = [
  {
    email: 'officer@vendorbridge.com',
    firstName: 'Denish',
    lastName: 'Vekariya',
    role: 'procurement_officer',
    status: 'Active',
    lastLogin: '06 Jun 2026 · 11:15 AM',
    password: 'password123'
  },
  {
    email: 'manager@vendorbridge.com',
    firstName: 'Aman',
    lastName: 'Shah',
    role: 'manager',
    status: 'Active',
    lastLogin: '06 Jun 2026 · 10:30 AM',
    password: 'password123'
  },
  {
    email: 'admin@vendorbridge.com',
    firstName: 'Brijesh',
    lastName: 'Sharma',
    role: 'admin',
    status: 'Active',
    lastLogin: '06 Jun 2026 · 09:00 AM',
    password: 'password123'
  },
  {
    email: 'vendor@vendorbridge.com',
    firstName: 'Global',
    lastName: 'Tech',
    role: 'vendor',
    status: 'Active',
    lastLogin: '06 Jun 2026 · 08:45 AM',
    companyName: 'Global Tech Solutions',
    password: 'password123'
  },
  {
    email: 'infra@vendorbridge.com',
    firstName: 'Infra',
    lastName: 'Supplies',
    role: 'vendor',
    status: 'Active',
    lastLogin: '05 Jun 2026 · 04:00 PM',
    companyName: 'Infra Supplies Ltd',
    password: 'password123'
  }
];

// Central database init helper
export const initStorage = () => {
  if (typeof window === 'undefined') return;
  const storageKeys = {
    vendors: JSON.stringify(initialVendors),
    rfqs: JSON.stringify(initialRFQs),
    quotations: JSON.stringify(initialQuotations),
    pos: JSON.stringify(initialPurchaseOrders),
    invoices: JSON.stringify(initialInvoices),
    activityLogs: JSON.stringify(initialActivityLogs),
    users: JSON.stringify(initialUsers),
  };

  Object.entries(storageKeys).forEach(([key, d]) => {
    if (!localStorage.getItem(`vb_${key}`)) {
      localStorage.setItem(`vb_${key}`, d);
    }
  });

  if (!localStorage.getItem('vb_logged_in')) {
    // Default logged out to show login screen
    localStorage.setItem('vb_logged_in', 'false');
  }
};

export const getFromStorage = <T>(key: 'vendors' | 'rfqs' | 'quotations' | 'pos' | 'invoices' | 'activityLogs' | 'users'): T[] => {
  if (typeof window === 'undefined') return [];
  const val = localStorage.getItem(`vb_${key}`);
  return val ? JSON.parse(val) : [];
};

export const saveToStorage = (key: 'vendors' | 'rfqs' | 'quotations' | 'pos' | 'invoices' | 'activityLogs' | 'users', data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`vb_${key}`, JSON.stringify(data));
};

// ───────────────────────────────────────────────────────────
// Invoice Generation Helpers (Fix 1A)
// ───────────────────────────────────────────────────────────

export const generateInvoiceId = (): string => {
  const year = new Date().getFullYear();
  const existing = getFromStorage<Invoice>('invoices');
  const next = existing.length + 1;
  return `INV-${year}-${String(900 + next).padStart(3, '0')}`;
};

export const generateInvoiceFromPO = (po: PurchaseOrder): Invoice => {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 30);

  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;

  return {
    id: generateInvoiceId(),
    poId: po.id,
    vendor: po.vendorName || 'Unknown Vendor',
    amount: po.total, // carries the ₹ string directly — never '0'
    status: 'Pending',
    issueDate: fmt(now),
    dueDate: fmt(due),
  };
};

