const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(express.json());

const TOKEN = process.env.TELEGRAM_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || "https://shahi-production.up.railway.app";

const bot = new TelegramBot(TOKEN);

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

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Привіт! Натисни кнопку нижче, щоб відкрити гру.", {
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
            * { box-sizing: border-box; }
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
            .screen {
                background: white;
                padding: 25px;
                border-radius: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                text-align: center;
                width: 100%;
                max-width: 420px;
                display: none;
            }
            .active-screen {
                display: block;
            }
            h1 {
                font-size: 1.6rem;
                margin-top: 0;
                color: #222;
                margin-bottom: 25px;
            }
            button {
                background-color: #388af6;
                color: white;
                border: none;
                padding: 14px 20px;
                font-size: 1.1rem;
                border-radius: 10px;
                cursor: pointer;
                width: 100%;
                margin-bottom: 12px;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            button:hover { background-color: #1a6ddb; }
            .secondary-btn {
                background-color: #e2e8f0;
                color: #334155;
            }
            .secondary-btn:hover { background-color: #cbd5e1; }
            #link-box {
                background: #f8fafc;
                padding: 12px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                margin: 15px 0;
                font-size: 1.05rem;
                font-weight: bold;
                color: #1e293b;
            }
            #myBoard {
                margin: 0 auto;
                width: 100%;
                max-width: 380px;
            }
            #status {
                margin-top: 15px;
                font-weight: bold;
                color: #475569;
                font-size: 1.1rem;
            }
            .difficulty-btn { background-color: #10b981; }
            .difficulty-btn:hover { background-color: #059669; }
        </style>
    </head>
    <body>

        <div id="screen-main" class="screen active-screen">
            <h1>Головне меню</h1>
            <button onclick="showScreen('screen-games')">🎮 Ігри</button>
        </div>

        <div id="screen-games" class="screen">
            <h1>Вибір гри</h1>
            <button onclick="showScreen('screen-chess-menu')">♟️ Шахмати</button>
            <button class="secondary-btn" onclick="showScreen('screen-main')">⬅️ Назад</button>
        </div>

        <div id="screen-chess-menu" class="screen">
            <h1>Шахмати</h1>
            <button onclick="startFriendGame()">👥 Гра з другом</button>
            <button class="difficulty-btn" onclick="showScreen('screen-bot-difficulty')">🤖 Грати проти бота</button>
            <button class="secondary-btn" onclick="showScreen('screen-games')">⬅️ Назад</button>
        </div>

        <div id="screen-friend-game" class="screen">
            <h1>Гра з другом</h1>
            <p>Надішліть це посилання другу. Як тільки він перейде, почнеться гра:</p>
            <div id="link-box">Завантаження...</div>
            <button onclick="copyLink()">📋 Скопіювати посилання</button>
            <button class="secondary-btn" onclick="showScreen('screen-chess-menu')">⬅️ Назад</button>
        </div>

        <div id="screen-bot-difficulty" class="screen">
            <h1>Виберіть рівень</h1>
            <button onclick="startGameWithBot('easy')">🟢 Легкий</button>
            <button class="secondary-btn" style="background-color: #f59e0b; color: white;" onclick="startGameWithBot('medium')">🟡 Середній</button>
            <button class="difficulty-btn" style="background-color: #ef4444;" onclick="startGameWithBot('hard')">🔴 Складний</button>
            <button class="secondary-btn" onclick="showScreen('screen-chess-menu')">⬅️ Назад</button>
        </div>

        <div id="screen-gameplay" class="screen">
            <h1 id="gameplay-title">Хід Білих</h1>
            <div id="myBoard"></div>
            <p id="status"></p>
            <button class="secondary-btn" style="margin-top: 20px;" onclick="showScreen('screen-main')">🏠 У головне меню</button>
        </div>

        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>
        <script src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"></script>
        
        <script>
            const tg = window.Telegram.WebApp;
            tg.expand();

            var board = null;
            var game = null;

            const urlParams = new URLSearchParams(window.location.search);
            const roomParam = urlParams.get('room');

            if (roomParam) {
                alert("Ви успішно приєдналися до гри! Починаємо.");
                startGameWithBot('medium');
            }

            function showScreen(screenId) {
                const screens = document.querySelectorAll('.screen');
                screens.forEach(s => s.classList.remove('active-screen'));
                document.getElementById(screenId).classList.add('active-screen');
            }

            function startFriendGame() {
                showScreen('screen-friend-game');
                const roomId = Math.random().toString(36).substring(2, 8);
                const gameLink = "https://shahi-production.up.railway.app/room/" + roomId;
                
                document.getElementById('link-box').innerText = gameLink;
            }

            function copyLink() {
                const linkText = document.getElementById('link-box').innerText;
                navigator.clipboard.writeText(linkText).then(() => {
                    alert('Посилання скопійовано!');
                });
            }

            function startGameWithBot(difficulty) {
                showScreen('screen-gameplay');
                document.getElementById('gameplay-title').innerText = 'Гра проти бота (' + difficulty + ')';
                
                // Даємо екрану час промалюватися перед викликом chessboard
                setTimeout(() => {
                    game = new Chess();
                    
                    // Вказуємо правильний шлях до піктограм фігур
                    var config = {
                        draggable: true,
                        position: 'start',
                        pieceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/img/chesspieces/wikipedia/{piece}.png',
                        onDragStart: onDragStart,
                        onDrop: onDrop,
                        onSnapEnd: onSnapEnd
                    };
                    
                    board = Chessboard('myBoard', config);
                    updateStatus();
                }, 200);
            }

            function onDragStart (source, piece, position, orientation) {
                if (game.game_over()) return false;
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
                document.getElementById('status').innerText = status;
            }
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
