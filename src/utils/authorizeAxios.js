import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatter'
import { refreshTokenAPI } from '~/apis'
import { logoutUserApi } from '~/redux/user/userSlice.js'

//Không thể import {store } from '~/redux/store.js' theo cách thông thường
//giải pháp: Inject store : là kỹ thuật khi cần sửa dụng biến redux store ở các file ngoài phạm vi component như file này
//Hiểu đơn giản: khi ứng dụng bắt đầu chạy, code sẽ chạy vào main.jsx đầu tiên, từ bến đó ta gọi hàm injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này
let axiosReduxStore
export const injectStore = (mainStore) => { axiosReduxStore = mainStore }

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

//Khởi tạo một cái promise cho việc gọi api refresh_token
//Mục đichs tạo ra promíe này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api bị lỗi trước đó.
let refreshTokenPromise = null

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

  //Quang trọng: Xử lý việc refresh token tự động
  //Trường hợp 1: Nếu như nhận mã 401 thừ BE, thì gọi api đăng xuất luôn
  if (error?.response?.status === 401) {
    axiosReduxStore.dispatch(logoutUserApi(false))
  }
  //Trường hợp 2: Nếu như nhận mã 401 thừ BE, thì gọi api refresh_token để lấy token mới
  //Đầu tiên lấy được cái request api đang bị lỗi thong qua error.config
  const originalRequests = error.config
  if (error.response.status === 410 && !originalRequests._retry) {
    //Gán thêm một thuộc tính _retry vào originalRequests để biết được rằng đây là request đã được retry và đảm bảo rằng refresh token này chỉ luôn gọi 1 lần tại một thời điểm
    originalRequests._retry = true
    //Kiểm tra xem nếu chưa có refreshTokenPromise thì thức hiện việc gán api refresh_token đồng thời vào cho cái refreshTokenPromise
    if (!refreshTokenPromise) {
      refreshTokenPromise = refreshTokenAPI()
        .then((data) => {
          //Đôngf thời accessToken đã nằm trong httpOnly cookie(xử lý từ BE)
          return data?.accessToken
        })
        .catch((_error) => {
          //Nếu nhận bất kì lỗi nào từ api refresh token thì cứ logout luôn
          axiosReduxStore.dispatch(logoutUserApi(false))
          return Promise.reject(_error)
        })
        .finally(() => {
          //Dù api có oke hay lỗi thì vấn luôn gán lại cái refreshTokenPromise = null như ban đầu
          refreshTokenPromise = null
        })
    }
    //Khi refreshTokenPromise được gán xong, thì sẽ retry lại cái request api bị lỗi
    // eslint-disable-next-line no-unused-vars
    return refreshTokenPromise.then((accessToken) => {
      //Bước 1: đối với trường hợp nếu dự án cần luuw accesstoken vào localstorage hoặc đâu đó thì viết tyhêm code xử lí ở đây
      //hiện tại ở đây không cần bước 1 này vì accessToken đã nằm trong httpOnly cookie(xử lý từ BE) sau khi api refresh_token gọi thành công
      // originalRequests.headers.Authorization = `Bearer ${accessToken}`


      //Bước 2: bước quan trọng: return lại axios instance của chúng ta kết hợp các originalRequests để gọi lại nhưng api bân đầu bị lỗi
      return authorizedAxiosInstance(originalRequests)
    })
  }

  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết cod emột lần: Clean Code)
  // console.log error ra là sẽ thâý cấu trúc data dẫn tới message lỗi như dưới đây
  // console.log(error)
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