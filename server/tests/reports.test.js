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
    full_name: 'Farah Siddiqui',
    shop_name: 'Farah Boutique',
    email: 'farah@example.com',
    password: 'password1',
  });
  const categories = await agent.get('/api/categories');
  salesCategory = categories.body.categories.find((c) => c.name === 'Sales Revenue');
  rentCategory = categories.body.categories.find((c) => c.name === 'Rent');

  await agent.post('/api/transactions').send({
    type: 'income',
    amount: 3000,
    category_id: salesCategory.id,
    date: '2026-03-15',
    payment_method: 'cash',
  });
  await agent.post('/api/transactions').send({
    type: 'expense',
    amount: 1000,
    category_id: rentCategory.id,
    date: '2026-03-15',
    payment_method: 'bank_transfer',
  });
  await agent.post('/api/transactions').send({
    type: 'income',
    amount: 500,
    category_id: salesCategory.id,
    date: '2026-03-20',
    payment_method: 'easypaisa',
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Reports', () => {
  it('returns a daily report with totals and transactions', async () => {
    const res = await agent.get('/api/reports/daily?date=2026-03-15');
    expect(res.status).toBe(200);
    expect(res.body.report.income).toBe(3000);
    expect(res.body.report.expense).toBe(1000);
    expect(res.body.report.net).toBe(2000);
    expect(res.body.report.transactions.length).toBe(2);
  });

  it('returns a monthly report with category-wise breakdowns', async () => {
    const res = await agent.get('/api/reports/monthly?year=2026&month=3');
    expect(res.status).toBe(200);
    expect(res.body.report.income).toBe(3500);
    expect(res.body.report.expense).toBe(1000);
    expect(res.body.report.net).toBe(2500);
    expect(res.body.report.income_breakdown).toEqual([
      { category_id: salesCategory.id, category_name: 'Sales Revenue', total: 3500 },
    ]);
    expect(res.body.report.expense_breakdown).toEqual([
      { category_id: rentCategory.id, category_name: 'Rent', total: 1000 },
    ]);
  });

  it('returns a custom range report', async () => {
    const res = await agent.get('/api/reports/range?start_date=2026-03-01&end_date=2026-03-31');
    expect(res.status).toBe(200);
    expect(res.body.report.income).toBe(3500);
    expect(res.body.report.net).toBe(2500);
  });

  it('rejects a range where end date is before start date', async () => {
    const res = await agent.get('/api/reports/range?start_date=2026-03-31&end_date=2026-03-01');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_DATE_RANGE');
  });

  it('shows a bilingual empty-state message for periods with no transactions', async () => {
    const res = await agent.get('/api/reports/daily?date=2026-01-01');
    expect(res.status).toBe(200);
    expect(res.body.report.is_empty).toBe(true);
    expect(res.body.report.empty_state_message).toBe(
      'Is muddat mein koi record nahi mila / No records found for this period.'
    );
  });

  it('exports a PDF for the monthly report', async () => {
    const res = await agent.get('/api/reports/monthly/pdf?year=2026&month=3');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });
});
