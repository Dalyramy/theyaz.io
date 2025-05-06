import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeProvider'

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found! Make sure there is a <div id='root'> in your HTML.");
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
