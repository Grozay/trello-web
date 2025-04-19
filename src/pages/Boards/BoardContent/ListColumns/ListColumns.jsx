import { useState } from 'react'
import { Box } from '@mui/material'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'
import { createNewColumnAPI } from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatter'
import { cloneDeep } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/acticeBoard/activeBoardSlice'

const ListColumns = ({ columns }) => {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter column title', { position: 'bottom-right' })
      return
    }

    //Tạo dữ liệu để gọi api
    const newColumnData = {
      title: newColumnTitle
    }

    //Gọi API tạo mới column và làm lại dữ liệu State board
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

    //cập nhật lại state board

    //Đoạn này sẽ dính lỗi object is not extensible bởi dù đã copy/clone ra gía trị new board nhưng bản chất của spread operator là shallow copy/clone , nên dính phải rules immutability trong redux toolkit không dùng được hàm push (sửa giá trị mảng trực tiếp), cách đơn giản và nhanh gọn nhất ở trường hợp này là dùng deep copy/clone toàn bộ cái board cho dễ  hiểu và ngắn gọn.
    const newBoard = cloneDeep(board)
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)

    //Ngoài ra có cách dùng array.concat() nó gép 2 mảng lại với nhau nên không bị lỗi object is not extensible
    // const newBoard = { ...board }
    // newBoard.columns = newBoard.columns.concat(createdColumn)
    // newBoard.columnOrderIds = newBoard.columnOrderIds.concat(createdColumn._id)

    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi lên prop func createNewColumn nằm ở component cha cao nhất (Board.jsx, _id.jsx)
    //có thể dùng redux để lưu trữ các cột vào state global
    //Thì lúc naỳ chúng ta có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những component cha phía trên
    //Với việc sử dụng redux thì code sẽ clean hơn chuẩn chỉnh hơn rất là nhiều
    // await createNewColumn(newColumnData)

    toggleNewColumnForm()
    setNewColumnTitle('')
  }

  // thằng SortableContext yêu cầu items là một mảng dạng ['id-1', 'id-2'] chứ không phải [{id: 'id-1'}, {id: 'id-2'}]
  // nếu không đúng thì vẫn kéo thả được nhưng ko có animation
  // nên cần phải lấy các id của các cột
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        backgroundColor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {/* Box column */}
        {columns?.map(column => <Column key={column?._id} column={column} />)}

        {/* Add new column */}
        {!openNewColumnForm
          ? <Box onClick={toggleNewColumnForm} sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            backgroundColor: '#ffffff3d'
          }}>
            <Button
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
              startIcon={<NoteAddIcon />}
            >Add new column</Button>
          </Box>
          :
          <Box
            sx={{
              minWidth: '250px',
              maxWidth: '250px',
              mx: 2,
              p: 1,
              borderRadius: '6px',
              height: 'fit-content',
              backgroundColor: '#ffffff3d',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <TextField
              label="Enter column title..."
              type="text"
              size='small'
              variant='outlined'
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button className='interceptor-loading' variant='contained' color='success' size='small'
                onClick={addNewColumn}
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                }}
              >Add column</Button>
              <CloseIcon sx={{
                color: 'white',
                fontSize: 'medium',
                cursor: 'pointer',
                '&:hover': { color: (theme) => theme.palette.warning.light }
              }} onClick={toggleNewColumnForm} />
            </Box>
          </Box>
        }

      </Box>
    </SortableContext>
  )
}

export default ListColumns