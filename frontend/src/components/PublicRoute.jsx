import { Navigate } from 'react-router-dom'

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  // Se JÁ TEM token, barra e joga direto pra dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute