import {ChatMessage} from "./model";

/**
 * 解析响应事件流
 * @param res
 * @param onmessage
 * @param ondone
 * @param onerr
 */
export function parse(res: Response,
                      onmessage: (msgs: ChatMessage[]) => void,
                      ondone: () => void,
                      onerr: (err: Error) => void
) {
  // @ts-ignore
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
      onmessage(parseLine(decodeMsg))
    } catch (err) {
      onerr(err)
    }

    // 读取下一个片段，重复处理步骤
    return reader.read().then(processData);
  };

  reader.read().then(processData).catch(onerr);
}


/**
 * 解析每行。
 * 期望格式： {"text":"", "chat_history_id":""}
 * 但实际发现存在一定概率出现这样的格式: {"text":"", "chat_history_id":""}{"text":"", "chat_history_id":""}
 * @param decodeMsg
 */
function parseLine(decodeMsg: string) {
  try {
    const msg = JSON.parse(decodeMsg)
    return Array.isArray(msg) ? msg : [msg]
  } catch (err) {
    // 尝试正则转换为可处理的json格式
    const jsonStr = '[' + decodeMsg.replace(/}{/g, '},{') + ']';
    return JSON.parse(jsonStr)
  }
}
