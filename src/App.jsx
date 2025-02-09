import Board from '~/pages/Boards/_id'
import { Routes, Route, Navigate } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'

function App() {
  return (
    <Routes>
      <Route path='/' element={
        // Ở đây cần replace gía trị true để nó thay thế route / , có thể hiểu là route / sẽ không nằm trong history của browser
        //Thực hành dễ hiểu hơn bằng cách nhấn go home từ trang 404 xong quay lại bằng nút back trình duyệt giữa 2 trường hợp có replace hoặc ko có
        <Navigate to='/boards/67259df8a47e42ae181c4c16' replace={true} />
      } />
      {/* Board detail */}
      <Route path='/boards/:boardId' element={<Board />} />

      {/* Authentication */}
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />

      {/* 404 */}
      <Route path='*' element={<NotFound />}/>
    </Routes>
  )
}

export default App
