import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  function validate() {
    const nextErrors = {};
    if (!email) nextErrors.email = t('validation.required');
    if (!password) nextErrors.password = t('validation.required');
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      const code = err.response?.data?.code;
      setSubmitError(code ? t(`errors.${code}`) : t('errors.INTERNAL_ERROR'));
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>{t('auth.login_title')}</h1>

        <label>
          {t('auth.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>

        <label>
          {t('auth.password')}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        {submitError && <p className="form-error">{submitError}</p>}

        <button type="submit">{t('auth.login_button')}</button>

        <p>
          {t('auth.no_account')} <Link to="/register">{t('auth.go_to_register')}</Link>
        </p>
      </form>
    </div>
  );
}
