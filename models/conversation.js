const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("../database");

const Conversation = sequelize.define("Conversation", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    messages: {
        type: DataTypes.JSON,
        allowNull: false
    }
});

async function updateConversation(id, messageHistory) {
    try {
        await Conversation.update(
            { messages: JSON.stringify(messageHistory) },
            { where: { id } }
        );
    } catch (error) {
        console.error("Error updating conversation :", error);
    }
}

async function getMessageHistoryOrCreateMessage(conversationId, prompt) {
    const [conversation, created] = await Conversation.findOrCreate({
        where: { id: conversationId },
        defaults: {
            id: conversationId,
            messages: JSON.stringify([{ role: 'user', content: prompt }])
        }
    });

    if (!created) {
        messageHistory = JSON.parse(conversation.messages);
        messageHistory.push({ role: 'user', content: prompt });
        await conversation.update({ messages: JSON.stringify(messageHistory) });
    } else {
        messageHistory = [{ role: 'user', content: prompt }];
    }

    return { messageHistory, conversationId };
}

async function getConversations() {
    const conversations = await Conversation.findAll();
    return conversations.map((conversation) => {
        return {
            id: conversation.id,
            messages: conversation.messages,
        };
    });
}

async function getConversationFromID(id) {
    const conversation = await Conversation.findOne({ where: { id } });
    if (conversation) {
        return {
            id: conversation.id,
            messages: conversation.messages,
        };
    }
    return null;
}

async function deleteConversation(id) {
    try {
        const deletedRowCount = await Conversation.destroy({
            where: {
                id: id
            }
        });

        return true;
    } catch (error) {
        console.error("Error deleting conversation :", error);
        return false;
    }
}

async function deleteAllConversations() {
    try {
        const deletedRowCount = await Conversation.destroy({
            where: {},
            truncate: true
        });
    } catch (error) {
        console.error("Error deleting all conversations :", error);
    }
}

(async () => {
    await sequelize.sync();
})();

module.exports = { getMessageHistoryOrCreateMessage, updateConversation, getConversations, getConversationFromID, deleteConversation, deleteAllConversations };