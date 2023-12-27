import $http from "@/axios";
import type { ChatSession } from "@/views/chat2llm/model";
import type { AxiosPromise } from "axios";

/**
 * 获取会话列表
 * @returns 
 */
export function getSessions(): AxiosPromise<[]> {
    return $http.get('/session/list')
}

/**
 * 保存会话(新增/更新)
 * @param session 
 * @returns 
 */
export function saveSession(session: ChatSession): AxiosPromise<Boolean> {
    return $http.post('/session/save', {
        session_id: session.sessionId,
        session_name: session.sessionName,
        mode: session.mode,
        param: {
            query: null,
            model_name: session.param.model_name,
            stream: session.param.stream,
            temperature: session.param.temperature,
            max_tokens: session.param.max_tokens,
            prompt_name: session.param.prompt_name,
            history_count: session.param.history_count,
            knowledge_base_name: session.param.knowledge_base_name,
            top_k: session.param.top_k,
            score_threshold: session.param.score_threshold,
            split_result: session.param.split_result
        }
    })
}