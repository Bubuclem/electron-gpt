const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite3"
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion à la base de données établie avec succès.");
  } catch (error) {
    console.error("Impossible de se connecter à la base de données :", error);
  }
})();

module.exports = sequelize;