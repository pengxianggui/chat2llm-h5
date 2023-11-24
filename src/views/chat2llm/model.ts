export enum Who {
  you= 'you', robot = 'robot'
}

export class RequestParam {
  query: string = ''; // 请求的正文
  history: [];  // 历史对话
  model_name: string = 'zhipu-api'; // 模型名称
  stream: boolean = true; // 是否流式输出
  temperature: number = 0.7; // 温度
  max_tokens: number = 10; // 最大token
  prompt_name: string = 'default'; // 向LLM请求前的prompt封装
  knowledge_base_name ?: string; // 知识库名
  top_k ?: number = 3;
  score_threshold ?: number = 1;
}

export class ChatMessage {
  chat_history_id: string;
  text: string;

  constructor(chat_history_id: string, text: string) {
    this.chat_history_id = chat_history_id;
    this.text = text;
  }
}

export class ChatRecord {
  who: Who;
  avatar: string;
  messages: Array<ChatMessage> = [];
  chat_history_id: string;
  renderHtml: string;

  constructor(who: Who, avatar: string, messages: Array<ChatMessage>, chat_history_id: string) {
    this.who = who;
    this.avatar = avatar;
    this.messages = messages;
    this.chat_history_id = chat_history_id;
  }
}
