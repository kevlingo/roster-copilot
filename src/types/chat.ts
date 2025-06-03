export interface MessageObject {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}