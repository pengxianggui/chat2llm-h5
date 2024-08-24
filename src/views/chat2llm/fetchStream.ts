// 如果使用ES6模块
import { ChatMessage, ChatMode } from './model'
import { parse } from './parse'
import Timer from '@/utils/timer'

export const EventStreamContentType = 'text/event-stream'

interface FetchStreamOption {
  onopen?: (res: Response) => void;
  onmessage: (msgs: ChatMessage[]) => void;
  ondone: () => void;
  onerr?: (err: any) => void;
}

/**
 * 发起并持续接收事件流。
 * @param mode
 * @param param
 * @param onbeforeopen
 * @param inputOnOpen
 * @param onmessage
 * @param ondone
 * @param inputOnError
 * @param timeout 超时时间(单位: 秒)——当一直不响应时的连续时常超过此阈值时，抛出异常
 * @returns AbortController
 */
export function fetchStream(mode: ChatMode, param: any, {
  onopen: inputOnOpen, onmessage, ondone, onerr: inputOnError
}: FetchStreamOption, timeout: number = 10): AbortController {
  const onopen = inputOnOpen ?? defaultOnOpen
  const onerr = inputOnError ?? defaultOnErr

  function create(): AbortController {
    const ctrl = new AbortController()
    // 根据param.mode不同，给不同的path路径
    let path = '/chat/chat'
    switch (mode) {
      case ChatMode.LLM:
        path = '/chat/chat'
        break
      case ChatMode.Knowledge:
        path = '/chat/knowledge_base_chat'
        break
      case ChatMode.SearchEngine:
        path = '/chat/search_engine_chat'
        break
      case ChatMode.Agent:
        path = '/chat/agent_chat'
        break
      default:
        throw new Error("对话模式不正确：" + mode);
    }

    const fetchPromise = fetch(`/api${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(param),
      signal: ctrl.signal
    })

    const timer = new Timer();
    timer.start();
    // 检测timer是否超时
    const detectInterval = setInterval(() => {
      if (timer.getTime() > timeout) { // 超时
        timer.clear()
        onerr(new Error("接口请求超时..."))
        ctrl.abort() // 取消 fetch 请求
        clearInterval(detectInterval) // 自杀
      }
    }, 1000)

    fetchPromise.then(response => {
      if (response instanceof Response) {
        onopen(response)
        parse(mode, response, (msgs: ChatMessage[]) => {
          timer.reset(); // 类似心跳
          onmessage(msgs);
        }, () => {
          timer.clear();
          ondone();
        }, onerr)
      } else {
        onerr(response)
      }
    }).catch(err => {
      onerr(err)
    })
    return ctrl
  }

  return create()
}

function defaultOnOpen(response: Response) {
  const contentType = response.headers.get('content-type')
  if (!contentType?.startsWith(EventStreamContentType)) {
    throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`)
  }
}

function defaultOnErr(err: any) {
  console.log(err)
}
