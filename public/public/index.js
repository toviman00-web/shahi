const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

// --- НАЛАШТУВАННЯ БОТА ---
// Забираємо токен зі Variables в Railway
const TOKEN = process.env.TELEGRAM_TOKEN;
// ВАЖЛИВО: Після першого деплою на Railway, ви отримаєте посилання на сайт.
// Вставте його сюди (наприклад, https://chess-bot-production.up.railway.app)
const WEBAPP_URL = process.env.WEBAPP_URL; 

const bot = new TelegramBot(TOKEN, { polling: true });

// Обробка команди /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (!WEBAPP_URL) {
        return bot.sendMessage(chatId, "Помилка: Не налаштовано посилання на Web App у Variables на Railway.");
    }

    // Відправляємо повідомлення з кнопкою для відкриття гри
    bot.sendMessage(chatId, "Привіт! Натисни кнопку нижче, щоб розпочати гру в шахи.", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Грати в шахи", web_app: { url: WEBAPP_URL } }]
            ]
        }
    });
});


// --- НАЛАШТУВАННЯ ВЕБ-СЕРВЕРА (EXPRESS) ---
const app = express();

// Показуємо Express, де лежать наші файли сайту (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Railway сам призначить порт, ми його просто забираємо
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
    console.log(`Веб-сайт доступний за локальною адресою: http://localhost:${PORT}`);
});
