const request = require('supertest');
const { setupTestApp, sequelize } = require('./helpers/setup');

let app;
let agent;

beforeAll(async () => {
  app = await setupTestApp();
  agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    full_name: 'Bilal Ahmed',
    shop_name: 'Bilal Traders',
    email: 'bilal@example.com',
    password: 'password1',
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Categories', () => {
  it('seeds default categories on registration', async () => {
    const res = await agent.get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBe(8);
    expect(res.body.categories.every((c) => c.is_default)).toBe(true);
  });

  it('creates a new custom category', async () => {
    const res = await agent.post('/api/categories').send({ name: 'Delivery Fees', type: 'income' });
    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe('Delivery Fees');
    expect(res.body.category.is_default).toBe(false);
  });

  it('rejects a duplicate category name for the same type', async () => {
    const res = await agent.post('/api/categories').send({ name: 'Delivery Fees', type: 'income' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CATEGORY_DUPLICATE');
  });

  it('allows the same name across different types', async () => {
    const res = await agent.post('/api/categories').send({ name: 'Delivery Fees', type: 'expense' });
    expect(res.status).toBe(201);
  });

  it('renames a category', async () => {
    const list = await agent.get('/api/categories');
    const target = list.body.categories.find((c) => c.name === 'Miscellaneous');
    const res = await agent.put(`/api/categories/${target.id}`).send({ name: 'Sundry Expenses' });
    expect(res.status).toBe(200);
    expect(res.body.category.name).toBe('Sundry Expenses');
  });

  it('deletes a category with no linked transactions', async () => {
    const list = await agent.get('/api/categories');
    const target = list.body.categories.find((c) => c.name === 'Delivery Fees' && c.type === 'income');
    const res = await agent.delete(`/api/categories/${target.id}`);
    expect(res.status).toBe(204);
  });

  it('blocks deleting a category that has linked transactions', async () => {
    const list = await agent.get('/api/categories');
    const category = list.body.categories.find((c) => c.name === 'Sales Revenue');

    const txnRes = await agent.post('/api/transactions').send({
      type: 'income',
      amount: 500,
      category_id: category.id,
      date: new Date().toISOString().slice(0, 10),
      payment_method: 'cash',
    });
    expect(txnRes.status).toBe(201);

    const deleteRes = await agent.delete(`/api/categories/${category.id}`);
    expect(deleteRes.status).toBe(409);
    expect(deleteRes.body.code).toBe('CATEGORY_HAS_TRANSACTIONS');
  });
});
