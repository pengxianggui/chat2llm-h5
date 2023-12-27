import $http from "@/axios";
import type { AxiosPromise } from "axios";

/**
 * 获取会话下指定对话记录的前num轮记录
 * @param sessionId 会话id
 * @param chatId 为null则表示拉取最新的
 * @param num 
 */
export function getRecommendQuestion(num: number): AxiosPromise<[]> {
    return $http.post('/recommend/question', {
        num: num
    })
}