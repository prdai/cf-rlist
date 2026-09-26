import { env } from "cloudflare:workers";
import type { Item } from "./types";

const ITEMS_KEY = "items";

export async function listItems(): Promise<Item[]> {
  const raw = await env.RLIST.get(ITEMS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Item[];
}

export async function addItem(title: string, url: string): Promise<void> {
  const items = await listItems();
  items.unshift({
    id: crypto.randomUUID(),
    title,
    url,
    status: "todo",
    createdAt: new Date().toISOString(),
    completedAt: null,
  });
  await save(items);
}

export async function toggleItem(id: string): Promise<void> {
  const items = await listItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  const done = item.status === "todo";
  item.status = done ? "done" : "todo";
  item.completedAt = done ? new Date().toISOString() : null;
  await save(items);
}

export async function deleteItem(id: string): Promise<void> {
  const items = await listItems();
  await save(items.filter((entry) => entry.id !== id));
}

async function save(items: Item[]): Promise<void> {
  await env.RLIST.put(ITEMS_KEY, JSON.stringify(items));
}
