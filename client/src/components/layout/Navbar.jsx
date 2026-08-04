import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">{t('app_name')}</div>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.dashboard')}
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.transactions')}
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.categories')}
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.reports')}
        </NavLink>
      </div>
      <div className="navbar-actions">
        {user && <span className="navbar-shop">{user.shop_name}</span>}
        <button type="button" className="lang-toggle" onClick={toggleLanguage} aria-label="toggle-language">
          {language === 'en' ? 'اردو' : 'EN'}
        </button>
        <button type="button" onClick={handleLogout}>
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  );
}
