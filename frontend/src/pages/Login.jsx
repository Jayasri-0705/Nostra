import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ErrorList from '../components/ErrorList.jsx'
import { errorMap, postJSON } from '../api.js'
import { useShop } from '../shop.jsx'

export default function Login() {
  const { apply } = useShop()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  async function submit(e) {
    e.preventDefault()
    setErrors({})
    try {
      apply(await postJSON('/api/login/', { username, password }))
      const next = params.get('next')
      navigate(next && next.startsWith('/') ? next : '/')
    } catch (err) {
      setErrors(errorMap(err))
    }
  }

  return (
    <section className="auth-box">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <ErrorList list={errors.__all__} />
        <p>
          <label htmlFor="username">Username:</label>
          <input id="username" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </p>
        <p>
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </p>
        <button type="submit" className="btn-cart">Login</button>
      </form>
      <p className="auth-alt">New here? <Link to="/signup"><u>Create an account</u></Link></p>
    </section>
  )
}
