import markdown from "@/views/chat2llm/markdown";

export enum Who {
  you = 'you', robot = 'robot'
}

export enum ChatMode {
  LLM = 'LLM', Knowledge = 'Knowledge', SearchEngine = 'SearchEngine', Agent = 'Agent'
}

export class RequestParam {
  query?: string = ''; // 请求的正文
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
  chat_history_id: string | null;
  text: string = '';
  isDoc?: boolean = false; // 若是引用消息，则为true, 否则为false

  constructor(chat_history_id: string | null, text: string, isDoc?: boolean) {
    this.chat_history_id = chat_history_id;
    this.text = text;
    this.isDoc = isDoc ?? false
  }
}

export class ChatRecord {
  who: Who; // 对话角色
  avatar: string; // 头像
  messages: Array<ChatMessage> = []; // 对话记录
  doc: Array<ChatMessage> = []; // 引用， 知识库模式下，robot的记录存在出处引用
  chat_history_id: string; // 对话id
  messageHtml: string = ''; // 此次【对话记录】渲染的html内容
  create_time?: string;
  thinking?: boolean = false;

  constructor(who: Who, chat_history_id: string) {
    this.who = who;
    this.avatar = (who === Who.robot ? '🤖' : '🧒🏻');
    this.chat_history_id = chat_history_id;
    this.doc = []
  }

  // 清除此次对话的内容
  clear() {
    this.messages.length = 0
    this.doc.length = 0
    this.messageHtml = ''
  }

  isEmpty() {
    return !this.messageHtml
  }

  addMessage(message: ChatMessage) {
    if (message.isDoc === false) {
      this.messages.push(message);
      const messageText = this.messages.map(msg => msg.text).join("");
      this.messageHtml = markdown.render(messageText);
    } else {
      this.doc?.push(message);
    }
  }

  setError(err: Error) {
    console.log(err)
    this.clear()
    const message = new ChatMessage(this.chat_history_id, err.message)
    this.messages.push(message);
    const messageText = this.messages.map(msg => msg.text).join("");
    this.messageHtml = markdown.render(messageText);
    console.log(this)
    console.log(this.messageHtml)
  }
}

export class ChatSession {
  sessionId: string;
  sessionName: string;
  mode: ChatMode;
  param: RequestParam;
  records: Array<ChatRecord> = [];
  create_time?: string;

  constructor(sessionId: string, mode: ChatMode, param: RequestParam) {
    this.sessionId = sessionId;
    this.sessionName = sessionId; // 初始化采用sessionId作为名称
    this.mode = mode;
    this.param = param;
    this.create_time = new Date().toDateString()
  }

  addQuestion(message: ChatMessage) {
    const { chat_history_id } = message;
    const record = new ChatRecord(Who.you, chat_history_id);
    record.messages.push(message);
    record.messageHtml = message.text;
    if (this.isEmpty()) {
      // 初始化sessionName
      const { messageHtml = '对话' } = record;
      this.sessionName = messageHtml.substring(0, 20); // 截取首条内容作为sessionName
    }
    this.records.push(record);
  }

  addAnswer(record: ChatRecord) {
    this.records.push(record)
  }

  // 加到开头
  unshift(record: ChatRecord) {
    this.records.unshift(record);
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

  /**
   * 获取当前会话中缓存的最早的对话。若不存在则返回null
   */
  getEarliestRecord() {
    return this.isEmpty() ? null : this.records[0]
  }

  /**
   * 获取当前会话中最晚的记录。若不存在则返回null。
   * @param n 表示最后的第几个记录, 默认为1(倒数第一个), 如果是2表示倒数第二个
   */
  getLatestRecord(n: number = 1) {
    if (n > this.records.length) {
      console.error('n超过数组长度')
      return null;
    }
    return this.isEmpty() ? null : this.records[this.records.length - n]
  }

  getRecord(chat_history_id: string) {
    return this.isEmpty() ? null : this.records.find(r => r.chat_history_id == chat_history_id)
  }

  /**
   * 删除指定记录
   * @param record 
   * @returns 
   */
  removeRecord(record: ChatRecord) {
    if (this.isEmpty()) {
      return true
    }
    const index = this.records.findIndex(r => r.chat_history_id == record.chat_history_id)
    if (index == -1) {
      return false
    }
    this.records.splice(index, 1)
  }

  isEmpty() {
    return this.records.length === 0;
  }
}
