const request = require('supertest');
const { setupTestApp, sequelize } = require('./helpers/setup');

let app;
let agent;
let salesCategory;
let rentCategory;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

beforeAll(async () => {
  app = await setupTestApp();
  agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    full_name: 'Imran Qureshi',
    shop_name: 'Imran Mart',
    email: 'imran@example.com',
    password: 'password1',
  });
  const categories = await agent.get('/api/categories');
  salesCategory = categories.body.categories.find((c) => c.name === 'Sales Revenue');
  rentCategory = categories.body.categories.find((c) => c.name === 'Rent');

  await agent.post('/api/transactions').send({
    type: 'income',
    amount: 2000,
    category_id: salesCategory.id,
    date: todayISO(),
    payment_method: 'cash',
  });
  await agent.post('/api/transactions').send({
    type: 'expense',
    amount: 500,
    category_id: rentCategory.id,
    date: todayISO(),
    payment_method: 'cash',
  });
  for (let i = 1; i <= 6; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await agent.post('/api/transactions').send({
      type: 'income',
      amount: 100,
      category_id: salesCategory.id,
      date: todayISO(),
      payment_method: 'cash',
      description: `txn-${i}`,
    });
  }
});

afterAll(async () => {
  await sequelize.close();
});

describe('Dashboard', () => {
  it('returns today and month totals with net balance', async () => {
    const res = await agent.get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.today.income).toBe(2600);
    expect(res.body.today.expense).toBe(500);
    expect(res.body.today.net).toBe(2100);
    expect(res.body.month.income).toBe(2600);
    expect(res.body.month.net).toBe(2100);
  });

  it('returns the 5 most recent transactions', async () => {
    const res = await agent.get('/api/dashboard/summary');
    expect(res.body.recent_transactions.length).toBe(5);
  });
});
