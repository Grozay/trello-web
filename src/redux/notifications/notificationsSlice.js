import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

//khởi tạo gía trị state của 1 cái slice trong redux
const initialState = {
  currentNotifications: null
}

//Các hành động gọi api (bất đồng bộ) và cập nhập dữ liệu vào redux, dùng middleware CreateAsyncThunk đi kèm với extraReducers

export const fetchInvitationsAPI = createAsyncThunk(
  'notifications/fetchInvitationsAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/invitations`)
    //lưu ý : axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)

export const updateBoardInvitationApi = createAsyncThunk(
  'notifications/updateBoardInvitationApi',
  async ({ status, invitationId }) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/invitations/board/${invitationId}`, { status })
    //lưu ý : axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)


//tạo ra 1 slice trong redux store
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  //reducers: nơi xử lí dữ liệu đồng bộ
  reducers: {
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null
    },
    updateCurrentNotifications: (state, action) => {
      state.currentNotifications = action.payload
    },
    //Thêm mới notification vào đầu mảng currentNotifications
    addNotification: (state, action) => {
      const incomingNotification = action.payload
      //unshift là thêm phần tử vào đầu mảng, ngược lại với push
      state.currentNotifications.unshift(incomingNotification)
    }
  },
  //extraReducers: nơi xử lí dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
      let incomingInvitations = action.payload
      //Đoạn này đảo ngược mảng invitations được nhận, đơn giản la fđể hiển thị cái mới nhất lên đầu
      state.currentNotifications = Array.isArray(incomingInvitations) ? incomingInvitations.reverse() : []
    })
    builder.addCase(updateBoardInvitationApi.fulfilled, (state, action) => {
      const incomingNotification = action.payload
      //Tìm vị trí của notification trong mảng currentNotifications
      const getInvitation = state.currentNotifications.find((i) => i._id === incomingNotification._id)
      getInvitation.boardInvitation = incomingNotification.boardInvitation
    })
  }
})

// Action creator are generated for each case reducer function
// Actions: là nơi dành cho các component bên dới gọi bằng dispatch() tới để cập nhập lai dữ liệu thông qua reduce (chạy đồng bộ)
//Để ý ở trên thì khong thấy được properties actions đâu cả, bởi vì nhưng cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé

export const {
  clearCurrentNotifications,
  updateCurrentNotifications,
  addNotification } = notificationsSlice.actions

//selector: là nơi cho các component lấy dữ liệu từ redux store
export const selectCurrentNotifications = (state) => {
  return state.notifications.currentNotifications
}

export const notificationsReducer = notificationsSlice.reducer
