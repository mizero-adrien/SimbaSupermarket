import { Branch, User } from '@/types';

const BRANCHES_STORAGE_KEY = 'simba_branches';

export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'utc-kigali',
    name: 'Union Trade Centre',
    location: 'City Center',
    address: '1 KN 4 Ave, Kigali (Union Trade Centre)',
    coordinates: '3336+MHV',
    phone: '+250 788 000 001',
    hours: 'Mon–Sun: 7:00 AM – 10:00 PM',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=600&h=400&fit=crop',
    isOpen: true,
    managerId: 'rep-utc',
    rating: 4.6,
    reviewCount: 128,
    description: 'Our flagship city-center branch with full grocery sections, cooked food, and fast checkout lanes for busy shoppers.',
    services: ['Fresh Produce', 'Cooked Food', 'Bakery', 'Household Essentials', 'Card Payments'],
    highlights: ['Flagship city-center store', 'Wide imported and local product mix', 'Convenient for office workers'],
    mapUrl: 'https://maps.google.com/?q=3336%2BMHV%20Union%20Trade%20Centre%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'Richard Madete',
        quote: 'Simba Supermarket is simply the largest and best supermarket in Kigali city center and in the country in general.',
        address: '3336+MHV Union Trade Centre, 1 KN 4 Ave, Kigali',
        sentiment: 'positive',
      },
    ],
  },
  {
    id: 'kacyiru',
    name: 'Kacyiru Branch',
    location: 'Kacyiru',
    address: 'KN 5 Rd, Kacyiru, Kigali',
    coordinates: 'KN 5 Rd',
    phone: '+250 788 000 002',
    hours: 'Mon–Sun: 7:00 AM – 10:00 PM',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    isOpen: true,
    rating: 4.5,
    reviewCount: 96,
    description: 'Kacyiru branch known for affordable pricing, ready meals, and consistent availability of daily essentials.',
    services: ['Fresh Produce', 'Cooked Food', 'Butchery', 'Home Supplies', 'Mobile Money'],
    highlights: ['Affordable daily shopping', 'Strong prepared food section', 'Fast neighborhood access'],
    mapUrl: 'https://maps.google.com/?q=KN%205%20Rd%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'Stella Matutina',
        quote: 'It is one of the first supermarkets in Kigali where you can find almost everything, plus cooked food at affordable prices.',
        address: 'KN 5 Rd, Kigali',
        sentiment: 'positive',
      },
    ],
  },
  {
    id: 'nyabugogo',
    name: 'Nyabugogo Branch',
    location: 'Nyabugogo',
    address: 'KG 541 St, Nyabugogo, Kigali',
    coordinates: 'KG 541 St',
    phone: '+250 788 000 003',
    hours: 'Mon–Sun: 6:30 AM – 9:30 PM',
    image: 'https://images.unsplash.com/photo-1580913428735-bd3c269d6a82?w=600&h=400&fit=crop',
    isOpen: true,
    rating: 4.4,
    reviewCount: 82,
    description: 'A high-traffic branch close to transport routes, ideal for quick grocery and household pickups.',
    services: ['Bulk Goods', 'Fresh Produce', 'Snacks', 'Household Essentials', 'Card Payments'],
    highlights: ['Near major transit routes', 'Strong value packs and bulk items', 'Efficient quick-stop shopping'],
    mapUrl: 'https://maps.google.com/?q=KG%20541%20St%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'Dipankar Lahkar',
        quote: 'Simba stores are among the best places in Kigali to buy groceries and home items.',
        address: 'KG 541 St, Kigali',
        sentiment: 'positive',
      },
    ],
  },
  {
    id: 'kimironko',
    name: 'Kimironko Branch',
    location: 'Kimironko',
    address: '342F+3V5, Kimironko, Kigali',
    coordinates: 'KG 192 St',
    phone: '+250 788 000 004',
    hours: 'Mon–Sun: 7:00 AM – 10:00 PM',
    image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&h=400&fit=crop',
    isOpen: true,
    rating: 4.3,
    reviewCount: 71,
    description: 'Community-focused branch serving Kimironko with strong stock levels in groceries and home-use products.',
    services: ['Fresh Produce', 'Frozen Foods', 'Pantry Staples', 'Cleaning Supplies', 'Mobile Money'],
    highlights: ['Strong neighborhood convenience', 'Reliable groceries and home stock', 'Good value for everyday baskets'],
    mapUrl: 'https://maps.google.com/?q=342F%2B3V5%2C%20Kimironko%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'Niyotwiringiye Charles',
        quote: 'Simba Supermarket, Kimironko is a convenient supermarket location with broad household and grocery options.',
        address: '24XF+XVV, KG 192 St, Kigali',
        sentiment: 'positive',
      },
    ],
  },
  {
    id: 'gisozi',
    name: 'Gisozi Branch',
    location: 'Gisozi',
    address: '24Q5+R2R, Gisozi, Kigali',
    coordinates: '24Q5+R2R',
    phone: '+250 788 000 005',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
    image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=600&h=400&fit=crop',
    isOpen: false,
    rating: 4.1,
    reviewCount: 54,
    description: 'Compact neighborhood branch with practical essentials and a quick in-and-out shopping experience.',
    services: ['Pantry Staples', 'Beverages', 'Toiletries', 'Cleaning Supplies'],
    highlights: ['Compact layout for speed', 'Everyday essentials focus', 'Useful stop for nearby households'],
    mapUrl: 'https://maps.google.com/?q=24Q5%2BR2R%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'MUHOZA Rene',
        quote: 'Despite dim lighting, Simba is packed with almost everything you need food-wise in Rwanda.',
        address: '24Q5+R2R, Kigali',
        sentiment: 'mixed',
      },
    ],
  },
  {
    id: 'nyamirambo',
    name: 'Nyamirambo Branch',
    location: 'Nyamirambo',
    address: 'Near Cosmos, Nyamirambo, Kigali',
    coordinates: '23H4+26V',
    phone: '+250 788 000 006',
    hours: 'Mon–Sun: 7:00 AM – 10:00 PM',
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&h=400&fit=crop',
    isOpen: true,
    rating: 3.6,
    reviewCount: 63,
    description: 'Busy branch with broad product depth; currently focused on service quality improvements and customer experience consistency.',
    services: ['Fresh Produce', 'Bakery', 'Home Supplies', 'Mobile Money', 'Card Payments'],
    highlights: ['Large product variety', 'Good neighborhood accessibility', 'Active customer-service improvements'],
    mapUrl: 'https://maps.google.com/?q=23H4%2B26V%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'Cyuzuzo Ngenzi',
        quote: 'I had very bad experiences across multiple Simba locations, including city center and Nyamirambo.',
        address: '23H4+26V, Kigali',
        sentiment: 'negative',
      },
    ],
  },
  {
    id: 'remera',
    name: 'Remera Branch',
    location: 'Remera',
    address: '24G3+MCV, Remera, Kigali',
    coordinates: '24G3+MCV',
    phone: '+250 788 000 007',
    hours: 'Mon–Sat: 7:00 AM – 9:30 PM',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=400&fit=crop',
    isOpen: true,
    rating: 4.4,
    reviewCount: 75,
    description: 'Reliable Remera location for weekly grocery runs, with an efficient shopping flow and broad essentials stock.',
    services: ['Fresh Produce', 'Dairy', 'Snacks', 'Household Essentials', 'Card Payments'],
    highlights: ['Popular recurring shopping destination', 'Reliable stock for routine baskets', 'Fast checkout availability'],
    mapUrl: 'https://maps.google.com/?q=24G3%2BMCV%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'SIBOMANA Eugene',
        quote: 'Simba is my go-to supermarket in Kigali.',
        address: '24G3+MCV, Kigali',
        sentiment: 'positive',
      },
    ],
  },
  {
    id: 'kicukiro',
    name: 'Kicukiro Branch',
    location: 'Kicukiro',
    address: 'KK 35 Ave, Kicukiro, Kigali',
    coordinates: 'KK 35 Ave',
    phone: '+250 788 000 008',
    hours: 'Mon–Sun: 7:00 AM – 10:00 PM',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=600&h=400&fit=crop',
    isOpen: true,
    rating: 3.9,
    reviewCount: 59,
    description: 'Well-positioned Kicukiro branch offering broad essentials and regular family shopping options.',
    services: ['Fresh Produce', 'Pantry Staples', 'Frozen Foods', 'Home Supplies', 'Mobile Money'],
    highlights: ['Strong local convenience', 'Balanced grocery assortment', 'Useful for family weekly shopping'],
    mapUrl: 'https://maps.google.com/?q=KK%2035%20Ave%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'Matylda B',
        quote: 'I had a difficult experience and felt unfairly treated while shopping.',
        address: 'KK 35 Ave, Kigali',
        sentiment: 'negative',
      },
    ],
  },
  {
    id: 'kanombe',
    name: 'Kanombe Branch',
    location: 'Kanombe',
    address: '24J3+Q3, Kanombe, Kigali',
    coordinates: '24J3+Q3',
    phone: '+250 788 000 009',
    hours: 'Mon–Sun: 8:00 AM – 9:00 PM',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    isOpen: true,
    rating: 3.8,
    reviewCount: 43,
    description: 'A growing branch in Kanombe focused on essential groceries and practical home shopping needs.',
    services: ['Pantry Staples', 'Beverages', 'Toiletries', 'Cleaning Supplies', 'Card Payments'],
    highlights: ['Easy neighborhood access', 'Good essentials coverage', 'Continuous branch improvements'],
    mapUrl: 'https://maps.google.com/?q=24J3%2BQ3%2C%20Kigali',
    testimonials: [
      {
        reviewer: 'Bethany Mattison',
        quote: 'This branch is not the best Simba branch, but still serviceable compared to others I visited.',
        address: '24J3+Q3, Kigali',
        sentiment: 'mixed',
      },
    ],
  },
  {
    id: 'gisenyi',
    name: 'Gisenyi Branch',
    location: 'Gisenyi (Rubavu)',
    address: '8754+P7W, Gisenyi, Rubavu District',
    coordinates: '8754+P7W',
    phone: '+250 788 000 010',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
    image: 'https://images.unsplash.com/photo-1580913428735-bd3c269d6a82?w=600&h=400&fit=crop',
    isOpen: true,
    managerId: 'rep-gisenyi',
    rating: 4.0,
    reviewCount: 37,
    description: 'Our Rubavu branch serving Gisenyi with daily groceries and household essentials near cross-border communities.',
    services: ['Fresh Produce', 'Pantry Staples', 'Beverages', 'Home Supplies', 'Mobile Money'],
    highlights: ['Regional branch outside Kigali', 'Reliable daily essentials', 'Convenient for local and visiting shoppers'],
    mapUrl: 'https://maps.google.com/?q=8754%2BP7W%2C%20Gisenyi',
    testimonials: [
      {
        reviewer: '1 mutuyimana',
        quote: 'Supermarket.',
        address: '8754+P7W, Gisenyi',
        sentiment: 'mixed',
      },
    ],
  },
];

export const BRANCHES: Branch[] = DEFAULT_BRANCHES;

export function getAllBranches(): Branch[] {
  if (typeof window === 'undefined') return DEFAULT_BRANCHES;

  try {
    const raw = localStorage.getItem(BRANCHES_STORAGE_KEY);
    const stored: Branch[] = raw ? JSON.parse(raw) : [];
    return stored.length > 0 ? stored : DEFAULT_BRANCHES;
  } catch {
    return DEFAULT_BRANCHES;
  }
}

export function saveAllBranches(branches: Branch[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
}

export function upsertBranch(branch: Branch) {
  const branches = getAllBranches();
  const idx = branches.findIndex(b => b.id === branch.id);
  const updated = idx >= 0
    ? branches.map(b => (b.id === branch.id ? branch : b))
    : [...branches, branch];

  saveAllBranches(updated);
  return updated;
}

export function removeBranchById(id: string) {
  const updated = getAllBranches().filter(b => b.id !== id);
  saveAllBranches(updated);
  return updated;
}

export const DEMO_USERS: User[] = [
  {
    id: 'sysadmin-1',
    name: 'Simba System Admin',
    email: 'sysadmin@simba.rw',
    password: 'SysAdmin@2024',
    role: 'system_admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    phone: '+250 788 000 000',
  },
  {
    id: 'rep-utc',
    name: 'Jean Claude Uwimana',
    email: 'utc@simba.rw',
    password: 'Branch@2024',
    role: 'branch_representative',
    branchId: 'utc-kigali',
    createdAt: '2024-01-01T00:00:00.000Z',
    phone: '+250 788 000 001',
  },
  {
    id: 'rep-gisenyi',
    name: 'Marie Ange Uwase',
    email: 'gisenyi@simba.rw',
    password: 'Branch@2024',
    role: 'branch_representative',
    branchId: 'gisenyi',
    createdAt: '2024-06-01T00:00:00.000Z',
    phone: '+250 788 000 010',
  },
  // Branch staff — UTC branch
  {
    id: 'staff-utc-1',
    name: 'Patrick Mugisha',
    email: 'patrick@simba.rw',
    password: 'Staff@2024',
    role: 'branch_staff',
    branchId: 'utc-kigali',
    createdAt: '2024-01-15T00:00:00.000Z',
    phone: '+250 788 100 001',
  },
  {
    id: 'staff-utc-2',
    name: 'Diane Uwimana',
    email: 'diane@simba.rw',
    password: 'Staff@2024',
    role: 'branch_staff',
    branchId: 'utc-kigali',
    createdAt: '2024-01-15T00:00:00.000Z',
    phone: '+250 788 100 002',
  },
  // Branch staff — Kacyiru branch
  {
    id: 'staff-kac-1',
    name: 'Eric Nzeyimana',
    email: 'eric@simba.rw',
    password: 'Staff@2024',
    role: 'branch_staff',
    branchId: 'kacyiru',
    createdAt: '2024-01-15T00:00:00.000Z',
    phone: '+250 788 100 003',
  },
];

export function getBranchById(id: string): Branch | undefined {
  return getAllBranches().find(b => b.id === id);
}

export function getBranchByManagerId(managerId: string): Branch | undefined {
  return getAllBranches().find(b => b.managerId === managerId);
}
