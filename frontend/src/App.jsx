import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from "./components/ProtectedRoute.jsx"
import PublicRoute from "./components/PublicRoute.jsx"
import Login from "./components/Login.jsx"
import Register from "./components/Register.jsx"
import Dashboard from "./components/Dashboard.jsx"

// Componente auxiliar para decidir a raiz baseada no token
const RootRedirect = () => {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Raiz: Redireciona dependendo se tem token ou não */}
        <Route path="/" element={<RootRedirect />} />

        {/* Rotas Públicas blindadas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Rota Protegida */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Rota Coringa */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App