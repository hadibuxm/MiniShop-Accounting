const { Op, fn, col } = require('sequelize');
const { Transaction, Category } = require('../models');

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthBoundsISO() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

async function sumByType(userId, startDate, endDate) {
  const rows = await Transaction.findAll({
    where: {
      user_id: userId,
      date: { [Op.gte]: startDate, [Op.lte]: endDate },
    },
    attributes: ['type', [fn('SUM', col('amount')), 'total']],
    group: ['type'],
    raw: true,
  });

  const totals = { income: 0, expense: 0 };
  rows.forEach((row) => {
    totals[row.type] = parseFloat(row.total) || 0;
  });
  return totals;
}

async function summary(req, res, next) {
  try {
    const today = todayISO();
    const { start: monthStart, end: monthEnd } = monthBoundsISO();

    const [todayTotals, monthTotals, recent] = await Promise.all([
      sumByType(req.user.id, today, today),
      sumByType(req.user.id, monthStart, monthEnd),
      Transaction.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Category }],
        order: [
          ['date', 'DESC'],
          ['created_at', 'DESC'],
        ],
        limit: 5,
      }),
    ]);

    return res.json({
      today: {
        income: todayTotals.income,
        expense: todayTotals.expense,
        net: todayTotals.income - todayTotals.expense,
      },
      month: {
        income: monthTotals.income,
        expense: monthTotals.expense,
        net: monthTotals.income - monthTotals.expense,
      },
      recent_transactions: recent,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { summary };
