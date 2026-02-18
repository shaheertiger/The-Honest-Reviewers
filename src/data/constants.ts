import type { Product, Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Smart Home', slug: 'smart-home', icon: '🏠' },
  { id: '2', name: 'Kitchen', slug: 'kitchen', icon: '🍳' },
  { id: '3', name: 'Tech', slug: 'tech', icon: '💻' },
  { id: '4', name: 'Fitness', slug: 'fitness', icon: '💪' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'UltraVision Pro OLED 4K Monitor',
    brand: 'VisionTech',
    price: 899.99,
    rating: 4.8,
    reviewCount: 12450,
    imageUrl: 'https://picsum.photos/seed/monitor/800/600',
    amazonUrl: 'https://amazon.com/sample',
    category: 'tech',
    tagline: 'The Ultimate Display for Creatives and Gamers Alike.',
    pros: ['Stunning color accuracy', 'Instant response time', 'Ultra-thin bezel design'],
    cons: ['High price point', 'Stand takes up significant desk space'],
    specs: {
      'Resolution': '3840 x 2160',
      'Refresh Rate': '144Hz',
      'Panel Type': 'OLED',
      'Connectivity': 'Thunderbolt 4, HDMI 2.1'
    },
    description: 'The UltraVision Pro sets a new standard for desktop displays. With deep blacks and vibrant colors, it is perfect for HDR editing and competitive gaming.',
    badges: ['Editor\'s Choice', 'Top Rated']
  },
  {
    id: 'p2',
    name: 'BrewMaster Elite Coffee Station',
    brand: 'CaffeineCo',
    price: 249.00,
    rating: 4.6,
    reviewCount: 8900,
    imageUrl: 'https://picsum.photos/seed/coffee/800/600',
    amazonUrl: 'https://amazon.com/sample',
    category: 'kitchen',
    tagline: 'Barista-Quality Coffee in Your Kitchen.',
    pros: ['Fast heating', 'Built-in grinder', 'Easy to clean'],
    cons: ['Large footprint', 'Noisy during grinding'],
    specs: {
      'Water Tank': '60 oz',
      'Grinder Settings': '30 levels',
      'Pressure': '15 bar',
      'Material': 'Stainless Steel'
    },
    description: 'Transform your mornings with the BrewMaster Elite. It simplifies complex espresso brewing into a one-touch experience.',
    badges: ['Best Value']
  }
];

export const BRAND_COLORS = {
  primary: '#FF4500',
  secondary: '#1E90FF',
  text: '#333333',
  bg: '#FFFFFF'
};
