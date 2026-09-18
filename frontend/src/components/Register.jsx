import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar usuário')
      }

      // Se deu certo, joga o usuário para a tela de login
      navigate('/login', { replace: true })

    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Cadastro</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleRegister}>
        <div>
          <label>Nome:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>E-mail:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label>Senha:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit">Cadastrar</button>
      </form>

      <p>
        Já tem uma conta? <Link to="/login">Faça login</Link>
      </p>
    </div>
  )
}

export default Register