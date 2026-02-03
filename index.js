const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

// 👇 Token tomado desde Render (NO ponerlo manual)
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });
const app = express();

let waitingPlayer = null;
let games = {};

// 🎮 Comando /play
bot.onText(/\/play/, (msg) => {
    const chatId = msg.chat.id;

    if (!waitingPlayer) {
        waitingPlayer = chatId;
        bot.sendMessage(chatId, "⏳ Esperando otro jugador...");
    } else {
        const player1 = waitingPlayer;
        const player2 = chatId;

        games[player1] = { opponent: player2 };
        games[player2] = { opponent: player1 };

        waitingPlayer = null;

        bot.sendMessage(player1, "🎮 Jugador encontrado! Escribí piedra, papel o tijera");
        bot.sendMessage(player2, "🎮 Jugador encontrado! Escribí piedra, papel o tijera");
    }
});

// 📩 Recibir jugadas
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.toLowerCase();

    if (!games[chatId]) return;

    const valid = ["piedra", "papel", "tijera"];
    if (!valid.includes(text)) return;

    games[chatId].choice = text;

    const opponent = games[chatId].opponent;

    if (games[opponent].choice) {

        const p1 = games[chatId].choice;
        const p2 = games[opponent].choice;

        let result = "";

        if (p1 === p2) result = "🤝 Empate";
        else if (
            (p1 === "piedra" && p2 === "tijera") ||
            (p1 === "papel" && p2 === "piedra") ||
            (p1 === "tijera" && p2 === "papel")
        ) result = "🏆 Ganaste";
        else result = "😢 Perdiste";

        bot.sendMessage(chatId, result);
        bot.sendMessage(opponent, result);

        delete games[chatId];
        delete games[opponent];
    }
});

// 🌐 Servidor Express
app.get("/", (req, res) => {
    res.send("Bot activo");
});

app.listen(3000, () => {
    console.log("Servidor iniciado");
});
