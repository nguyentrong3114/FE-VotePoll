export interface PublicRoomType {
  roomId: string;
  question: string;
  createdAt: string;
  hasPassword: boolean;
  isActive: boolean;
  totalVotes: number;
}
