import { fetchImages } from './utils/images';
import { generateColorPalette } from './utils/colors';
import { createMoodboardFrame, arrangeElements, LayoutTemplate } from './utils/layout';
import { getRandomFonts } from './utils/fontStyles';
import { fetchGoogleImages } from './utils/googleImages';

// Show UI with a proper size for the moodboard creator
figma.showUI(__html__, { width: 400, height: 600 });

interface GenerateMoodboardData {
  keyword: string;
  template: LayoutTemplate;
  imageSource: 'general' | 'ui-designs';
  uiCategory: 'mobile' | 'landing-page' | 'web-app';
}

figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'generate-moodboard':
        await handleGenerateMoodboard(msg.data as GenerateMoodboardData);
        break;
        
      case 'generate-retro-moodboard':
        await handleGenerateRetroMoodboard(msg.data as GenerateMoodboardData);
        break;
        
      case 'export-moodboard':
        await handleExport(msg.format as 'pdf' | 'png');
        break;
        
      case 'cancel':
        figma.closePlugin();
        break;
    }
  } catch (error) {
    console.error('Plugin error:', error);
    let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Enhance error message with specific context
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorMessage = 'Network error: Please check your internet connection';
    } else if (errorMessage.includes('font')) {
      errorMessage = 'Font loading error: Unable to load required fonts';
    }

    figma.ui.postMessage({
      type: 'error',
      message: errorMessage
    });
  }
};

async function handleGenerateMoodboard({ 
  keyword, 
  template, 
  imageSource, 
  uiCategory 
}: GenerateMoodboardData) {
  // Show loading state
  figma.ui.postMessage({ type: 'loading', message: 'Generating moodboard...' });

  try {
    // Create main moodboard frame
    const frame = createMoodboardFrame(template);
    
    // Fetch images based on selected source
    const images = imageSource === 'ui-designs' 
      ? await fetchGoogleImages(keyword, uiCategory)
      : await fetchImages(keyword);
    
    // Notify UI about loaded images
    figma.ui.postMessage({
      type: 'images-loaded',
      data: { images }
    });

    // Create image frames
    const imageNodes = await Promise.all(
      images.map(async (imageUrl) => {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const arrayBuffer = await response.arrayBuffer();
          const imageData = new Uint8Array(arrayBuffer);
          const image = await figma.createImage(imageData);
          
          const imageFrame = figma.createFrame();
          imageFrame.name = 'Moodboard Image';
          imageFrame.fills = [{
            type: 'IMAGE',
            imageHash: image.hash,
            scaleMode: 'FILL'
          }];
          
          return imageFrame;
        } catch (error) {
          console.error('Error creating image frame:', error);
          return null;
        }
      })
    );

    // Filter out failed images
    const validImageNodes = imageNodes.filter((node): node is FrameNode => node !== null);
    
    if (validImageNodes.length === 0) {
      throw new Error('Failed to load any images. Please try again.');
    }

    // Generate and create color swatches
    const colors = await generateColorPalette(template);
    const colorNodes = colors.map(color => {
      const rect = figma.createRectangle();
      rect.name = 'Color Swatch';
      rect.fills = [{ type: 'SOLID', color }];
      return rect;
    });

    // Create color styles
    colors.forEach((color, index) => {
      const colorStyle = figma.createPaintStyle();
      colorStyle.name = `Moodboard Color ${index + 1}`;
      colorStyle.paints = [{ type: 'SOLID', color }];
    });

    // Generate random fonts based on template with fallback handling
    const fonts = await getRandomFonts(template);
    
    // Notify UI about suggested fonts
    figma.ui.postMessage({
      type: 'fonts-suggested',
      data: { fonts }
    });
    
    const textNodes = await Promise.all(
      fonts.map(async (font) => {
        const text = figma.createText();
        text.name = `Font Sample - ${font}`;
        
        try {
          await figma.loadFontAsync({ family: font, style: 'Regular' });
          text.fontName = { family: font, style: 'Regular' };
        } catch (error) {
          // Fallback to Arial if font loading fails
          await figma.loadFontAsync({ family: 'Arial', style: 'Regular' });
          text.fontName = { family: 'Arial', style: 'Regular' };
          console.warn(`Failed to load font ${font}, falling back to Arial`);
        }
        
        text.characters = `${font}\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz`;
        text.fontSize = 24;

        // Create text style
        const textStyle = figma.createTextStyle();
        textStyle.name = `Moodboard Font - ${font}`;
        textStyle.fontName = text.fontName;
        textStyle.fontSize = text.fontSize;

        return text;
      })
    );

    // Arrange all elements
    const allNodes = [...validImageNodes, ...colorNodes, ...textNodes];
    arrangeElements(frame, allNodes, template);

    // Add to page and focus
    figma.currentPage.appendChild(frame);
    figma.viewport.scrollAndZoomIntoView([frame]);

    // Notify success
    figma.ui.postMessage({
      type: 'success',
      message: 'Moodboard generated successfully!'
    });

  } catch (error) {
    console.error('Error in handleGenerateMoodboard:', error);
    throw error;
  }
}

async function handleGenerateRetroMoodboard({
  keyword,
  imageSource,
  uiCategory
}: GenerateMoodboardData) {
  // Show loading state
  figma.ui.postMessage({ type: 'loading', message: 'Generating retro moodboard...' });

  try {
    // Create main moodboard frame with retro style
    const frame = createMoodboardFrame('retro');

    // Fetch images based on selected source
    const images = imageSource === 'ui-designs'
      ? await fetchGoogleImages(keyword, uiCategory)
      : await fetchImages(keyword);

    // Notify UI about loaded images
    figma.ui.postMessage({
      type: 'images-loaded',
      data: { images }
    });

    // Create image frames
    const imageNodes = await Promise.all(
      images.map(async (imageUrl) => {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Failed to fetch image');

          const arrayBuffer = await response.arrayBuffer();
          const imageData = new Uint8Array(arrayBuffer);
          const image = await figma.createImage(imageData);

          const imageFrame = figma.createFrame();
          imageFrame.name = 'Retro Moodboard Image';
          imageFrame.fills = [{
            type: 'IMAGE',
            imageHash: image.hash,
            scaleMode: 'FILL'
          }];

          return imageFrame;
        } catch (error) {
          console.error('Error creating image frame:', error);
          return null;
        }
      })
    );

    // Filter out failed images
    const validImageNodes = imageNodes.filter((node): node is FrameNode => node !== null);

    if (validImageNodes.length === 0) {
      throw new Error('Failed to load any images. Please try again.');
    }

    // Generate and create color swatches
    const colors = await generateColorPalette('retro');
    const colorNodes = colors.map(color => {
      const rect = figma.createRectangle();
      rect.name = 'Retro Color Swatch';
      rect.fills = [{ type: 'SOLID', color }];
      return rect;
    });

    // Create color styles
    colors.forEach((color, index) => {
      const colorStyle = figma.createPaintStyle();
      colorStyle.name = `Retro Moodboard Color ${index + 1}`;
      colorStyle.paints = [{ type: 'SOLID', color }];
    });

    // Generate random fonts based on retro style with fallback handling
    const fonts = await getRandomFonts('retro');

    // Notify UI about suggested fonts
    figma.ui.postMessage({
      type: 'fonts-suggested',
      data: { fonts }
    });

    const textNodes = await Promise.all(
      fonts.map(async (font) => {
        const text = figma.createText();
        text.name = `Retro Font Sample - ${font}`;

        try {
          await figma.loadFontAsync({ family: font, style: 'Regular' });
          text.fontName = { family: font, style: 'Regular' };
        } catch (error) {
          // Fallback to Arial if font loading fails
          await figma.loadFontAsync({ family: 'Arial', style: 'Regular' });
          text.fontName = { family: 'Arial', style: 'Regular' };
          console.warn(`Failed to load font ${font}, falling back to Arial`);
        }

        text.characters = `${font}\nABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz`;
        text.fontSize = 24;

        // Create text style
        const textStyle = figma.createTextStyle();
        textStyle.name = `Retro Moodboard Font - ${font}`;
        textStyle.fontName = text.fontName;
        textStyle.fontSize = text.fontSize;

        return text;
      })
    );

    // Arrange all elements
    const allNodes = [...validImageNodes, ...colorNodes, ...textNodes];
    arrangeElements(frame, allNodes, 'retro');

    // Add to page and focus
    figma.currentPage.appendChild(frame);
    figma.viewport.scrollAndZoomIntoView([frame]);

    // Notify success
    figma.ui.postMessage({
      type: 'success',
      message: 'Retro moodboard generated successfully!'
    });

  } catch (error) {
    console.error('Error in handleGenerateRetroMoodboard:', error);
    throw error;
  }
}

async function handleExport(format: 'pdf' | 'png') {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    throw new Error('Please select a moodboard to export');
  }

  const frame = selection[0];
  if (frame.type !== 'FRAME') {
    throw new Error('Please select a moodboard frame to export');
  }
  
  if (format === 'png') {
    const bytes = await frame.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 }
    });
    
    figma.ui.postMessage({
      type: 'export-ready',
      data: { bytes, format }
    });
  } else {
    const bytes = await frame.exportAsync({
      format: 'PDF'
    });
    
    figma.ui.postMessage({
      type: 'export-ready',
      data: { bytes, format }
    });
  }
}
