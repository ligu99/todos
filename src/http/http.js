import axios from "axios";

const service = axios.create();

service.defaults.timeout = 60 * 1000 * 5;
service.defaults.baseURL = "http://175.178.122.39:8100";
// http request 拦截器
service.interceptors.request.use(
  config => {
    // 解决IE下浏览器一直拿缓存的问题，加时间戳处理
    if (config.method) {
      config.params = {
        t: Date.parse(new Date()),
        ...config.params
      }
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
// http response 拦截器
service.interceptors.response.use(
  response => {
    // http状态码是正确的
    if (response.status === 200) {
      return response.data || response;
    }
  },
  error => {
    return Promise.reject(error.response);
  }
);

export default service;
