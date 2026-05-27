export interface Memo {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  completed?: boolean;
  favorited?: boolean;
}
