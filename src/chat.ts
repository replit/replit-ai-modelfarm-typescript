import all from "it-all";
import * as result from "./result";
import responseBodyToIterator from "./responseBodyToIterator";

const endpoint = "http://staging-modelfarm.ai.gcp.replit.com";
const nonStreamingUrl = `${endpoint}/chat`;
const streamingUrl = `${endpoint}/chat_streaming`;

interface Message {
  content: string;
  author: string;
}

// TODO: Add more?
type Model = "chat-bison";

interface Input {
  model: Model;
  context?: string;
  examples?: Array<Message>;
  messages: Array<Message>;
  // temperature?: number;
  streaming?: boolean;
}

interface StreamingInput extends Input {
  streaming: true;
}

interface NonStreamingInput extends Input {
  streaming: false;
}

interface Message {
  content: string;
  author: string;
}

interface ChatError {
  message: string;
  statusCode: number;
}

type StreamingChatResponse = result.Result<AsyncGenerator<Message>, ChatError>;
type NonStreamingChatResponse = result.Result<Message, ChatError>;

export default async function chat(
  input: NonStreamingInput
): Promise<NonStreamingChatResponse>;
export default async function chat(
  input: StreamingInput
): Promise<StreamingChatResponse>;
export default async function chat(
  input: Input
): Promise<StreamingChatResponse | NonStreamingChatResponse> {
  let response = await fetch(input.streaming ? streamingUrl : nonStreamingUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer $AUTH_TOKEN", // TODO auth
    },
    body: JSON.stringify({
      model: input.model,
      parameters: {
        prompts: [
          {
            context: input.context,
            examples: input.examples,
            messages: input.messages,
          },
        ],
      },
    }),
  });

  if (response.status !== 200) {
    return result.Err({
      message: await response.text(),
      statusCode: response.status,
    });
  }

  if (!response.body) {
    return result.Err({
      message: "No response body",
      statusCode: response.status,
    });
  }

  const iterator = responseBodyToIterator(
    response.body,
    (json: any): Message => ({
      content: json.responses[0].candidates[0].message.content,
      author: json.responses[0].candidates[0].message.author,
    })
  );

  if (input.streaming) {
    return result.Ok(iterator);
  }

  const allMessages = await all(iterator);

  let author = allMessages[0]?.author;
  if (!author) {
    author = "assistant";
  }

  return result.Ok({
    content: allMessages.reduce((acc, { content }) => acc + content, ""),
    author,
  });
}
