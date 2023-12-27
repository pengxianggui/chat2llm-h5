import { ChatMessage, ChatMode } from "./model";
import { isEmpty } from 'lodash';

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
  res: Response,
  onmessage: (msgs: ChatMessage[]) => void,
  ondone: () => void,
  onerr: (err: any) => void
) {
  // @ts-ignore
  try {
    const reader = res.body.getReader();
    const processData = (result) => {
      if (result.done) {
        ondone();
        return;
      }

      const value = result.value;
      try {
        const decodeMsg = new TextDecoder('utf-8').decode(value);
        console.debug(decodeMsg)
        const messages = parseLine(mode, decodeMsg);
        onmessage(messages)
      } catch (err) {
        onerr(err)
      }

      // 读取下一个片段，重复处理步骤
      return reader.read().then(processData);
    };

    reader.read().then(processData).catch(err => {
      onerr(err);
    });
  } catch (err) {
    onerr(new Error('发生错误, 请重试:' + err.message))
  }
}


/**
 * 解析每行。
 * 期望格式： {"text":""} 或 {"answer": ""}
 * 但实际发现存在一定概率出现这样的格式: {"text":""}{"text":""}， 或者{"answer": ""}{"answer": ""}
 * @param decodeMsg
 */
function parseLine(mode: ChatMode, decodeMsg: string): Array<ChatMessage> {
  let messages;
  try {
    const msg = JSON.parse(decodeMsg)
    messages = Array.isArray(msg) ? msg : [msg]
  } catch (err) {
    // 尝试正则转换为可处理的json格式
    const jsonStr = '[' + decodeMsg.replace(/}{/g, '},{') + ']';
    messages = JSON.parse(jsonStr)
  }

  return messages.map((msg: { text: string; answer: string; docs: Array<string>; }) => {
    let text!: string; // 赋值断言
    if (mode == ChatMode.Knowledge) {
      return buildMessageForKnowledge(msg);
      // } else if (mode == ChatMode.SearchEngine) {

      // } else if (mode == ChatMode.Agent) {
    } else {
      text = msg.text;
      return new ChatMessage(null, text)
    }
  }).filter((msg: { text: string; answer: string; docs: Array<string>; }) => !isEmpty(msg.text))
}

function buildMessageForKnowledge(msg: { answer: string; docs: Array<string>; }) {
  if (Object.prototype.hasOwnProperty.call(msg, 'docs')) {
    return new ChatMessage(null, msg.docs.join('\n'), true);
  } else if (Object.prototype.hasOwnProperty.call(msg, 'answer')) {
    return new ChatMessage(null, msg.answer);
  }
  return new ChatMessage(null, JSON.stringify(msg));
}
