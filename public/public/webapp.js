// Повідомляємо Telegram, що Web App готовий
const tg = window.Telegram.WebApp;
tg.expand(); // Розгортаємо на весь екран

var board = null;
var game = new Chess(); // Створюємо новий екземпляр гри
var $status = $('#status');

// Функція, яка спрацьовує, коли користувач починає тягнути фігуру
function onDragStart (source, piece, position, orientation) {
  // Не дозволяємо тягнути фігури, якщо гра закінчена
  if (game.game_over()) return false;

  // Можна тягнути тільки фігури свого кольору (зараз білі)
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

// Функція, яка спрацьовує, коли користувач відпускає фігуру
function onDrop (source, target) {
  // Намагаємось зробити хід у логіці chess.js
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // Автоматично перетворюємо пішака на ферзя
  });

  // Якщо хід неможливий, повертаємо фігуру назад
  if (move === null) return 'snapback';

  updateStatus();
}

// Функція для оновлення підсвічування після ходу
function onSnapEnd () {
  board.position(game.fen());
}

// Функція оновлення статусу (чиє черга, шах, мат)
function updateStatus () {
  var status = '';

  var moveColor = 'Білих';
  if (game.turn() === 'b') {
    moveColor = 'Чорних';
  }

  // Перевірка на мат
  if (game.in_checkmate()) {
    status = 'Гра закінчена. Мат для ' + moveColor + '.';
  }
  // Перевірка на нічию (пат)
  else if (game.in_draw()) {
    status = 'Гра закінчена. Нічия.';
  }
  // Гра продовжується
  else {
    status = 'Хід ' + moveColor;
    // Перевірка на шах
    if (game.in_check()) {
      status += ' (Шах!)';
    }
  }

  $status.html(status);
}

// Налаштування дошки
var config = {
  draggable: true, // Дозволяємо перетягування
  position: 'start', // Початкова позиція
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  pieceTheme: 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/img/chesspieces/wikipedia/{piece}.png' // Звідки брати картинки фігур
};

// Ініціалізація дошки в DIV із id="myBoard"
board = Chessboard('myBoard', config);

updateStatus();
