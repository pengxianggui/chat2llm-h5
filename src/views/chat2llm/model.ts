import markdown from "@/views/chat2llm/markdown";

export enum Who {
  you = 'you', robot = 'robot'
}

export enum ChatMode {
  LLM, Knowledge,SearchEngine,Agent
}

export class RequestParam {
  mode?: ChatMode = ChatMode.LLM; // 默认为llm模式
  query?: string = ''; // 请求的正文
  history?: [];  // 历史对话
  model_name?: string = 'zhipu-api'; // 模型名称, TODO 前端不可调整，改为PC端可配, 需要改python server
  stream: boolean = true; // 是否流式输出
  temperature: number = 0.7; // 温度
  max_tokens: number = 10; // 最大token
  prompt_name: string = 'default'; // 向LLM请求前的prompt封装

  // 下面是知识库模式特有的---------------------
  knowledge_base_name ?: string; // 知识库名
  top_k ?: number = 3;
  score_threshold ?: number = 1;
  // -----------------------------------------

  // 下面是搜索引擎模式特有的-------------------
  split_result ?: boolean = false;
  // -----------------------------------------

  constructor(mode?:ChatMode, query?:string, knowledge_base_name?:string) {
    this.mode = mode;
    this.query = query;
    this.knowledge_base_name = knowledge_base_name;
  }
}


export class ChatMessage {
  chat_history_id: string;
  text?: string;

  constructor(chat_history_id: string, text?: string) {
    this.chat_history_id = chat_history_id;
    this.text = text;
  }
}

export class ChatRecord {
  who: Who;
  avatar: string;
  messages: Array<ChatMessage> = [];
  chat_history_id: string;
  renderHtml?: string;

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
  param: RequestParam;
  records: Array<ChatRecord> = [];

  constructor(sessionId: string, param: RequestParam) {
    this.sessionId = sessionId;
    this.sessionName = sessionId;
    this.param = param;
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
    if (r) {
      r.messages.length = 0; // clear
      r.renderHtml = err.message;
    } else {
      this.addAnswer(new ChatMessage(null, err.message));
    }
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
