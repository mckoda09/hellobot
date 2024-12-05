import { kv } from "../mod.ts";

const requestKey = (
  chatId: number,
  userId: number,
) => ["request", chatId, userId];

export const addRequest = async (chatId: number, userId: number) =>
  await kv.set(requestKey(chatId, userId), true);

export const removeRequest = async (chatId: number, userId: number) =>
  await kv.delete(requestKey(chatId, userId));

export const listRequests = async (chatId: number) =>
  await Array.fromAsync(
    kv.list<boolean>({ prefix: ["request", chatId] }),
    (e) => ({
      chatId,
      userId: Number(e.key[2]),
    }),
  );
