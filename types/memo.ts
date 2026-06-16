export interface Memo {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  completed?: boolean;
  favorited?: boolean;
  /** 論理削除（トゥームストーン）。値があれば削除済み。共有時に伝播させるため配列には残す。 */
  deletedAt?: number;
}
