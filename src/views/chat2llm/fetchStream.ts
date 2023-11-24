import {ChatMessage, RequestParam} from "./model";
import {parse} from "./parse";

export const EventStreamContentType = 'text/event-stream';

interface FetchStreamOption {
  onopen?: (res: Response) => void;
  onmessage: (msgs: ChatMessage[]) => void;
  ondone: () => void;
  onerr?: (err: Error) => void;
}

/**
 * 发起并持续接收事件流。
 * @param param
 * @param inputOnOpen
 * @param onmessage
 * @param ondone
 * @param inputOnError
 */
export async function fetchStream(param: RequestParam, {
  onopen: inputOnOpen, onmessage, ondone, onerr: inputOnError
}: FetchStreamOption) {
  const onopen = inputOnOpen ?? defaultOnOpen;
  const onerr = inputOnError ?? defaultOnErr;

  async function create() {
    try {
      const response = await fetch(`/api/chat/chat`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(param)
      })

      await onopen(response);
      parse(response, onmessage, ondone, onerr)
    } catch (err) {
      onerr(err)
    }
  }

  await create();
}

function defaultOnOpen(response: Response) {
  const contentType = response.headers.get('content-type');
  if (!contentType?.startsWith(EventStreamContentType)) {
    throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
  }
}

function defaultOnErr(err: Error) {
  console.log(err)
}
