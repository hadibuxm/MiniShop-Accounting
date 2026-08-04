const { Op, fn, col } = require('sequelize');
const { Transaction, Category } = require('../models');

const EMPTY_STATE_MESSAGE = 'Is muddat mein koi record nahi mila / No records found for this period.';

async function categoryBreakdown(userId, startDate, endDate, type) {
  const rows = await Transaction.findAll({
    where: {
      user_id: userId,
      type,
      date: { [Op.gte]: startDate, [Op.lte]: endDate },
    },
    include: [{ model: Category, attributes: ['id', 'name'] }],
    attributes: ['category_id', [fn('SUM', col('Transaction.amount')), 'total']],
    group: ['category_id', 'Category.id', 'Category.name'],
    raw: true,
    nest: true,
  });

  return rows.map((row) => ({
    category_id: row.category_id,
    category_name: row.Category.name,
    total: parseFloat(row.total) || 0,
  }));
}

async function buildReport(userId, startDate, endDate) {
  const transactions = await Transaction.findAll({
    where: {
      user_id: userId,
      date: { [Op.gte]: startDate, [Op.lte]: endDate },
    },
    include: [{ model: Category }],
    order: [
      ['date', 'DESC'],
      ['created_at', 'DESC'],
    ],
  });

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const [income_breakdown, expense_breakdown] = await Promise.all([
    categoryBreakdown(userId, startDate, endDate, 'income'),
    categoryBreakdown(userId, startDate, endDate, 'expense'),
  ]);

  return {
    start_date: startDate,
    end_date: endDate,
    income,
    expense,
    net: income - expense,
    income_breakdown,
    expense_breakdown,
    transactions,
    is_empty: transactions.length === 0,
    empty_state_message: transactions.length === 0 ? EMPTY_STATE_MESSAGE : null,
  };
}

module.exports = { buildReport, EMPTY_STATE_MESSAGE };
