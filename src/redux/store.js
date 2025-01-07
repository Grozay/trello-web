import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './acticeBoard/activeBoardSlice.js'

export default configureStore({
  reducer: {
    activeBoard: activeBoardReducer
  }
})
