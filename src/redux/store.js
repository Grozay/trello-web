import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './acticeBoard/activeBoardSlice.js'
import { userReducer } from './user/userSlice.js'
import { activeCardReducer } from './activeCard/activeCardSlice.js'
import { notificationsReducer } from './notifications/notificationsSlice.js'
//config redux-persist
import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

//config persist
const rootPersistConfig = {
  key: 'root', //key của cái persist do chúng ta chỉ định, chứ để mặc định là root
  storage: storage, //biến storage ở trên - lưu vào localstorage
  whitelist: ['user'] //định nghĩa các slice dữ liệu được phép duy trì qua mỗi lần f5 trình duyệt

  // blacklist: ['user'] //định nghĩa các slice dữ liệu không được phép duy trì qua mỗi lần f5 trình duyệt
}

//combine các reducer trong dự án của chúng ta ở đây
const rootReducer = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
  activeCard: activeCardReducer,
  notifications: notificationsReducer
})

//persist các reducer trong dự án của chúng ta ở đây
const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

export default configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
})
