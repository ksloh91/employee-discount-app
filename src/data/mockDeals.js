export const mockDeals = [
  {
    id: '1',
    merchantName: 'Coffee Hub',
    title: '20% off any drink',
    description: 'Show this code at checkout. Valid once per visit.',
    discount: '20%',
    code: 'EMP20',
    validUntil: '2025-12-31',
    category: 'Food & Drink',
  },
  {
    id: '2',
    merchantName: 'TechGear Store',
    title: '15% off electronics',
    description: 'In-store and online. Excludes already discounted items.',
    discount: '15%',
    code: 'TECH15',
    validUntil: '2025-06-30',
    category: 'Retail',
  },
  {
    id: '3',
    merchantName: 'FitLife Gym',
    title: 'First month 50% off',
    description: 'New members only. Present your employee ID.',
    discount: '50%',
    code: null,
    validUntil: '2025-12-31',
    category: 'Health & Fitness',
  },
  {
    id: '4',
    merchantName: 'Bookworm Books',
    title: '25% off all books',
    description: 'In-store and online. Excludes already discounted items.',
    discount: '25%',
    code: 'BOOK25',
    validUntil: '2025-06-30',
    category: 'Books',
  },
  {
    id: '5',
    merchantName: 'Movie Night',
    title: '10% off movie tickets',
    description: 'In-store and online. Excludes already discounted items.',
    discount: '10%',
    code: 'MOVIE10',
    validUntil: '2025-06-30',
    category: 'Movies',
  },
];

export const mockCategories = [
  'Food & Drink',
  'Retail',
  'Health & Fitness',
];

export function getMockDeals() {
  return mockDeals;
}

export function getMockCategories() {
  return mockCategories;
}

export function getRedeemedDeals() {
  return mockDeals.filter((d) => d.redeemed);
}