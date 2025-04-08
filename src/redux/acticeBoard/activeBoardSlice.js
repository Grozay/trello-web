import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatter'
//khởi tạo gía trị state của 1 cái slice trong redux
const initialState = {
  currentActiveBoard: null
}

//Các hành động gọi api (bất đồng bộ) và cập nhập dữ liệu vào redux, dùng middleware CreateAsyncThunk đi kèm với extraReducers

export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    return response.data
  }
)

//tạo ra 1 slice trong redux store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  //reducers: nơi xử lí dữ liệu đồng bộ
  reducers: {
    //lưu ý luôn là ở đây cần một cặp ngoặc nhọn {} để định nghĩa các hàm reducer dù chỉ là 1 dòng, đây là rule của redux
    updateCurrentActiveBoard: (state, action) => {
      //action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có nghĩa hơn
      const board = action.payload

      //xử lí dữ liệu nếu cần thiết..
      //....

      //update lại dữ liệu của currentActiveBoard
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      //update nested data
      const incomingCard = action.payload
      //Tìm dần từ board - column - card
      const column = state.currentActiveBoard.columns.find(column => column._id === incomingCard.columnId)
      if (column) {
        const card = column.cards.find(i => i._id === incomingCard._id)
        if ( card ) {
          // card.title = incomingCard.title

          // Giải thích đoạn dưới, các bạn mới lần đầu sẽ đẽ bị lú
          //đơn giản là ldùng Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một array rồi forEach nó ra
          // Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn khônng thfi cập nhập ngược lại gái trị vào card luôn như bên dưới
          Object.keys(incomingCard).forEach(key => {
            card[key] = incomingCard[key]
          })
        }
      }
    }
  },
  //extraReducers: nơi xử lí dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      //action.payload là dữ liệu trả về từ axios call api
      let board = action.payload

      // thành viên trong cái board sẽ là gộp lại của 2 cái mảng owners và members
      board.FE_allUsers = board.owners.concat(board.members)

      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      //update lại dữ liệu của currentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

//actions : là nơi cho các component dispatch các action để cập nhập lại dữ liệu thông qua reducer(chạy đồng bộ)
//Để ý ở trên thì không thấy property actions ở đâu cả, bởi vì những cái action này nó đơn giản là được thằng redux tự động tạo theo tên reducer.

export const { updateCurrentActiveBoard, updateCardInBoard } = activeBoardSlice.actions

//selector: là nơi cho các component lấy dữ liệu từ redux store
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

export const activeBoardReducer = activeBoardSlice.reducer
