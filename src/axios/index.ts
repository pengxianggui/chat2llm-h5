import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";

const $http = axios.create({
    baseURL: '/api',
    timeout: 50000,
    headers: {
        'X-Token': 'xxxxxxxxxx', // TODO 认证机制设计好，需要兼顾: 终端识别和用户识别
    }
});

$http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // 携带身份认证信息，
    // config.headers['X-Token'] = 
    return config;
}, (error:any) => {
    return Promise.reject(error);
})

$http.interceptors.response.use((response: AxiosResponse) => {
    const {code, msg} = response.data;
    if (code == 200) {
        return response.data;
    }
    // TODO 二进制文件处理、非授权客户端(403)、非认证用户(401)
    ElMessage.error(msg);
    return Promise.reject(new Error(msg));
}, (err: any) => {
    return Promise.reject(err);
})


export default $http;

export interface Res<T> {
    code: string;
    msg: string;
    data: T;
}