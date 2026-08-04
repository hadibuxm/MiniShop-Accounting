const sequelize = require('../config/database');
const User = require('./user');
const Category = require('./category');
const Transaction = require('./transaction');

User.hasMany(Category, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

Category.hasMany(Transaction, { foreignKey: 'category_id' });
Transaction.belongsTo(Category, { foreignKey: 'category_id' });

module.exports = {
  sequelize,
  User,
  Category,
  Transaction,
};
