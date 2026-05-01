const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Роздаємо статичні файли з папки public
app.use(express.static(path.join(__dirname, 'public')));

const TOKEN = process.env.TELEGRAM_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || "https://shahi-production.up.railway.app";
const bot = new TelegramBot(TOKEN);

// Налаштування Webhook для Telegram
const url = "https://shahi-production.up.railway.app";
bot.setWebHook(`${url}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req, res) => {
    try {
        if (!req.body) {
            return res.sendStatus(400);
        }
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (e) {
        console.log("Помилка обробки запиту:", e.message);
        res.sendStatus(200);
    }
});

// Обробка команд бота
bot.onText(/\/start (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const payload = match[1];
    if (payload && payload.startsWith('room_')) {
        const roomId = payload.split('_')[1];
        const fullWebappUrl = `${WEBAPP_URL}?room=${roomId}`;
        
        bot.sendMessage(chatId, "Ви перейшли за запрошенням! Натисніть кнопку нижче, щоб приєднатися до гри.", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🎮 Приєднатися до гри", web_app: { url: fullWebappUrl } }]
                ]
            }
        });
    }
});

bot.onText(/\/start$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Привіт! Натисніть кнопку нижче, щоб відкрити шахову гру.", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🎮 Грати в шахи", web_app: { url: WEBAPP_URL } }]
            ]
        }
    });
});

// Логіка Socket.io для гри з другом в реальному часі
io.on('connection', (socket) => {
    console.log('Користувач підключений:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Користувач ${socket.id} приєднався до кімнати: ${roomId}`);
    });

    socket.on('make_move', (data) => {
        // Передаємо хід іншому гравцю в цій же кімнаті
        socket.to(data.roomId).emit('move_made', data.move);
    });

    socket.on('disconnect', () => {
        console.log('Користувач відключився:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
