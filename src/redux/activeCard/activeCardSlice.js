import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  CurrentActiveCard: null
}

export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  reducers: {
    clearCurrentActiveCard: (state) => {
      state.CurrentActiveCard = null
    },

    updateCurrentActiveCard: (state, action) => {
      const fullCard = action.payload

      // Lưu lại data activeCard vào localStorage
      state.CurrentActiveCard = fullCard
    }
  },
  extraReducers: (builder) => {

  }
})

export const { clearCurrentActiveCard, updateCurrentActiveCard } = activeCardSlice.actions

export const selectCurrentActiveCard = (state) => state.activeCard.CurrentActiveCard

export const activeCardReducer = activeCardSlice.reducer