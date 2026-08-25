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
  closeButton
  toastOptions={{
    duration: 3000,
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      fontWeight: 500,
      borderRadius: "10px",
      padding: "12px 16px",
    },
    success: {
      style: {
        background: "#0d9488",
        color: "#ffffff",
      },
    },
    error: {
      style: {
        background: "#12151C",
        color: "#ffffff",
      },
    },
  }}
/>
      </BrowserRouter>
   
  </StrictMode>,
)
