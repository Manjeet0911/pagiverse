import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Enforce clearing any remaining dynamic legacy style sheets on live production runtime
if (typeof document !== 'undefined') {
  const legacyStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
  legacyStyles.forEach(style => {
    if (style.innerHTML.includes('pagiverse-app-root') || style.innerHTML.includes('flashcard-item')) {
      style.remove();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)