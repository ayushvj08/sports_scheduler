"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      sports.hasMany(models.Session, {
        foreignKey: "sportId",
        onDelete: "cascade",
        hooks: true,
      });
      sports.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  sports.init(
    {
      name: DataTypes.STRING,
      numberOfPlayers: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "sports",
    }
  );
  return sports;
};
