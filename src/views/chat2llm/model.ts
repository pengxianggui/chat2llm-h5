import markdown from "@/views/chat2llm/markdown";

export enum Who {
  you = 'you', robot = 'robot'
}

export enum ChatMode {
  LLM, Knowledge,SearchEngine,Agent
}

export class RequestParam {
  mode: ChatMode = ChatMode.LLM; // 默认为llm模式
  query?: string = ''; // 请求的正文
  model_name?: string = 'zhipu-api'; // 模型名称, TODO 前端不可调整，改为PC端可配, 需要改python server
  stream: boolean = true; // 是否流式输出
  temperature: number = 0.7; // 温度
  max_tokens: number = 2000; // 最大token
  prompt_name: string = 'default'; // 向LLM请求前的prompt封装
  history_count?:number = 3; // 历史对话数量, 前端参数
  history?: Array<{role: string, content: string}> = []  // 历史对话

  // 下面是知识库模式特有的---------------------
  knowledge_base_name ?: string; // 知识库名
  top_k ?: number = 3;
  score_threshold ?: number = 1;
  // -----------------------------------------

  // 下面是搜索引擎模式特有的-------------------
  split_result ?: boolean = false;
  // -----------------------------------------

  constructor(mode:ChatMode, query?:string, knowledge_base_name?:string) {
    this.mode = mode;
    this.query = query;
    this.knowledge_base_name = knowledge_base_name;
    if (this.mode == ChatMode.Knowledge || this.mode == ChatMode.Agent) {
      this.temperature = 0;
    }
  }
}


export class ChatMessage {
  chat_history_id: string;
  text: string = '';

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
  renderHtml: string = '';

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
    let r = this.records.findLast(r => r.chat_history_id === chat_history_id);
    if (r) {
      r.messages.push(message);
    } else {
      r = new ChatRecord(Who.robot, '🤖', [message], chat_history_id);
      this.add(r);
    }
    const messageText = r.messages.map(msg => msg.text).join("");
    r.renderHtml = markdown.render(messageText);
  }

  addError(chat_history_id: string, err: Error) {
    // @ts-ignore
    const r = this.records.findLast(r => r.chat_history_id === chat_history_id);
    if (r) { // 存在此对话，则清空此次回复并将错误信息追加上去
      r.messages.length = 0; // clear
      r.renderHtml = err.message;
    } else { // 不存在此次对话，则
      this.addAnswer(new ChatMessage(chat_history_id, err.message));
    }
  }

  add(record: ChatRecord) {
    if (this.records.length === 0) {
      // 初始化sessionName
      const {renderHtml = '对话'} = record;
      this.sessionName = renderHtml.substring(0, 30); // 截取前7位作为sessionName
    }
    this.records.push(record);
  }

  // 填充历史记录到param.history里， 根据param.history_count，取records的最近几条
  fillHistory() {
    if (this.records.length == 0) {
      return;
    }

    const {history_count = 0} = this.param;

    let history;
    if (history_count == 0) {
      history = []
    } else {
      history = this.records.slice(-history_count).map(r => {
        return {
          role: r.who == Who.robot ? 'assistant' : 'user',
          content: r.renderHtml
        }
      })
    }
    this.param.history = history
  }

  isEmpty() {
    return this.records.length === 0;
  }
}
