type TemplateStyle = 'minimalist' | 'luxury' | 'retro' | 'custom';

interface FontCollection {
  primary: string[];
  secondary: string[];
  accent: string[];
}

// These fonts are confirmed to work in Figma
const fontCollections: Record<TemplateStyle, FontCollection> = {
  minimalist: {
    primary: ['Inter', 'Arial', 'Roboto'],
    secondary: ['SF Pro Text', 'Helvetica Neue', 'Open Sans'],
    accent: ['Montserrat']
  },
  luxury: {
    primary: ['Playfair Display', 'Georgia'],
    secondary: ['Optima', 'Times New Roman'],
    accent: ['Baskerville']
  },
  retro: {
    primary: ['Courier', 'Courier New'],
    secondary: ['Georgia', 'Times New Roman'],
    accent: ['Arial Black']
  },
  custom: {
    primary: ['Inter', 'Arial'],
    secondary: ['Roboto', 'SF Pro Text'],
    accent: ['Montserrat', 'Georgia']
  }
};

async function isFontAvailable(fontFamily: string): Promise<boolean> {
  try {
    await figma.loadFontAsync({ family: fontFamily, style: 'Regular' });
    return true;
  } catch {
    return false;
  }
}

export async function getRandomFonts(template: TemplateStyle): Promise<string[]> {
  const collection = fontCollections[template];
  const selectedFonts: string[] = [];

  // Try to get one font from each category that's available
  for (const category of [collection.primary, collection.secondary, collection.accent]) {
    let foundFont = false;
    
    // Try each font in the category until we find one that works
    for (const font of category) {
      if (await isFontAvailable(font)) {
        selectedFonts.push(font);
        foundFont = true;
        break;
      }
    }
    
    // If no font in this category works, use a fallback
    if (!foundFont) {
      selectedFonts.push('Arial');
    }
  }

  return selectedFonts;
} 