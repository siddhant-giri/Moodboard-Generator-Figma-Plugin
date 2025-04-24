import React from 'react';
import logo from '../assets/logo.svg';
import '../styles/ui.css';

interface MoodboardState {
  keyword: string;
  template: 'minimalist' | 'luxury' | 'retro';
  imageSource: 'general' | 'ui-designs';
  uiCategory: 'mobile' | 'landing-page' | 'web-app';
  selectedImages: string[];
  colorPalette: string[];
  fonts: string[];
  isLoading: boolean;
  error: string | null;
  retroSettings?: {
    gridColumns: number;
    spacing: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  };
}

function App() {
  const [state, setState] = React.useState<MoodboardState>({
    keyword: '',
    template: 'minimalist',
    imageSource: 'general',
    uiCategory: 'mobile',
    selectedImages: [],
    colorPalette: [],
    fonts: [],
    isLoading: false,
    error: null,
    retroSettings: {
      gridColumns: 3,
      spacing: 24,
      backgroundColor: '#F5F3EE',
      borderColor: '#2B2B2B',
      borderWidth: 2
    }
  });

  React.useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const { type, message, data } = event.data.pluginMessage;
      switch (type) {
        case 'loading':
          setState(prev => ({ ...prev, isLoading: true, error: null }));
          break;
        case 'success':
          setState(prev => ({ ...prev, isLoading: false, error: null }));
          break;
        case 'error':
          setState(prev => ({ ...prev, isLoading: false, error: message }));
          break;
        case 'images-loaded':
          setState(prev => ({...prev, selectedImages: data.images}));
          break;
        case 'colors-generated':
          setState(prev => ({...prev, colorPalette: data.colors}));
          break;
        case 'fonts-suggested':
          setState(prev => ({...prev, fonts: data.fonts}));
          break;
        default:
          console.log(`Figma Says: ${message}`);
      }
    };
  }, []);

  const getSimplifiedErrorMessage = (error: string): string => {
    if (error.includes('Failed to load any images')) {
      return 'Unable to load images. Please try different keywords.';
    }
    if (error.includes('network') || error.includes('fetch')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    if (error.includes('font')) {
      return 'Font loading failed. Please try again.';
    }
    // Default simplified message
    return 'Something went wrong. Please try again.';
  };

  const generateRetroLayout = () => {
    if (state.template === 'retro') {
      parent.postMessage({
        pluginMessage: {
          type: 'generate-retro-moodboard',
          data: {
            keyword: state.keyword,
            imageSource: state.imageSource,
            uiCategory: state.uiCategory,
            layout: {
              title: {
                text: state.keyword.toUpperCase(),
                font: 'Helvetica',
                size: 48,
                color: '#2B2B2B'
              },
              grid: {
                columns: 3,
                spacing: 24,
                backgroundColor: '#F5F3EE'
              },
              elements: {
                borderWidth: 2,
                borderColor: '#2B2B2B',
                cornerRadius: 8
              }
            }
          }
        }
      }, '*');
    } else {
      onGenerateMoodboard();
    }
  };

  const onGenerateMoodboard = () => {
    if (!state.keyword) return;
    
    if (state.template === 'retro') {
      generateRetroLayout();
      return;
    }
    
    parent.postMessage({ 
      pluginMessage: { 
        type: 'generate-moodboard',
        data: {
          keyword: state.keyword,
          template: state.template,
          imageSource: state.imageSource,
          uiCategory: state.uiCategory
        }
      } 
    }, '*');
  };

  return (
    <div className="moodboard-container">
      {state.isLoading && (
        <div className="loading-indicator" role="status">
          Creating your moodboard...
        </div>
      )}

      {state.error && (
        <div className="error-message" role="alert">
          <p>⚠️ {getSimplifiedErrorMessage(state.error)}</p>
          <p className="error-hint">Try refreshing the plugin or using different keywords.</p>
        </div>
      )}
      
      <div className="header">
        <img src={logo} className="logo" alt="logo" />
        <h2>Moodboard Creator</h2>
      </div>
      
      <div className="content">
        <div className="input-group">
          <label htmlFor="keyword-input">Enter Keywords</label>
          <input
            id="keyword-input"
            type="text"
            placeholder="e.g., modern minimal, nature, urban"
            value={state.keyword}
            onChange={(e) => setState(prev => ({...prev, keyword: e.target.value}))}
            aria-label="Enter keywords for moodboard"
          />
        </div>

        <div className="input-group">
          <label htmlFor="source-select">Image Source</label>
          <select
            id="source-select"
            value={state.imageSource}
            onChange={(e) => setState(prev => ({
              ...prev,
              imageSource: e.target.value as 'general' | 'ui-designs'
            }))}
          >
            <option value="general">General Images</option>
            <option value="ui-designs">UI Designs</option>
          </select>
        </div>

        {state.imageSource === 'ui-designs' && (
          <div className="input-group">
            <label htmlFor="category-select">UI Category</label>
            <select
              id="category-select"
              value={state.uiCategory}
              onChange={(e) => setState(prev => ({
                ...prev,
                uiCategory: e.target.value as MoodboardState['uiCategory']
              }))}
            >
              <option value="mobile">📱 Mobile UI</option>
              <option value="landing-page">🎯 Landing Pages</option>
              <option value="web-app">💻 Web Applications</option>
            </select>
          </div>
        )}

        <div className="template-selector">
          <label htmlFor="template-select">Choose Style</label>
          <select 
            id="template-select"
            value={state.template}
            onChange={(e) => setState(prev => ({
              ...prev, 
              template: e.target.value as MoodboardState['template']
            }))}
            aria-label="Select moodboard template"
          >
            <option value="minimalist">✧ Minimalist</option>
            <option value="luxury">✦ Luxury</option>
            <option value="retro">◈ Retro</option>
          </select>
        </div>

        <div className="button-group">
          <button 
            className="primary"
            onClick={onGenerateMoodboard}
            disabled={!state.keyword || state.isLoading}
          >
            {state.isLoading ? '⟳ Creating...' : '✨ Create Moodboard'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
