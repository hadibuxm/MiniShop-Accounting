import client from './client';

export function listTransactions(params) {
  return client.get('/transactions', { params }).then((res) => res.data);
}

export function createTransaction(payload) {
  return client.post('/transactions', payload).then((res) => res.data.transaction);
}

export function updateTransaction(id, payload) {
  return client.put(`/transactions/${id}`, payload).then((res) => res.data.transaction);
}

export function deleteTransaction(id) {
  return client.delete(`/transactions/${id}`);
}
