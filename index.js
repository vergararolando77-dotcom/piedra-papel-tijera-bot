const TelegramBot = require('node-telegram-bot-api');

const token = '8342838326:AAH6aT7cIvu-kTUufSt5imi-68XYWp6_NDA';

const bot = new TelegramBot(token, { polling: true });

let waitingPlayer = null;
let games = {};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🎮 Bienvenido al Piedra Papel Tijera\n\nUsá /jugar para buscar rival");
});

bot.onText(/\/jugar/, (msg) => {

    const userId = msg.from.id;

    if (!waitingPlayer) {
        waitingPlayer = userId;
        bot.sendMessage(msg.chat.id, "⏳ Esperando rival...");
    } else {

        const player1 = waitingPlayer;
        const player2 = userId;

        waitingPlayer = null;

        games[player1] = { rival: player2 };
        games[player2] = { rival: player1 };

        sendGameButtons(player1);
        sendGameButtons(player2);
    }
});

function sendGameButtons(userId) {
    bot.sendMessage(userId, "Elegí tu jugada", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🪨 Piedra", callback_data: "piedra" }],
                [{ text: "📄 Papel", callback_data: "papel" }],
                [{ text: "✂️ Tijera", callback_data: "tijera" }]
            ]
        }
    });
}

bot.on("callback_query", (query) => {

    const userId = query.from.id;
    const move = query.data;

    if (!games[userId]) return;

    games[userId].move = move;

    const rivalId = games[userId].rival;

    if (!games[rivalId].move) {
        bot.sendMessage(userId, "✅ Jugada enviada, esperando rival...");
        return;
    }

    const move1 = games[userId].move;
    const move2 = games[rivalId].move;

    const result = getWinner(move1, move2);

    bot.sendMessage(userId, `Resultado: ${result}`);
    bot.sendMessage(rivalId, `Resultado: ${result}`);

    delete games[userId];
    delete games[rivalId];
});

function getWinner(a, b) {

    if (a === b) return "Empate";

    if (
        (a === "piedra" && b === "tijera") ||
        (a === "papel" && b === "piedra") ||
        (a === "tijera" && b === "papel")
    ) return "Ganaste 🎉";

    return "Perdiste 😢";
    }
