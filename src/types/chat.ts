export interface MessageObject {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'conversation' | 'notification';
  notificationType?: 'success' | 'error' | 'info';
}