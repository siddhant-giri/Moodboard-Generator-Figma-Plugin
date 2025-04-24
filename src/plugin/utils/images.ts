// import { config } from '../config';

export async function fetchImages(keyword: string): Promise<string[]> {
  try {
    // Using Lorem Picsum with keyword in the seed for some relevance
    const keywordSeed = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return [
      `https://picsum.photos/seed/${keywordSeed}/800/600`,
      `https://picsum.photos/seed/${keywordSeed + 1}/600/800`,
      `https://picsum.photos/seed/${keywordSeed + 2}/800/800`,
      `https://picsum.photos/seed/${keywordSeed + 3}/900/600`
    ];
  } catch (error) {
    console.error('Error fetching images:', error);
    // Fallback to completely random images if something goes wrong
    return [
      `https://picsum.photos/800/600?random=${Math.random()}`,
      `https://picsum.photos/600/800?random=${Math.random()}`,
      `https://picsum.photos/800/800?random=${Math.random()}`,
      `https://picsum.photos/900/600?random=${Math.random()}`
    ];
  }
} 