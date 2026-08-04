import client from './client';

export function listCategories() {
  return client.get('/categories').then((res) => res.data.categories);
}

export function createCategory(payload) {
  return client.post('/categories', payload).then((res) => res.data.category);
}

export function updateCategory(id, payload) {
  return client.put(`/categories/${id}`, payload).then((res) => res.data.category);
}

export function deleteCategory(id) {
  return client.delete(`/categories/${id}`);
}
