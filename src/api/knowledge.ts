import $http from "@/axios";
import type { AxiosPromise } from "axios";

/**
 * 获取知识库名组成的列表
 * @returns 
 */
export function getKbNames(): AxiosPromise<[]> {
    return $http.get('/knowledge_base/list_knowledge_bases')
}

/**
 * 获取知识库列表
 * @returns 
 */
export function getKbs(): AxiosPromise<[]> {
    return $http.get('/knowledge_base/list_knowledge_bases_v2')
}