import markdown from "@/views/chat2llm/markdown";

export enum Who {
  you = 'you', robot = 'robot'
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

export class ChatSession {
  sessionId: string;
  sessionName: string;
  records: Array<ChatRecord> = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.sessionName = sessionId;
  }

  addQuestion(message: ChatMessage) {
    const {chat_history_id} = message;
    const record = new ChatRecord(Who.you, '👥', [message], chat_history_id);
    record.renderHtml = message.text;
    this.add(record);
  }

  addAnswer(message: ChatMessage) {
    const {chat_history_id} = message;
    let r = this.records.find(r => r.chat_history_id === chat_history_id);
    if (r) {
      r.messages.push(message);
    } else {
      r = new ChatRecord(Who.robot, '🤖', [message], chat_history_id);
      this.add(r);
    }
    const messageText = r.messages.map(msg => msg.text).join("");
    r.renderHtml = markdown.render(messageText);
  }

  addError(err: Error) {
    // @ts-ignore
    const r = this.records.findLast(r => r.who === Who.robot);
    r.messages.length = 0; // clear
    r.renderHtml = err.message
  }

  add(record: ChatRecord) {
    if (this.records.length === 0) {
      // 初始化sessionName
      const {renderHtml} = record;
      this.sessionName = renderHtml.substring(0, 30); // 截取前7位作为sessionName
    }
    this.records.push(record);
  }

  isEmpty() {
    return this.records.length === 0;
  }
}
