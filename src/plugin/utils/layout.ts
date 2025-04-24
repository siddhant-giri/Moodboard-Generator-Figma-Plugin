export type LayoutTemplate = 'minimalist' | 'luxury' | 'retro' | 'custom';

export function createMoodboardFrame(template: LayoutTemplate) {
  // Get existing moodboards to calculate position
  const existingMoodboards = figma.currentPage.children.filter(
    node => node.type === 'FRAME' && node.name.startsWith('Moodboard -')
  );

  const frame = figma.createFrame();
  frame.name = `Moodboard - ${template}`;
  frame.resize(1920, 1080);
  
  // Position new moodboard to the right of existing ones
  if (existingMoodboards.length > 0) {
    const lastMoodboard = existingMoodboards[existingMoodboards.length - 1];
    frame.x = lastMoodboard.x + lastMoodboard.width + 100;
    frame.y = lastMoodboard.y;
  }

  // Set background based on template
  frame.fills = [{ type: 'SOLID', color: getTemplateBackground(template) }];
  frame.layoutMode = 'NONE';
  return frame;
}

function getTemplateBackground(template: LayoutTemplate): { r: number, g: number, b: number } {
  switch (template) {
    case 'minimalist':
      return { r: 1, g: 1, b: 1 }; // White
    case 'luxury':
      return { r: 0.06, g: 0.06, b: 0.06 }; // Dark
    case 'retro':
      return { r: 0.98, g: 0.95, b: 0.90 }; // Cream
    default:
      return { r: 0.98, g: 0.98, b: 0.98 }; // Light Gray
  }
}

export function arrangeElements(frame: FrameNode, elements: SceneNode[], template: LayoutTemplate) {
  // First, make sure all elements are children of the frame
  elements.forEach(element => {
    if (element.parent !== frame) {
      frame.appendChild(element);
    }
  });

  // Separate elements by type
  const imageNodes = elements.filter(el => el.type === 'FRAME') as FrameNode[];
  const colorNodes = elements.filter(el => el.type === 'RECTANGLE') as RectangleNode[];
  const textNodes = elements.filter(el => el.type === 'TEXT') as TextNode[];

  switch (template) {
    case 'minimalist':
      arrangeMinimalist(frame, imageNodes, colorNodes, textNodes);
      break;
    case 'luxury':
      arrangeLuxury(frame, imageNodes, colorNodes, textNodes);
      break;
    case 'retro':
      arrangeRetro(frame, imageNodes, colorNodes, textNodes);
      break;
    default:
      arrangeCustom(frame, imageNodes, colorNodes, textNodes);
  }
}

function arrangeMinimalist(
  frame: FrameNode,
  images: FrameNode[],
  colors: RectangleNode[],
  texts: TextNode[]
) {
  const padding = 40;
  
  // Calculate dimensions for a 2x2 grid layout
  const gridWidth = (frame.width - (padding * 3)) / 2;
  const gridHeight = (frame.height - (padding * 3) - 200) / 2; // Reserve space for colors and text

  // Arrange images in 2x2 grid
  images.forEach((image, index) => {
    if (index < 4) { // Only use first 4 images
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      image.x = padding + (col * (gridWidth + padding));
      image.y = padding + (row * (gridHeight + padding));
      image.resize(gridWidth, gridHeight);
    }
  });

  // Arrange color swatches in a row at the bottom
  const colorSwatchSize = 80;
  const colorGap = 10;
  const colorStartX = padding;
  const colorY = frame.height - padding - colorSwatchSize - 100; // Above text

  colors.forEach((color, index) => {
    color.x = colorStartX + (index * (colorSwatchSize + colorGap));
    color.y = colorY;
    color.resize(colorSwatchSize, colorSwatchSize);
  });

  // Arrange typography samples
  const fontSectionWidth = (frame.width - (padding * 2)) / texts.length;
  texts.forEach((text, index) => {
    text.x = padding + (index * fontSectionWidth);
    text.y = frame.height - padding - 80;
    text.fontSize = 24;
    text.textAlignHorizontal = 'LEFT';
    
    // Split the text into font name and samples
    const fontName = text.characters.split('\n')[0];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    
    text.characters = `${fontName}\n${alphabet}\n${lowercase}`;
  });
}

function arrangeLuxury(
  frame: FrameNode,
  images: FrameNode[],
  colors: RectangleNode[],
  texts: TextNode[]
) {
  const padding = 40;
  
  // Large hero image with overlay
  if (images[0]) {
    images[0].x = padding;
    images[0].y = padding;
    images[0].resize(frame.width - (padding * 2), frame.height * 0.4);
    
    // Add dark overlay
    const overlay = figma.createRectangle();
    overlay.resize(images[0].width, images[0].height);
    overlay.x = images[0].x;
    overlay.y = images[0].y;
    overlay.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.3 }];
    frame.appendChild(overlay);
  }

  // Three smaller images below
  const smallImageWidth = (frame.width - (padding * 4)) / 3;
  const smallImageHeight = frame.height * 0.25;
  images.slice(1, 4).forEach((image, index) => {
    image.x = padding + (index * (smallImageWidth + padding));
    image.y = frame.height * 0.4 + (padding * 2);
    image.resize(smallImageWidth, smallImageHeight);
  });

  // Color swatches as a horizontal row
  const colorWidth = 100;
  const colorGap = 20;
  colors.forEach((color, index) => {
    color.x = padding + (index * (colorWidth + colorGap));
    color.y = frame.height * 0.7 + padding;
    color.resize(colorWidth, colorWidth);
  });

  // Typography samples at the bottom
  const fontSectionWidth = (frame.width - (padding * 2)) / texts.length;
  texts.forEach((text, index) => {
    text.x = padding + (index * fontSectionWidth);
    text.y = frame.height * 0.85;
    text.fontSize = 28;
    text.textAlignHorizontal = 'LEFT';
    text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // White text
    
    const fontName = text.characters.split('\n')[0];
    text.characters = `${fontName}\nABCDEFGHIJKLMNOPQRSTUVWXYZ`;
  });
}

function arrangeRetro(
  frame: FrameNode,
  images: FrameNode[],
  colors: RectangleNode[],
  texts: TextNode[]
) {
  const padding = 40;
  
  // Arrange images in a collage style
  images.forEach((image, index) => {
    const angle = (Math.random() - 0.5) * 15; // Random rotation between -7.5 and 7.5 degrees
    image.rotation = angle;
    
    // Position based on index
    const section = index % 4;
    const sectionWidth = frame.width / 2;
    const sectionHeight = frame.height / 2;
    
    image.x = (section % 2) * sectionWidth + padding;
    image.y = Math.floor(section / 2) * sectionHeight + padding;
    image.resize(sectionWidth - padding * 2, sectionHeight - padding * 2);
  });

  // Color swatches as vintage-style circles
  colors.forEach((color, index) => {
    color.cornerRadius = 999; // Make circular
    const size = 120;
    color.resize(size, size);
    color.x = padding + (index * (size + 20));
    color.y = frame.height - size - padding;
    color.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.25 },
      offset: { x: 4, y: 4 },
      radius: 8,
      visible: true,
      blendMode: 'NORMAL',
      spread: 0
    }];
  });

  // Typography with retro styling
  texts.forEach((text, index) => {
    text.x = padding + (index * (frame.width - padding * 2) / texts.length);
    text.y = frame.height - 200;
    text.fontSize = 32;
    text.textAlignHorizontal = 'CENTER';
    text.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.2, b: 0.1 } }]; // Vintage brown
    
    const fontName = text.characters.split('\n')[0];
    text.characters = `${fontName}\nAa Bb Cc`;
  });
}

function arrangeCustom(
  frame: FrameNode,
  images: FrameNode[],
  colors: RectangleNode[],
  texts: TextNode[]
) {
  const padding = 40;
  const allElements = [...images, ...colors, ...texts];

  // Random but contained layout
  allElements.forEach(element => {
    const maxX = frame.width - (element.width || 200) - padding;
    const maxY = frame.height - (element.height || 200) - padding;
    
    element.x = padding + (Math.random() * maxX);
    element.y = padding + (Math.random() * maxY);
    
    // Resize elements with some variation
    if ('resize' in element) {
      const baseSize = element.type === 'TEXT' ? 200 : 300;
      const variation = Math.random() * 100;
      const size = baseSize + variation;
      
      if (element.type === 'TEXT') {
        element.resize(size * 1.5, size / 2);
        element.fontSize = 24 + Math.random() * 12;
      } else {
        element.resize(size, element.type === 'FRAME' ? size * 0.75 : size);
      }
    }
  });
} 