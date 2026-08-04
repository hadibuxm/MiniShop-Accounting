const { Category } = require('../models');
const DEFAULT_CATEGORIES = require('../constants/defaultCategories');

async function seedDefaultCategories(userId) {
  const rows = DEFAULT_CATEGORIES.map((c) => ({
    user_id: userId,
    name: c.name,
    type: c.type,
    is_default: true,
  }));
  return Category.bulkCreate(rows);
}

module.exports = { seedDefaultCategories };
