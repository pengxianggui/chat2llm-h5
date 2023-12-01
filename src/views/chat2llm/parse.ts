import { ChatMessage, ChatMode } from "./model";
import {isEmpty} from 'lodash';

/**
 * 解析响应事件流
 * @param mode
 * @param chatId
 * @param res
 * @param onmessage
 * @param ondone
 * @param onerr
 */
export function parse(
  mode: ChatMode,
  chatId: string,
  res: Response,
  onmessage: (msgs: ChatMessage[]) => void,
  ondone: (chatId: string) => void,
  onerr: (chatId: string, err: any) => void
) {
  // @ts-ignore
  try {
    const reader = res.body.getReader();
    const processData = (result) => {
      if (result.done) {
        ondone(chatId);
        return;
      }

      const value = result.value;
      try {
        const decodeMsg = new TextDecoder('utf-8').decode(value);
        console.debug(decodeMsg)
        const messages = parseLine(mode, chatId, decodeMsg);
        onmessage(messages)
      } catch (err) {
        onerr(chatId, err)
      }

      // 读取下一个片段，重复处理步骤
      return reader.read().then(processData);
    };

    reader.read().then(processData).catch(err => {
      onerr(chatId, err);
    });
  } catch (err) {
      onerr(chatId, new Error('发生错误, 请重试:' + err.message))
  }
}


/**
 * 解析每行。
 * 期望格式： {"text":""} 或 {"answer": ""}
 * 但实际发现存在一定概率出现这样的格式: {"text":""}{"text":""}， 或者{"answer": ""}{"answer": ""}
 * @param decodeMsg
 */
function parseLine(mode: ChatMode, chatId: string, decodeMsg: string): Array<ChatMessage> {
  let messages;
  try {
    const msg = JSON.parse(decodeMsg)
    messages = Array.isArray(msg) ? msg : [msg]
  } catch (err) {
    // 尝试正则转换为可处理的json格式
    const jsonStr = '[' + decodeMsg.replace(/}{/g, '},{') + ']';
    messages = JSON.parse(jsonStr)
  }

  return messages.map((msg: { text: string; answer: string; }) => {
    let text!: string; // 赋值断言
    const chat_history_id: string = chatId;
    if (mode == ChatMode.LLM) {
      text = msg.text;
    } else if (mode == ChatMode.Knowledge) {
      text = msg.answer;
      // } else if (mode == ChatMode.SearchEngine) {

      // } else if (mode == ChatMode.Agent) {

    }

    return new ChatMessage(chat_history_id, text);
  }).filter(msg => !isEmpty(msg.text))
}
