import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
// import { mockData } from '~/apis/mock-data'
import { fetchBoardDetailsAPI } from '~/apis'

const Board = () => {

  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '67259df8a47e42ae181c4c16'
    fetchBoardDetailsAPI(boardId)
      .then((board) => {
        setBoard(board)
      })
  }, [])

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} />
      {/* <BoardBar board={mockData?.board} />
      <BoardContent board={mockData?.board} /> */}
    </Container>
  )
}

export default Board