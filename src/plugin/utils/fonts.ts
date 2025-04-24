import { config } from '../config';

export async function loadFontsAsync(fontFamilies: string[]) {
  const promises = fontFamilies.map(family => 
    figma.loadFontAsync({ family, style: 'Regular' })
  );
  await Promise.all(promises);
}

export async function getSuggestedFonts(): Promise<string[]> {
  try {
    if (config.GOOGLE_FONTS_API_KEY) {
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${config.GOOGLE_FONTS_API_KEY}&sort=popularity`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.items.slice(0, 5).map(font => font.family);
      }
    }
    
    // Fallback to default fonts
    return ['Inter', 'Roboto', 'Playfair Display'];
  } catch (error) {
    console.error('Error fetching fonts:', error);
    return ['Inter', 'Roboto', 'Playfair Display'];
  }
} 

