import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/global.css';

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('react-page');
  
  if (!container) {
    console.error('Failed to find the root element with id "react-page"');
    return;
  }

  const root = createRoot(container);
  
  // Wrap the app in Strict Mode for additional development checks
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
