const request = require('supertest');
const { setupTestApp, sequelize } = require('./helpers/setup');

let app;
let agent;
let salesCategory;
let rentCategory;

beforeAll(async () => {
  app = await setupTestApp();
  agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    full_name: 'Sana Malik',
    shop_name: 'Sana Store',
    email: 'sana@example.com',
    password: 'password1',
  });
  const categories = await agent.get('/api/categories');
  salesCategory = categories.body.categories.find((c) => c.name === 'Sales Revenue');
  rentCategory = categories.body.categories.find((c) => c.name === 'Rent');
});

afterAll(async () => {
  await sequelize.close();
});

describe('Transactions', () => {
  it('rejects creation with missing required fields', async () => {
    const res = await agent.post('/api/transactions').send({ type: 'income' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a non-positive amount', async () => {
    const res = await agent.post('/api/transactions').send({
      type: 'income',
      amount: -10,
      category_id: salesCategory.id,
      date: '2026-01-01',
      payment_method: 'cash',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a future date', async () => {
    const futureDate = '2099-01-01';
    const res = await agent.post('/api/transactions').send({
      type: 'income',
      amount: 100,
      category_id: salesCategory.id,
      date: futureDate,
      payment_method: 'cash',
    });
    expect(res.status).toBe(400);
  });

  it('creates transactions and lists them sorted by date desc', async () => {
    await agent.post('/api/transactions').send({
      type: 'income',
      amount: 1000,
      category_id: salesCategory.id,
      date: '2026-01-05',
      payment_method: 'cash',
      description: 'Early sale',
    });
    await agent.post('/api/transactions').send({
      type: 'expense',
      amount: 200,
      category_id: rentCategory.id,
      date: '2026-01-10',
      payment_method: 'bank_transfer',
      description: 'Rent payment',
    });

    const res = await agent.get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body.transactions[0].date).toBe('2026-01-10');
    expect(res.body.transactions[1].date).toBe('2026-01-05');
  });

  it('filters transactions by type', async () => {
    const res = await agent.get('/api/transactions?type=expense');
    expect(res.status).toBe(200);
    expect(res.body.transactions.every((t) => t.type === 'expense')).toBe(true);
  });

  it('filters transactions by category and payment method', async () => {
    const res = await agent.get(`/api/transactions?category_id=${rentCategory.id}&payment_method=bank_transfer`);
    expect(res.status).toBe(200);
    expect(res.body.transactions.length).toBe(1);
  });

  it('paginates at 20 records per page', async () => {
    for (let i = 0; i < 25; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await agent.post('/api/transactions').send({
        type: 'income',
        amount: 50,
        category_id: salesCategory.id,
        date: '2026-02-01',
        payment_method: 'cash',
      });
    }

    const page1 = await agent.get('/api/transactions?page=1');
    expect(page1.body.transactions.length).toBe(20);
    expect(page1.body.pagination.total).toBeGreaterThanOrEqual(27);

    const page2 = await agent.get('/api/transactions?page=2');
    expect(page2.body.transactions.length).toBeGreaterThan(0);
  });

  it('edits an existing transaction', async () => {
    const list = await agent.get('/api/transactions?type=expense');
    const target = list.body.transactions[0];
    const res = await agent.put(`/api/transactions/${target.id}`).send({
      type: 'expense',
      amount: 300,
      category_id: rentCategory.id,
      date: '2026-01-10',
      payment_method: 'jazzcash',
      description: 'Updated rent payment',
    });
    expect(res.status).toBe(200);
    expect(parseFloat(res.body.transaction.amount)).toBe(300);
    expect(res.body.transaction.payment_method).toBe('jazzcash');
  });

  it('deletes a transaction with confirmation', async () => {
    const list = await agent.get('/api/transactions?type=expense');
    const target = list.body.transactions[0];
    const res = await agent.delete(`/api/transactions/${target.id}`);
    expect(res.status).toBe(204);

    const check = await agent.get(`/api/transactions?type=expense`);
    expect(check.body.transactions.find((t) => t.id === target.id)).toBeUndefined();
  });
});
