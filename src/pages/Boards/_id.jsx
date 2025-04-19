import { useEffect } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/acticeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
import { useParams } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'

const Board = () => {
  const dispatch = useDispatch()
  const { boardId } = useParams()
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)
  useEffect(() => {
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])

  // const createNewColumn = async (newColumnData) => {
  // }


  //func này có nhiệm vụ gọi API và xử lí kéo thả column hoàn chỉnh
  const moveColumns = (dndOrderedColumns) => {
    //cập nhập chuẩn dữ liệu state board
    const dndColumnOrderIds = dndOrderedColumns.map(c => c._id)

    //Đoạn này sẽ không dính lỗi vì nó giống như concat() ở trên, nó gép 2 mảng lại với nhau nên không bị lỗi object is not extensible
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndColumnOrderIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))


    //gọi API update lại cột
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndColumnOrderIds })
  }

  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)

    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))


    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    const dndColumnOrderIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndColumnOrderIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))


    let prevCardOrderIds = dndOrderedColumns.find(column => column._id === prevColumnId)?.cardOrderIds
    //Xử lí vấn đề khi kéo card cuối cùng của column
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    //gọi API update lại cái card
    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(column => column._id === nextColumnId)?.cardOrderIds
    })
  }

  if (!board) {
    return <PageLoadingSpinner caption='Loading Board...' />
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {/* Model active card, check đóng/mở dựa theo cái state isShowModalActiveCard trong redux */}
      <ActiveCard />
      {/* Các thành phân còn lại của board Details */}
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board