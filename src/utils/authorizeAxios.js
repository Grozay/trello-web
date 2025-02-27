import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatter'
//khởi taoj một đới tượng axios (authorizeInstance) mục đính để cútoemr và cấu hình chung cho dự án.
const authorizedAxiosInstance = axios.create()
//thời gian chờ tối đa của 1 request: để 10p
authorizedAxiosInstance.defaults.timeout = 10 * 60 * 1000
//withCredentials: sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE (phục vụ việc chúng ta sẽ lưu JWT token (refresh & access) vào trong httpOnly cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true

//Cấu hình interceptor cho authorizedAxiosInstance
// intercepter request: Can thiệp vào giữa mọi request api
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Do something before request is sent

  // Kỹ thuật chặn spam click (Xem kĩ mô tả ở file formatter.js)
  interceptorLoadingElements(true)
  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

// intercepter response: Can thiệp vào giữa mọi response nhận được từ BE
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data

  // Kỹ thuật chặn spam click (Xem kĩ mô tả ở file formatter.js)
  interceptorLoadingElements(false)
  return response
}, (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  // Mọi mã http statú code namgừ ngoài khoảng 200 - 299 sẽ là error được và rơi vào đây

  // Kỹ thuật chặn spam click (Xem kĩ mô tả ở file formatter.js)
  interceptorLoadingElements(false)

  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết cod emột lần: Clean Code)
  // console.log error ra là sẽ thâý cấu trúc data dẫn tới message lỗi như dưới đây
  console.log(error)
  let errorMessage = error?.message
  if (error?.response?.data?.message) {
    errorMessage = error?.response?.data?.message
  }

  // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình -- ngoại trừ 410 -- GONE phục vụ việc tự động refresh token
  if (error?.response?.status !== 410) {
    toast.error(errorMessage)
  }
  return Promise.reject(errorMessage)
})

export default authorizedAxiosInstance