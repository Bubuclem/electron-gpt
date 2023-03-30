const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite3"
});

(async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error("Impossible de se connecter à la base de données :", error);
  }
})();

module.exports = sequelize;