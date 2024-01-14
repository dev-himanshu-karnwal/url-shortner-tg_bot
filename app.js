const { Telegraf } = require("telegraf");
const axios = require("axios");
const { isURL } = require("validator");
const server = require("http").createServer();
require("dotenv").config();

// create bot using token
const bot = new Telegraf(process.env.TOKEN);

const sendStartButton = (ctx, msg) => {
  ctx.telegram.sendMessage(ctx.chat.id, msg, {
    reply_markup: {
      inline_keyboard: [[{ text: "Shorten URL", callback_data: "shorten" }]],
    },
  });
};

bot.action("shorten", (ctx) => {
  ctx.deleteMessage();
  ctx.reply("Send a long URL you want to shorten");
});

// listen and replies to -> "/start"
bot.start((ctx) => {
  sendStartButton(
    ctx,
    "Pass some long URL to generate an alternative short URL"
  );
});

// listen and replies to -> "/help"
bot.help((ctx) => {
  sendStartButton(
    ctx,
    `Generate short URLs as a concise and efficient alternative to lengthy and unwieldy links. Simply send a valid long URL you wish to shorten and receive a new short URL, which is only 6 characters in length.`
  );
});

// listen and replies to any message
bot.on("message", async (ctx) => {
  const msg = ctx.message.text;
  if (!isURL(msg)) return ctx.reply("Enter a valid URL");

  try {
    const result = await axios.post("https://gotiny.cc/api", { input: msg });
    const data = result.data;

    ctx.telegram.sendMessage(
      ctx.chat.id,
      `Here is your short url:\n\ngotiny.cc/${data[0].code}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Redirect via new URL",
                url: `gotiny.cc/${data[0].code}`,
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    ctx.reply("Error creating new URL");
  }
});

// launches bot
bot.launch();

server.listen();
