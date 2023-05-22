const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Settings = sequelize.define("Settings", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    theme: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "light",
    },
    language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "en",
    },
    prompt: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "You are a helpful assistant. You speak on French language.",
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "gpt-4",
    },
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.7,
    },
    maxLenght: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 256,
    },
    topP: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
    },
    frequencyPenalty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    presencePenalty: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
});

async function getSettings() {
    const settings = await Settings.findOne();
    if (settings) {
        return {
            id: settings.id,
            theme: settings.theme,
            language: settings.language,
            prompt: settings.prompt,
            model: settings.model,
            temperature: settings.temperature,
            maxLenght: settings.maxLenght,
            topP: settings.topP,
            frequencyPenalty: settings.frequencyPenalty,
            presencePenalty: settings.presencePenalty,
        };
    } else {
        settings = await Settings.create({
            id: 1,
            theme: "light",
            language: "en",
            prompt: "You are a helpful assistant. You speak on French language.",
            model: "gpt-4",
            temperature: 0.7,
            maxLenght: 256,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
        });
        return {
            id: settings.id,
            theme: settings.theme,
            language: settings.language,
            prompt: settings.prompt,
            model: settings.model,
            temperature: settings.temperature,
            maxLenght: settings.maxLenght,
            topP: settings.topP,
            frequencyPenalty: settings.frequencyPenalty,
            presencePenalty: settings.presencePenalty,
        };
    }
}

async function updateSettings(settings) {
    const { id, theme, language, prompt, model, temperature, maxLenght, topP, frequencyPenalty, presencePenalty } = settings;
    try {
        await Settings.update(
            { theme, language, prompt, model, temperature, maxLenght, topP, frequencyPenalty, presencePenalty },
            { where: { id } }
        );
    } catch (error) {
        console.error("Error updating settings :", error);
    }
}

(async () => {
    await sequelize.sync();
})();

module.exports = {
    Settings,
    getSettings,
    updateSettings,
};