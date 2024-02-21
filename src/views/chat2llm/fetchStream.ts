import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import { ChatMessage, ChatMode, ChatRecord, RequestParam } from "./model";
import { parse } from "./parse";
import { ANSWER_TIMEOUT } from '@/constant';

export const EventStreamContentType = 'text/event-stream';

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
 * @returns AbortController
 */
export function fetchStream(mode: ChatMode, param: any, {
  onopen: inputOnOpen, onmessage, ondone, onerr: inputOnError
}: FetchStreamOption): Promise<AbortController> {
  const onopen = inputOnOpen ?? defaultOnOpen;
  const onerr = inputOnError ?? defaultOnErr;

  async function create(): Promise<AbortController> {
    const ctrl = new AbortController();
    try {
      const timeoutFn = function() {
        return new Promise<string>((resolve) => {
          setTimeout(() => {
            resolve('timeout')
          }, ANSWER_TIMEOUT);
        })
      }

      const fetchFn = async function() {
        // 根据param.mode不同，给不同的path路径
        let path = '/chat/chat';
        if (mode == ChatMode.LLM) {
          path = '/chat/chat';
        } else if (mode == ChatMode.Knowledge) {
          path = '/chat/knowledge_base_chat';
        } else if (mode == ChatMode.SearchEngine) {
          path = '/chat/search_engine_chat';
        } else if (mode == ChatMode.Agent) {
          path = '/chat/agent_chat';
        }

        return await fetch(`/api${path}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(param),
          signal: ctrl.signal
        })
      }

      // race 接受一个promise数组，先返回的作为值。 借助此特性实现timeout功能(fetch不支持)
      const response: string | Response = await Promise.race([timeoutFn(), fetchFn()])
      if (response === 'timeout') {
        throw new Error('响应超时！')
      }
      // @ts-ignore
      onopen(response);
      // @ts-ignore
      parse(mode, response, onmessage, ondone, onerr)
    } catch (err) {
      onerr(err)
    }
    return ctrl;
  }

  return create();
}

function defaultOnOpen(response: Response) {
  const contentType = response.headers.get('content-type');
  if (!contentType?.startsWith(EventStreamContentType)) {
    throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
  }
}

function defaultOnErr(err: any) {
  console.log(err)
}
