import { Bot, Context, Keyboard } from "grammy";
import { isAdmin } from "./db/admin.ts";
import { getStatus, setStatus } from "./db/status.ts";
import { clearStatus } from "./db/status.ts";
import {
  addChannel,
  isChannel,
  listChannelsByUser,
  removeChannel,
} from "./db/channel.ts";
import { addRequest, listRequests, removeRequest } from "./db/requests.ts";
import { clearSelected, getSelected, setSelected } from "./db/select.ts";
import {
  getBiteMessage,
  getHiMessage,
  setBiteMessage,
  setHiMessage,
} from "./db/messages.ts";
import { InlineKeyboardMarkup } from "https://deno.land/x/grammy@v1.32.0/types.ts";
import { addUser, listUsers } from "./db/users.ts";

export const logsId = Number("-100" + Deno.env.get("LOGS_ID"));

export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");
export const kv = await Deno.openKv();

const forbidden = async (c: Context) => {
  await c.reply("Получить доступ можно у @mckoda09.");
};

await bot.api.setMyCommands([
  { command: "start", description: "Проверить доступ 🔑" },
  { command: "add", description: "Добавить канал ➕" },
  { command: "remove", description: "Удалить канал 🚫" },
  { command: "list", description: "Список каналов 📄" },
  { command: "approve", description: "Принять заявки ✅" },
  { command: "hi", description: "Установить привет 👋" },
  { command: "bite", description: "Установить байт 🤭" },
  { command: "cast", description: "Отправить рассылку 📢" },
]);

bot.chatType("private").command("cancel", async (c) => {
  await clearStatus(c.from.id);
  await c.reply("Текущее действие отменено.", {
    reply_markup: { remove_keyboard: true },
  });
});

bot.chatType("private").command("start", async (c) => {
  if (!await isAdmin(c.from.id)) return await forbidden(c);
  await c.reply("У тебя есть доступ к боту.\nКоманды в меню 👇");
});

bot.chatType("private").command("list", async (c) => {
  const channels = await listChannelsByUser(c.from.id);
  await c.reply(
    channels.map((e, i) => `${i + 1}. ${e.title} (${e.requests.length} заявок)`)
      .join(
        "\n",
      ),
  );
});

bot.chatType("private").command("add", async (c) => {
  if (!await isAdmin(c.from.id)) return await forbidden(c);

  await setStatus(c.from.id, "add");
  const reply_markup = new Keyboard()
    .oneTime()
    .requestChat("Выбрать канал", 0, {
      chat_is_channel: true,
      request_title: true,
    })
    .resized();
  await c.reply("Выбери канал для добавления 👇", { reply_markup });
});

bot.chatType("private").command("remove", async (c) => {
  if (!await isAdmin(c.from.id)) return await forbidden(c);

  await setStatus(c.from.id, "remove");
  const reply_markup = new Keyboard()
    .oneTime()
    .requestChat("Выбрать канал", 0, {
      chat_is_channel: true,
      request_title: true,
    })
    .resized();
  await c.reply("Выбери канал для удаления 👇", { reply_markup });
});

bot.chatType("private").command("approve", async (c) => {
  if (!await isAdmin(c.from.id)) return await forbidden(c);

  await setStatus(c.from.id, "approve");
  const reply_markup = new Keyboard()
    .oneTime()
    .requestChat("Выбрать канал", 0, {
      chat_is_channel: true,
      request_title: true,
    })
    .resized();
  await c.reply("Выбери канал для приема заявок 👇", { reply_markup });
});

bot.chatType("private").command("hi", async (c) => {
  if (!await isAdmin(c.from.id)) return await forbidden(c);

  await setStatus(c.from.id, "selecthi");
  const reply_markup = new Keyboard()
    .oneTime()
    .requestChat("Выбрать канал", 0, {
      chat_is_channel: true,
      request_title: true,
    })
    .resized();
  await c.reply("Выбери канал для установки привет-сообщения 👇", {
    reply_markup,
  });
});

bot.chatType("private").command("bite", async (c) => {
  if (!await isAdmin(c.from.id)) return await forbidden(c);

  await setStatus(c.from.id, "selectbite");
  const reply_markup = new Keyboard()
    .oneTime()
    .requestChat("Выбрать канал", 0, {
      chat_is_channel: true,
      request_title: true,
    })
    .resized();
  await c.reply("Выбери канал для установки байт-сообщения 👇", {
    reply_markup,
  });
});

bot.chatType("private").command("cast", async (c) => {
  if (!await isAdmin(c.from.id)) return await forbidden(c);

  await setStatus(c.from.id, "selectcast");
  const reply_markup = new Keyboard()
    .oneTime()
    .requestChat("Выбрать канал", 0, {
      chat_is_channel: true,
      request_title: true,
    })
    .resized();
  await c.reply("Выбери канал для рассылки 👇", {
    reply_markup,
  });
});

bot.chatType("private").on("msg:chat_shared", async (c) => {
  switch (await getStatus(c.from.id)) {
    case "add": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      await clearStatus(c.from.id);
      await addChannel(
        c.msg.chat_shared.chat_id,
        c.from.id,
        c.msg.chat_shared.title || "???",
      );
      await c.reply("Канал добавлен.", {
        reply_markup: { remove_keyboard: true },
      });
      break;
    }
    case "remove": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      await clearStatus(c.from.id);
      await removeChannel(
        c.msg.chat_shared.chat_id,
        c.from.id,
      );
      await c.reply("Канал удален.", {
        reply_markup: { remove_keyboard: true },
      });
      break;
    }
    case "approve": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      await clearStatus(c.from.id);
      await c.reply("Принимаю заявки...", {
        reply_markup: { remove_keyboard: true },
      });
      const requests = await listRequests(c.msg.chat_shared.chat_id);
      let success = 0;
      let error = 0;
      for (const request of requests) {
        try {
          await c.api.approveChatJoinRequest(request.chatId, request.userId);
          success++;
        } catch {
          error++;
        }
        await removeRequest(request.chatId, request.userId);
      }
      await c.reply(`Заявки приняты! ${success} успешно, ${error} провалено.`);
      break;
    }
    case "selecthi": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      await setSelected(c.from.id, c.msg.chat_shared.chat_id);
      await setStatus(c.from.id, "hi");
      await c.reply("Отправь сообщение для приветствия:", {
        reply_markup: { remove_keyboard: true },
      });
      break;
    }
    case "selectbite": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      await setSelected(c.from.id, c.msg.chat_shared.chat_id);
      await setStatus(c.from.id, "bite");
      await c.reply("Отправь сообщение для байта:", {
        reply_markup: { remove_keyboard: true },
      });
      break;
    }
    case "selectcast": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      await setSelected(c.from.id, c.msg.chat_shared.chat_id);
      await setStatus(c.from.id, "cast");
      await c.reply("Отправь сообщение для рассылки:", {
        reply_markup: { remove_keyboard: true },
      });
      break;
    }
  }
});

bot.chatType("private").on("msg:text", async (c) => {
  switch (await getStatus(c.from.id)) {
    case "hi": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      const selected = await getSelected(c.from.id);
      await setHiMessage(selected || 0, c.chat.id, c.msgId, c.msg.reply_markup);
      await clearStatus(c.from.id);
      await clearSelected(c.from.id);
      await c.reply("Привет-сообщение установлено.");
      break;
    }
    case "bite": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      const selected = await getSelected(c.from.id);
      await setBiteMessage(
        selected || 0,
        c.chat.id,
        c.msgId,
        c.msg.reply_markup,
      );
      await clearStatus(c.from.id);
      await clearSelected(c.from.id);
      await c.reply("Байт-сообщение установлено.");
      break;
    }
    case "cast": {
      if (!await isAdmin(c.from.id)) return await forbidden(c);
      const selected = await getSelected(c.from.id);
      await clearStatus(c.from.id);
      await clearSelected(c.from.id);
      await c.reply("Отправляю рассылку...");
      const users = await listUsers(selected || 0);
      let success = 0;
      let error = 0;
      for (const user of users) {
        try {
          await c.copyMessage(user, {reply_markup: c.msg.reply_markup});
          success++;
        } catch {
          error++;
        }
      }
      await c.reply(
        `Рассылка отправлена! ${success} успешно, ${error} провалено.`,
      );
      break;
    }
  }
});

bot.on("chat_join_request", async (c) => {
  if (await isChannel(c.chatJoinRequest.chat.id)) {
    await addRequest(c.chatJoinRequest.chat.id, c.chatJoinRequest.from.id);
    await addUser(c.chatJoinRequest.chat.id, c.chatJoinRequest.from.id);
    const hiMessage = await getHiMessage(c.chatJoinRequest.chat.id);
    const biteMessage = await getBiteMessage(c.chatJoinRequest.chat.id);
    if (hiMessage) {
      await c.api.copyMessage(
        c.chatJoinRequest.user_chat_id,
        hiMessage!.chatId,
        hiMessage!.msgId,
        { reply_markup: hiMessage?.reply_markup },
      );
    }
    if (biteMessage) {
      await kv.enqueue({
        userId: c.chatJoinRequest.user_chat_id,
        chatId: biteMessage!.chatId,
        msgId: biteMessage!.msgId,
        reply_markup: biteMessage?.reply_markup,
      }, { delay: 5000 });
    }
  }
});

kv.listenQueue(
  async (
    value: {
      userId: number;
      chatId: number;
      msgId: number;
      reply_markup: InlineKeyboardMarkup;
    },
  ) => {
    await bot.api.copyMessage(value.userId, value.chatId, value.msgId, {
      reply_markup: value.reply_markup,
    });
  },
);

bot.catch(console.error);
