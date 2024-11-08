import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

// tất cả các function chỉ lấy resquest ở data luôn mà không try catch  hay bắt lỗi gì
//lý do vì phía FE ko cần thiết phải làm như vậy vì catch nhièu quá nó bị thừa khi catch quá nhiều
//chúng ta có giải pháp clean code hơn là dùng interceptor để bắt lỗi tập trung nằm giữa  request và response để xử lí logic mà chúng ta muốn

export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  // axios trả về là 1 object có 2 thuộc tính: data và status
  return response.data
}

//column
export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

//card
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}
