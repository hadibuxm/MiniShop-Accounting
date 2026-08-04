import { useTranslation } from 'react-i18next';

export default function DeleteConfirmDialog({ onCancel, onConfirm }) {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal modal--small">
        <h2>{t('transactions.delete_confirm_title')}</h2>
        <p>{t('transactions.delete_confirm_message')}</p>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
