import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, UserPlus } from 'lucide-react'
import GlassPanel from '../components/GlassPanel'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'
import './Auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_FORM = {
  memberId: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  email: '',
  address: '',
}

function validate(form) {
  const errors = {}

  if (!form.memberId.trim()) {
    errors.memberId = '아이디를 입력해주세요.'
  } else if (form.memberId.trim().length < 4 || form.memberId.trim().length > 50) {
    errors.memberId = '아이디는 4자 이상 50자 이하로 입력해주세요.'
  }

  if (!form.password) {
    errors.password = '비밀번호를 입력해주세요.'
  } else if (form.password.length < 4 || form.password.length > 100) {
    errors.password = '비밀번호는 4자 이상 100자 이하로 입력해주세요.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = '비밀번호를 한 번 더 입력해주세요.'
  } else if (form.password && form.confirmPassword !== form.password) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
  }

  if (!form.name.trim()) {
    errors.name = '이름을 입력해주세요.'
  }

  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = '올바른 이메일 형식이 아닙니다.'
  }

  return errors
}

export default function Signup() {
  const { signup, isAuthenticated, initializing } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [initializing, isAuthenticated, navigate])

  function handleChange(field) {
    return (e) => {
      const value = e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
      if (formError) setFormError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errors = validate(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      const payload = {
        memberId: form.memberId.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      }
      const profile = await signup(payload)
      toast.success(`${profile?.name ?? '회원'}님, BookMarket 가입을 환영합니다.`)
      navigate('/', { replace: true })
    } catch (err) {
      if (err?.fieldErrors) {
        setFieldErrors((prev) => ({ ...prev, ...err.fieldErrors }))
      } else {
        setFormError(getErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <GlassPanel as="section" className="auth__card">
        <div className="auth__header">
          <span className="auth__eyebrow">
            <UserPlus size={14} strokeWidth={1.75} />
            BookMarket
          </span>
          <h1 className="auth__title">서재의 첫 페이지를 열어보세요</h1>
          <p className="auth__subtitle">몇 가지 정보만 입력하면 가입이 완료됩니다.</p>
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
            placeholder="4~50자의 아이디"
            value={form.memberId}
            onChange={handleChange('memberId')}
            error={fieldErrors.memberId}
          />

          <div className="auth__row">
            <Input
              label="비밀번호"
              type="password"
              autoComplete="new-password"
              placeholder="4~100자의 비밀번호"
              value={form.password}
              onChange={handleChange('password')}
              error={fieldErrors.password}
            />
            <Input
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 재입력"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={fieldErrors.confirmPassword}
            />
          </div>

          <Input
            label="이름"
            type="text"
            autoComplete="name"
            placeholder="이름을 입력하세요"
            value={form.name}
            onChange={handleChange('name')}
            error={fieldErrors.name}
          />

          <Input
            label={
              <>
                전화번호 <span className="auth__optional">(선택)</span>
              </>
            }
            type="tel"
            autoComplete="tel"
            placeholder="010-0000-0000"
            value={form.phone}
            onChange={handleChange('phone')}
            error={fieldErrors.phone}
          />

          <Input
            label={
              <>
                이메일 <span className="auth__optional">(선택)</span>
              </>
            }
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange('email')}
            error={fieldErrors.email}
          />

          <Input
            label={
              <>
                주소 <span className="auth__optional">(선택)</span>
              </>
            }
            type="text"
            autoComplete="street-address"
            placeholder="배송받을 주소를 입력하세요"
            value={form.address}
            onChange={handleChange('address')}
            error={fieldErrors.address}
          />

          <Button type="submit" variant="primary" size="lg" className="auth__submit" loading={submitting}>
            회원가입
          </Button>
        </form>

        <p className="auth__footer">
          이미 계정이 있으신가요? <Link className="auth__link" to="/login">로그인</Link>
        </p>
      </GlassPanel>
    </div>
  )
}
