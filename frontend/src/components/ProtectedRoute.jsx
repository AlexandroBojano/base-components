import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  // Se NÃO TEM token, barra e manda pro login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute