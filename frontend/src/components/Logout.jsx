import { useNavigate } from 'react-router-dom'

const Logout = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <button onClick={handleLogout}>
      Sair
    </button>
  )
}

export default Logout