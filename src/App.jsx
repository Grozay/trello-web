import Board from '~/pages/Boards/_id'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import Settings from '~/pages/Settings/Settings'
import Boards from '~/pages/Boards'

//giải pháp clean Code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập sử dụng outlet để hiển thị các child route
const ProtectedRoute = ({ user }) => {
  if (!user) {
    return <Navigate to='/login' replace={true} />
  }
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <Routes>
      <Route path='/' element={
        // Ở đây cần replace gía trị true để nó thay thế route / , có thể hiểu là route / sẽ không nằm trong history của browser
        //Thực hành dễ hiểu hơn bằng cách nhấn go home từ trang 404 xong quay lại bằng nút back trình duyệt giữa 2 trường hợp có replace hoặc ko có
        <Navigate to='/boards' replace={true} />
      } />

      {/* Protected route (Hiểu đơn giản trong dự án của ta là nhưngx route chi  cho truy cập sau khi đã login) */}
      <Route element={<ProtectedRoute user={currentUser} />}>
        {/* Outlet sẽ chạy vào child của route trong này*/}
        {/* Board detail */}
        <Route path='/boards/:boardId' element={<Board />} />
        <Route path='/boards' element={<Boards />} />

        {/* user setting */}
        <Route path='/settings/account' element={<Settings />} />
        <Route path='/settings/security' element={<Settings />} />
      </Route>

      {/* Authentication */}
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />

      {/* 404 */}
      <Route path='*' element={<NotFound />}/>
    </Routes>
  )
}

export default App
