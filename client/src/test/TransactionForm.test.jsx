import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '../i18n';
import i18n from '../i18n';
import TransactionForm from '../components/transactions/TransactionForm';

vi.mock('../api/categories', () => ({
  listCategories: vi.fn().mockResolvedValue([
    { id: 'cat-1', name: 'Sales Revenue', type: 'income' },
    { id: 'cat-2', name: 'Rent', type: 'expense' },
  ]),
}));

vi.mock('../api/transactions', () => ({
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
}));

describe('TransactionForm validation', () => {
  it('shows bilingual inline validation errors when required fields are empty', async () => {
    await act(async () => i18n.changeLanguage('en'));
    const { rerender } = render(<TransactionForm onClose={() => {}} onSaved={() => {}} />);
    await screen.findByRole('option', { name: 'Sales Revenue' });

    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0);
    });

    await act(async () => i18n.changeLanguage('ur'));
    rerender(<TransactionForm onClose={() => {}} onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'محفوظ کریں' }));

    await waitFor(() => {
      expect(screen.getAllByText('یہ خانہ پر کرنا ضروری ہے').length).toBeGreaterThan(0);
    });

    await act(async () => i18n.changeLanguage('en'));
  });

  it('rejects a non-positive amount', async () => {
    render(<TransactionForm onClose={() => {}} onSaved={() => {}} />);
    await screen.findByRole('option', { name: 'Sales Revenue' });

    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Amount must be a positive number')).toBeInTheDocument();
    });
  });
});
