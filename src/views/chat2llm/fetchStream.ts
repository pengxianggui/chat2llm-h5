import { v4 as uuidv4 } from 'uuid'; // 如果使用ES6模块
import { ChatMessage, ChatMode, RequestParam } from "./model";
import { parse } from "./parse";

export const EventStreamContentType = 'text/event-stream';

interface FetchStreamOption {
  onbeforeopen?: (chatId: string) => void;
  onopen?: (chatId: string, res: Response) => void;
  onmessage: (msgs: ChatMessage[]) => void;
  ondone: (chatId: string) => void;
  onerr?: (chatId: string, err: any) => void;
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
export function fetchStream(mode: ChatMode, param: RequestParam, {
  onbeforeopen: inputOnBeforeOpen, onopen: inputOnOpen, onmessage, ondone, onerr: inputOnError
}: FetchStreamOption): Promise<AbortController> {
  const onbeforeopen = inputOnBeforeOpen ?? defaultOnBeforeOpen;
  const onopen = inputOnOpen ?? defaultOnOpen;
  const onerr = inputOnError ?? defaultOnErr;

  const chatId = uuidv4();

  async function create(): Promise<AbortController> {
    const ctrl = new AbortController();
    try {
      onbeforeopen(chatId);

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

      onopen(chatId, response);
      parse(mode, chatId, response, onmessage, ondone, onerr)
    } catch (err) {
      onerr(chatId, err)
    }
    return ctrl;
  }

  return create();
}

function defaultOnBeforeOpen(chatId: string) {
  // ..
}

function defaultOnOpen(chatId: string, response: Response) {
  const contentType = response.headers.get('content-type');
  if (!contentType?.startsWith(EventStreamContentType)) {
    throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
  }
}

function defaultOnErr(chatId: string, err: any) {
  console.log(err)
}
