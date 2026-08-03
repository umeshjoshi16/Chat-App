import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import { Toaster } from "sonner";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
       <App />
       <Toaster
  position="top-right"
  richColors
  closeButton
  expand
  duration={3000}
/>
      </BrowserRouter>
   
  </StrictMode>,
)
