import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a', borderRadius: '12px', fontSize: '14px' },
        success: { iconTheme: { primary: '#4f6ef7', secondary: '#fff' } },
      }} />
    </BrowserRouter>
  </React.StrictMode>,
)
