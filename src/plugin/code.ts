figma.showUI(__html__, { width: 450, height: 600 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-retro-moodboard') {
    try {
      const { keyword, layout } = msg.data;
      
      // Create the main frame
      const frame = figma.createFrame();
      frame.name = `Retro Moodboard - ${keyword}`;
      frame.resize(1200, 900);
      frame.fills = [{
        type: 'SOLID',
        color: hexToRgb(layout.grid.backgroundColor)
      }];

      // Create title
      const title = figma.createText();
      title.characters = layout.title.text;
      title.fontSize = layout.title.size;
      title.fills = [{ type: 'SOLID', color: hexToRgb(layout.title.color) }];
      
      // Load font
      await figma.loadFontAsync({ family: layout.title.font, style: "Regular" });
      title.fontName = { family: layout.title.font, style: "Regular" };
      
      // Position title
      title.x = (frame.width - title.width) / 2;
      title.y = 40;
      frame.appendChild(title);

      // Create grid layout
      const gridWidth = frame.width - (layout.grid.spacing * 2);
      const columnWidth = gridWidth / layout.grid.columns;
      
      // Create placeholder rectangles for images
      for (let i = 0; i < layout.grid.columns * 2; i++) {
        const rect = figma.createRectangle();
        rect.resize(columnWidth - layout.grid.spacing, columnWidth - layout.grid.spacing);
        
        rect.x = layout.grid.spacing + (i % layout.grid.columns) * (columnWidth);
        rect.y = layout.grid.spacing + title.height + 60 + Math.floor(i / layout.grid.columns) * (columnWidth);
        
        rect.cornerRadius = layout.elements.cornerRadius;
        rect.strokeWeight = layout.elements.borderWidth;
        rect.strokes = [{ type: 'SOLID', color: hexToRgb(layout.elements.borderColor) }];
        
        frame.appendChild(rect);
      }

      figma.viewport.scrollAndZoomIntoView([frame]);
      figma.notify("Retro moodboard created! 🎨");

    } catch (error) {
      figma.notify("Error creating moodboard", { error: true });
    }
  }
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
} 