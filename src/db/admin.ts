import { kv } from "../mod.ts";

const adminKey = (id: number) => ["admin", id];

export const isAdmin = async (id: number) =>
  (await kv.get<boolean>(adminKey(id))).value ? true : false;
