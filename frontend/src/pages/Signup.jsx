import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorList from '../components/ErrorList.jsx'
import { errorMap, postJSON } from '../api.js'
import { useShop } from '../shop.jsx'

export default function Signup() {
  const { apply } = useShop()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password1: '', password2: '' })
  const [errors, setErrors] = useState({})

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setErrors({})
    try {
      apply(await postJSON('/api/signup/', form))
      navigate('/')
    } catch (err) {
      setErrors(errorMap(err))
    }
  }

  return (
    <section className="auth-box">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <ErrorList list={errors.__all__} />
        <ErrorList list={errors.username} />
        <p>
          <label htmlFor="username">Username:</label>
          <input id="username" type="text" autoComplete="username" value={form.username} onChange={set('username')} required />
        </p>
        <ErrorList list={errors.password1} />
        <p>
          <label htmlFor="password1">Password:</label>
          <input id="password1" type="password" autoComplete="new-password" value={form.password1} onChange={set('password1')} required />
        </p>
        <ErrorList list={errors.password2} />
        <p>
          <label htmlFor="password2">Password confirmation:</label>
          <input id="password2" type="password" autoComplete="new-password" value={form.password2} onChange={set('password2')} required />
          <span className="helptext">Enter the same password as before, for verification.</span>
        </p>
        <button type="submit" className="btn-cart">Sign up</button>
      </form>
      <p className="auth-alt">Already have an account? <Link to="/login"><u>Login</u></Link></p>
    </section>
  )
}
