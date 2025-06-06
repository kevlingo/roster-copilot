export interface MessageObject {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'conversation' | 'notification' | 'markdown' | 'component';
  notificationType?: 'success' | 'error' | 'info';
  componentType?: 'archetype-selection';
  componentProps?: unknown;
}