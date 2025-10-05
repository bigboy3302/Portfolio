import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Contact from './pages/ContactTerminal.jsx'
import Skills3D from "./pages/Skills3D.jsx";
import './styles/index.css';
import { element } from 'three/tsl'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
      { index: true, element: <Home /> },
       { path: 'skill', element: <Skills3D />},
      { path: 'projects', element: <Projects /> },
      { path: 'contact', element: <Contact /> },
    ]}
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
