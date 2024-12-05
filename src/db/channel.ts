import { kv } from "../mod.ts";
import { listRequests } from "./requests.ts";

const channelKey = (id: number) => ["channel", id];
const channelByUserKey = (userId: number) => ["channel_by_id", userId];
const channelTitleKey = (id: number) => ["channel_title", id];

export const listChannelsByUser = async (id: number) =>
  await Array.fromAsync(
    kv.list<boolean>({ prefix: channelByUserKey(id) }, { limit: 50 }),
    async (e) => ({
      id: Number(e.key[2]),
      title: await getChannelTitle(Number(e.key[2])),
      requests: await listRequests(Number(e.key[2])),
    }),
  );

export const addChannel = async (id: number, userId: number, title: string) => {
  await kv.atomic()
    .set(channelKey(id), true)
    .set([...channelByUserKey(userId), id], true)
    .set(channelTitleKey(id), title)
    .commit();
};
export const removeChannel = async (
  id: number,
  userId: number,
) => {
  await kv.atomic()
    .delete(channelKey(id))
    .delete([...channelByUserKey(userId), id])
    .delete(channelTitleKey(id))
    .commit();
};

export const getChannelTitle = async (id: number) =>
  (await kv.get<string>(channelTitleKey(id))).value;

export const isChannel = async (id: number) =>
  (await kv.get(channelKey(id))).value ? true : false;
