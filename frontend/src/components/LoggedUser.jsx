import { useState, useEffect } from 'react'

const LoggedUser = () => {
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await fetch('http://localhost:3000/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao buscar usuário')
        }

        // Pega o nome direto do objeto retornado pelo banco
        setUserName(data.name)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchUser()
  }, [])

  if (error) return null
  if (!userName) return <span>Carregando...</span>

  return (
    <div>
      <span>Logado como: {userName}</span>
    </div>
  )
}

export default LoggedUser