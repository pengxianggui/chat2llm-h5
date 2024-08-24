import $http from "@/axios";
import type { AxiosPromise } from "axios";

/**
 * 获取指定数量推荐的问题
 * @param num 指定数量
 * @param kbId 知识库id。不传则不限定范围;传了空串则限定非知识库;传了非空串则限定知识库
 */
export function getRecommendQuestion(num: number, kbId?: string | null | undefined): AxiosPromise<[]> {
    return $http.get('/recommend/question', {
        params: {
            kb_id: kbId,
            num:num
        }
    })
}