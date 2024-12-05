import { kv } from "../mod.ts";

const selectedKey = (id: number) => ["select", id];

export const setSelected = async (id: number, selected: number) =>
  await kv.set(selectedKey(id), selected);

export const getSelected = async (id: number) =>
  (await kv.get<number>(selectedKey(id))).value;

export const clearSelected = async (id: number) =>
  await kv.delete(selectedKey(id));
