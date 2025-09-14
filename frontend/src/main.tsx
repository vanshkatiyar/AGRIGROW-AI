import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

createRoot(document.getElementById("root")!).render(<App />);
