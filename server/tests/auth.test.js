const request = require('supertest');
const { setupTestApp, sequelize } = require('./helpers/setup');

let app;

beforeAll(async () => {
  app = await setupTestApp();
});

afterAll(async () => {
  await sequelize.close();
});

const validUser = {
  full_name: 'Ayesha Khan',
  shop_name: 'Khan General Store',
  email: 'ayesha@example.com',
  password: 'password1',
};

describe('Auth', () => {
  it('rejects registration with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'weak' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('registers a new owner and seeds default categories', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.headers['set-cookie']).toBeDefined();

    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: validUser.email, password: validUser.password });
    const categoriesRes = await agent.get('/api/categories');
    expect(categoriesRes.body.categories.length).toBe(8);
  });

  it('rejects duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rejects login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('logs in with valid credentials and returns /me', async () => {
    const agent = request.agent(app);
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(loginRes.status).toBe(200);

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(validUser.email);
  });

  it('blocks access to protected routes without auth', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  it('logs out and invalidates the session cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: validUser.email, password: validUser.password });
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(204);

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });
});
