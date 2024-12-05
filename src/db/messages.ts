import { InlineKeyboardMarkup } from "https://deno.land/x/grammy@v1.32.0/types.ts";
import { kv } from "../mod.ts";

const hiMessageKey = (id: number) => ["hiMessage", id];

interface hiMessage {
  chatId: number;
  msgId: number;
  reply_markup: string;
}

export const setHiMessage = async (
  id: number,
  chatId: number,
  msgId: number,
  reply_markup?: InlineKeyboardMarkup,
) =>
  await kv.set(hiMessageKey(id), {
    chatId,
    msgId,
    reply_markup: reply_markup ? JSON.stringify(reply_markup) : undefined,
  });

export const getHiMessage = async (id: number) => {
  const value = (await kv.get<hiMessage>(hiMessageKey(id))).value;
  if (!value) return;
  const { chatId, msgId, reply_markup } = value;

  return {
    chatId,
    msgId,
    reply_markup: reply_markup
      ? JSON.parse(reply_markup) as InlineKeyboardMarkup
      : undefined,
  };
};

const biteMessageKey = (id: number) => ["hiMessage", id];

interface hiMessage {
  chatId: number;
  msgId: number;
  reply_markup: string;
}

export const setBiteMessage = async (
  id: number,
  chatId: number,
  msgId: number,
  reply_markup?: InlineKeyboardMarkup,
) =>
  await kv.set(biteMessageKey(id), {
    chatId,
    msgId,
    reply_markup: reply_markup ? JSON.stringify(reply_markup) : undefined,
  });

export const getBiteMessage = async (id: number) => {
  const value = (await kv.get<hiMessage>(biteMessageKey(id))).value;
  if (!value) return;
  const { chatId, msgId, reply_markup } = value;

  return {
    chatId,
    msgId,
    reply_markup: reply_markup
      ? JSON.parse(reply_markup) as InlineKeyboardMarkup
      : undefined,
  };
};
