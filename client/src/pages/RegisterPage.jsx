import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: '', shop_name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.full_name.trim()) nextErrors.full_name = t('validation.required');
    if (!form.shop_name.trim()) nextErrors.shop_name = t('validation.required');
    if (!form.email.trim()) {
      nextErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = t('validation.invalid_email');
    }
    if (form.password.length < 8) {
      nextErrors.password = t('validation.password_min');
    } else if (!/\d/.test(form.password)) {
      nextErrors.password = t('validation.password_number');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const code = err.response?.data?.code;
      setSubmitError(code ? t(`errors.${code}`) : t('errors.INTERNAL_ERROR'));
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>{t('auth.register_title')}</h1>

        <label>
          {t('auth.full_name')}
          <input type="text" value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} />
          {errors.full_name && <span className="field-error">{errors.full_name}</span>}
        </label>

        <label>
          {t('auth.shop_name')}
          <input type="text" value={form.shop_name} onChange={(e) => updateField('shop_name', e.target.value)} />
          {errors.shop_name && <span className="field-error">{errors.shop_name}</span>}
        </label>

        <label>
          {t('auth.email')}
          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>

        <label>
          {t('auth.password')}
          <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        {submitError && <p className="form-error">{submitError}</p>}

        <button type="submit">{t('auth.register_button')}</button>

        <p>
          {t('auth.have_account')} <Link to="/login">{t('auth.go_to_login')}</Link>
        </p>
      </form>
    </div>
  );
}
