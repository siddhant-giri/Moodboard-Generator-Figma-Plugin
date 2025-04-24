import { LayoutTemplate } from './layout';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const TEMPLATE_PALETTES = {
  minimalist: [
    { r: 0.95, g: 0.95, b: 0.95 }, // Off White
    { r: 0.85, g: 0.85, b: 0.85 }, // Light Gray
    { r: 0.65, g: 0.65, b: 0.65 }, // Mid Gray
    { r: 0.25, g: 0.25, b: 0.25 }, // Dark Gray
    { r: 0.05, g: 0.05, b: 0.05 }  // Almost Black
  ],
  luxury: [
    { r: 0.98, g: 0.84, b: 0.01 }, // Gold
    { r: 0.15, g: 0.15, b: 0.15 }, // Dark Gray
    { r: 0.95, g: 0.95, b: 0.95 }, // White
    { r: 0.55, g: 0.47, b: 0.04 }, // Dark Gold
    { r: 0.05, g: 0.05, b: 0.05 }  // Black
  ],
  retro: [
    { r: 0.96, g: 0.87, b: 0.70 }, // Cream
    { r: 0.80, g: 0.30, b: 0.30 }, // Retro Red
    { r: 0.30, g: 0.70, b: 0.50 }, // Mint Green
    { r: 0.40, g: 0.50, b: 0.80 }, // Dusty Blue
    { r: 0.90, g: 0.60, b: 0.30 }  // Orange
  ]
};

export async function generateColorPalette(template: LayoutTemplate = 'minimalist'): Promise<RGBColor[]> {
  try {
    // Use template-specific colors with slight variations
    const basePalette = TEMPLATE_PALETTES[template] || TEMPLATE_PALETTES.minimalist;
    
    return basePalette.map(color => ({
      r: color.r + (Math.random() - 0.5) * 0.1,
      g: color.g + (Math.random() - 0.5) * 0.1,
      b: color.b + (Math.random() - 0.5) * 0.1
    }));
  } catch (error) {
    console.error('Error generating color palette:', error);
    return TEMPLATE_PALETTES[template] || TEMPLATE_PALETTES.minimalist;
  }
} 