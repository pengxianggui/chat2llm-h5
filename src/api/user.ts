import $http from "@/axios";
import type { User } from "@/views/profile/model";
import type { AxiosPromise } from "axios";


/**
 * 获取当前登录用户
 * @param sessionId
 * @returns 
 */
export function getUserInfo(): AxiosPromise<User> {
    return $http.get('/user/info')
}