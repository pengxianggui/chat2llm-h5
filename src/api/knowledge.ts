import $http from "@/axios";
import type { AxiosPromise } from "axios";

/**
 * 获取知识库名组成的列表
 * @returns 
 */
export function getNames(): AxiosPromise<[]> {
    return $http.get('/knowledge_base/list_knowledge_bases')
}