import { kv } from "../mod.ts";

type Status =
  | "add"
  | "remove"
  | "approve"
  | "selecthi"
  | "hi"
  | "selectbite"
  | "bite";

const statusKey = (id: number) => ["status", id];

export const setStatus = async (id: number, status: Status) =>
  await kv.set(statusKey(id), status);

export const getStatus = async (id: number) =>
  (await kv.get<Status>(statusKey(id))).value;

export const clearStatus = async (id: number) => await kv.delete(statusKey(id));
