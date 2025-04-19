import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  CurrentActiveCard: null,
  isShowModalActiveCard: false
}

export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  reducers: {
    clearAndHideModalActiveCard: (state) => {
      state.CurrentActiveCard = null
      state.isShowModalActiveCard = false
    },

    updateCurrentActiveCard: (state, action) => {
      const fullCard = action.payload

      // Lưu lại data activeCard vào localStorage
      state.CurrentActiveCard = fullCard
    },
    showModalActiveCard: (state) => {
      state.isShowModalActiveCard = true
    }
  }
  // extraReducers: (builder) => {

  // }
})

export const { clearAndHideModalActiveCard, updateCurrentActiveCard, showModalActiveCard } = activeCardSlice.actions

export const selectCurrentActiveCard = (state) => state.activeCard.CurrentActiveCard

export const selectIsShowModalActiveCard = (state) => state.activeCard.isShowModalActiveCard

export const activeCardReducer = activeCardSlice.reducer