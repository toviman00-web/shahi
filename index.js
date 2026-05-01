const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const TOKEN = process.env.TELEGRAM_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || "https://shahi-production.up.railway.app";

// Створюємо бота БЕЗ { polling: true }
const bot = new TelegramBot(TOKEN);

// Налаштовуємо Webhook
const url = "https://shahi-production.up.railway.app";
bot.setWebHook(`${url}/bot${TOKEN}`);

// Обробка вхідних повідомлень через Webhook
app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Обробка команди /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Привіт! Натисни кнопку нижче, щоб відкрити гру в шахи.", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🎮 Грати в шахи", web_app: { url: WEBAPP_URL } }]
            ]
        }
    });
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="uk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Telegram Шахи</title>
        <link rel="stylesheet" href="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css">
        <style>
            body {
                font-family: sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            #game-container {
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                text-align: center;
                width: 100%;
                max-width: 420px;
            }
            h1 {
                font-size: 1.5rem;
                margin-top: 0;
                color: #333;
            }
            #status {
                margin-top: 15px;
                font-weight: bold;
                color: #555;
            }
        </style>
    </head>
    <body>
        <div id="game-container">
            <h1>Твій хід</h1>
            <div id="myBoard" style="width: 100%; max-width: 400px; margin: 0 auto;"></div>
            <p id="status"></p>
        </div>

        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>
        <script src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"></script>
        
        <script>
            const tg = window.Telegram.WebApp;
            tg.expand();

            var board = null;
            var game = new Chess();
            var $status = $('#status');

            function onDragStart (source, piece, position, orientation) {
                if (game.game_over()) return false;
                if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                    return false;
                }
            }

            function onDrop (source, target) {
                var move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q'
                });
                if (move === null) return 'snapback';
                updateStatus();
            }

            function onSnapEnd () {
                board.position(game.fen());
            }

            function updateStatus () {
                var status = '';
                var moveColor = 'Білих';
                if (game.turn() === 'b') {
                    moveColor = 'Чорних';
                }

                if (game.in_checkmate()) {
                    status = 'Гра закінчена. Мат для ' + moveColor + '.';
                } else if (game.in_draw()) {
                    status = 'Гра закінчена. Нічия.';
                } else {
                    status = 'Хід ' + moveColor;
                    if (game.in_check()) {
                        status += ' (Шах!)';
                    }
                }
                $status.html(status);
            }

            var config = {
                draggable: true,
                position: 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd,
                pieceTheme: 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/img/chesspieces/wikipedia/{piece}.png'
            };

            board = Chessboard('myBoard', config);
            updateStatus();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
