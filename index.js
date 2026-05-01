const TelegramBot = require('node-telegram-bot-api');
const { Chess } = require('chess.js');

// Використовуємо змінну середовища з Railway
const TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });
const chess = new Chess();

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Привіт! Це шаховий бот у Telegram. Надішліть хід у форматі e2-e4.");
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text.startsWith('/')) return;

    const cleanMove = text.replace('-', '').toLowerCase();
    if (constMove.length !== 4) {
        return bot.sendMessage(chatId, "Будь ласка, вкажіть хід у правильному форматі, наприклад: e2-e4");
    }

    const source = constMove.substring(0, 2);
    const target = constMove.substring(2, 4);

    try {
        const move = chess.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move) {
            bot.sendMessage(chatId, `Хід успішний! Поточна позиція (FEN): \n${chess.fen()}`);
        }
    } catch (e) {
        bot.sendMessage(chatId, "Некоректний хід або хід не за правилами шахів!");
    }
});
