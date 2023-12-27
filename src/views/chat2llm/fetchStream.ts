import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import { ChatMessage, ChatMode, ChatRecord, RequestParam } from "./model";
import { parse } from "./parse";

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

      const response = await fetch(`/api${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(param),
        signal: ctrl.signal
      })

      onopen(response);
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
