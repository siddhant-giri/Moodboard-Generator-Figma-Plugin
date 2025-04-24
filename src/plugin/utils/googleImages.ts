type UICategory = 'mobile' | 'landing-page' | 'web-app';

export async function fetchGoogleImages(keyword: string, category: UICategory): Promise<string[]> {
  // Combine keyword with category for more specific results
  const searchTerm = `${keyword} ${category.replace('-', ' ')} ui design`;
  
  // Using actual image URLs that are guaranteed to work
  const mockImages: Record<UICategory, string[]> = {
    'mobile': [
      'https://picsum.photos/400/800',
      'https://picsum.photos/401/800',
      'https://picsum.photos/402/800'
    ],
    'landing-page': [
      'https://picsum.photos/1200/800',
      'https://picsum.photos/1201/800',
      'https://picsum.photos/1202/800'
    ],
    'web-app': [
      'https://picsum.photos/1000/800',
      'https://picsum.photos/1001/800',
      'https://picsum.photos/1002/800'
    ]
  };

  console.log(`Searching for: ${searchTerm}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Add random parameter to prevent caching
  return mockImages[category].map(url => `${url}?random=${Math.random()}`);
} 