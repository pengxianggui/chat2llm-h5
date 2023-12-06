import markdown from "@/views/chat2llm/markdown";

export enum Who {
  you = 'you', robot = 'robot'
}

export enum ChatMode {
  LLM, Knowledge, SearchEngine, Agent
}

export class RequestParam {
  query?: string = ''; // 请求的正文
  model_name?: string = 'zhipu-api'; // 模型名称, TODO 前端不可调整，改为PC端可配, 需要改python server
  stream: boolean = true; // 是否流式输出
  temperature: number = 0.7; // 温度
  max_tokens: number = 2000; // 最大token
  prompt_name: string = 'default'; // 向LLM请求前的prompt封装
  // 历史对话数量, 前端参数, 决定了history里的数量。 
  // doubt: 很奇怪如果值是3，那么每次3次对话后都会报错, 具体错误查看issue: https://github.com/chatchat-space/Langchain-Chatchat/issues/2228
  // 但是如果设置4，或者5，甚至更多，就不容易报错。如果更小，也容易报错。
  history_count?: number = 5;
  history?: Array<{ role: string, content: string }> = []  // 历史对话

  // 下面是知识库模式特有的---------------------
  knowledge_base_name?: string; // 知识库名
  top_k?: number = 3;
  score_threshold?: number = 1;
  // -----------------------------------------

  // 下面是搜索引擎模式特有的-------------------
  split_result?: boolean = false;
  // -----------------------------------------

  constructor(mode: ChatMode, query?: string, knowledge_base_name?: string) {
    this.query = query;
    this.knowledge_base_name = knowledge_base_name;
    if (mode == ChatMode.Knowledge || mode == ChatMode.Agent) {
      this.temperature = 0;
    }
  }
}


export class ChatMessage {
  chat_history_id: string;
  text: string = '';
  isDoc?: boolean = false; // 若是引用消息，则为true, 否则为false

  constructor(chat_history_id: string, text: string, isDoc?: boolean) {
    this.chat_history_id = chat_history_id;
    this.text = text;
    this.isDoc = isDoc ?? false
  }
}

export class ChatRecord {
  who: Who; // 对话角色
  avatar: string; // 头像
  messages: Array<ChatMessage> = []; // 对话记录
  doc?: Array<ChatMessage> = []; // 引用， 知识库模式下，robot的记录存在出处引用
  chat_history_id: string; // 对话id
  messageHtml: string = ''; // 此次【对话记录】渲染的html内容

  constructor(who: Who, chat_history_id: string) {
    this.who = who;
    this.avatar = (who === Who.robot ? '🤖' : '🧒🏻');
    this.chat_history_id = chat_history_id;
  }
}

export class ChatSession {
  sessionId: string;
  sessionName: string;
  mode: ChatMode;
  param: RequestParam;
  records: Array<ChatRecord> = [];

  constructor(sessionId: string, mode: ChatMode, param: RequestParam) {
    this.sessionId = sessionId;
    this.sessionName = sessionId; // 初始化采用sessionId作为名称
    this.mode = mode;
    this.param = param;
  }

  addQuestion(message: ChatMessage) {
    const { chat_history_id } = message;
    const record = new ChatRecord(Who.you, chat_history_id);
    record.messages.push(message);
    record.messageHtml = message.text;
    this.add(record);
  }

  addAnswer(message: ChatMessage) {
    const { chat_history_id } = message;
    let r: ChatRecord | undefined = this.records.findLast(r => r.chat_history_id === chat_history_id);
    if (!r) {
      r = new ChatRecord(Who.robot, chat_history_id);
      this.add(r);
    }

    if (message.isDoc === false) {
      r.messages.push(message);
      const messageText = r.messages.map(msg => msg.text).join("");
      r.messageHtml = markdown.render(messageText);
    } else {
      r.doc?.push(message);
    }
  }

  addError(chat_history_id: string, err: Error) {
    this.addAnswer(new ChatMessage(chat_history_id, err.message));

    // // @ts-ignore
    // const r = this.records.findLast(r => r.chat_history_id === chat_history_id);
    // if (r) { // 存在此对话，则清空此次回复并将错误信息追加上去
    //   r.messages.length = 0; // clear
    //   r.messageHtml = err.message;
    // } else { // 不存在此次对话，则
    //   this.addAnswer(new ChatMessage(chat_history_id, err.message));
    // }
  }

  add(record: ChatRecord) {
    if (this.records.length === 0) {
      // 初始化sessionName
      const { messageHtml = '对话' } = record;
      this.sessionName = messageHtml.substring(0, 30); // 截取前7位作为sessionName
    }
    this.records.push(record);
  }

  // 填充历史记录到param.history里， 根据param.history_count，取records的最近几条
  fillHistory() {
    if (this.records.length == 0) {
      return;
    }

    const { history_count = 0 } = this.param;

    let history: { role: string; content: string; }[] | undefined;
    if (history_count == 0) {
      history = []
    } else {
      history = this.records.slice(-history_count).map(r => {
        return {
          role: r.who == Who.robot ? 'assistant' : 'user',
          content: r.messageHtml
        }
      })
    }
    this.param.history = history
  }

  isEmpty() {
    return this.records.length === 0;
  }
}
