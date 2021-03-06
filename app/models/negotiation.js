'use strict';
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class negotiation extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: 'user_id_buyer', as : 'user_buyer' })
      this.belongsTo(models.product, { foreignKey: 'product_id' } )
    }
  }
  negotiation.init({
    user_id_buyer: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING, // 1. Pending 2. Accepted 3. Rejected 4.Done
      allowNull: false,
      validate: {
        is: /^(pending|accepted|rejected|done)$/
      }
    }
  }, {
    sequelize,
    tableName: 'negotiations',
    modelName: 'negotiation',
    underscored: true,
  });
  return negotiation;
};