export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  senderUsername: string;
  roomId: number;
  timestamp: Date;
}
