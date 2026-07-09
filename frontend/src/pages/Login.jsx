import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, LogIn } from 'lucide-react'
import GlassPanel from '../components/GlassPanel'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'
import './Auth.css'

export default function Login() {
  const { login, isAuthenticated, initializing } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [initializing, isAuthenticated, navigate])

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (formError) setFormError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      setFormError('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      const profile = await login(form.username.trim(), form.password)
      toast.success(`${profile?.name ?? '회원'}님, 환영합니다.`)
      const redirectTo = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search ?? ''}`
        : '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <GlassPanel as="section" className="auth__card">
        <div className="auth__header">
          <span className="auth__eyebrow">
            <LogIn size={14} strokeWidth={1.75} />
            BookMarket
          </span>
          <h1 className="auth__title">다시 만나서 반가워요</h1>
          <p className="auth__subtitle">계정에 로그인하고 서재를 이어가세요.</p>
        </div>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="auth__banner" role="alert">
              <AlertCircle size={16} strokeWidth={1.75} />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="아이디"
            type="text"
            autoComplete="username"
            placeholder="아이디를 입력하세요"
            value={form.username}
            onChange={handleChange('username')}
          />

          <Input
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={handleChange('password')}
          />

          <Button type="submit" variant="primary" size="lg" className="auth__submit" loading={submitting}>
            로그인
          </Button>
        </form>

        <p className="auth__footer">
          아직 계정이 없으신가요? <Link className="auth__link" to="/signup">회원가입</Link>
        </p>
      </GlassPanel>
    </div>
  )
}
