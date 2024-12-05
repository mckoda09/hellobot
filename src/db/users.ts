import { kv } from "../mod.ts";

const userKey = (
  chatId: number,
  userId: number,
) => ["user", chatId, userId];

export const addUser = async (chatId: number, userId: number) =>
  await kv.set(userKey(chatId, userId), true);

export const listUsers = async (chatId: number) =>
  await Array.fromAsync(
    kv.list<boolean>({ prefix: ["user", chatId] }),
    (e) => ({
      chatId,
      userId: Number(e.key[2]),
    }),
  );
