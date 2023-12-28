import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import { useToken } from '@/stores/token';
import { isEmpty } from "lodash";
import router from "@/router";

const $http = axios.create({
    baseURL: '/api',
    timeout: 50000,
    headers: {
        'Api-Token': ''
    }
});

$http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const tokenStore = useToken()
    if (!isEmpty(tokenStore.get())) {
        config.headers['Api-Token'] = tokenStore.get() // 携带身份认证信息
    }
    return config;
}, (error:any) => {
    return Promise.reject(error);
})

$http.interceptors.response.use((response: AxiosResponse) => {
    const {code, msg} = response.data;
    if (code == 200) {
        return response.data;
    }
    // TODO 二进制文件处理
    ElMessage.error(msg);
    return Promise.reject(new Error(msg));
}, (err: any) => {
    const {response: {status, data}} = err
    if (status == 401) {
        const tokenStore = useToken()
        tokenStore.clear()
        router.push({name: '401', query: { message: data }})
    }
    return Promise.reject(err);
})


export default $http;

export interface Res<T> {
    code: string;
    msg: string;
    data: T;
}