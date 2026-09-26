export type ItemStatus = "todo" | "done";

export interface Item {
  id: string;
  title: string;
  url: string;
  status: ItemStatus;
  createdAt: string;
  completedAt: string | null;
}
