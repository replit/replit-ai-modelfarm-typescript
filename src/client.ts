import { Chat } from './chat_completions';
import { Embeddings } from './embeddings';
import { Completions } from './completions';

export class Modelfarm {
  base_url: string;

  chat: Chat;
  embeddings: Embeddings;
  completions: Completions;

  constructor(base_url: string | null = null) {
    this.base_url =
      base_url ?? 'https://production-modelfarm.replit.com/v1beta2';

    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.completions = new Completions(this);
  }
}
