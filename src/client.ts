import { Chat } from './chat_completions';

export class Modelfarm {
  base_url: string;

  chat: Chat;

  constructor(base_url: string | null = null) {
    this.base_url =
      base_url ?? 'https://production-modelfarm.replit.com/v1beta2';

    this.chat = new Chat(this);
  }
}
