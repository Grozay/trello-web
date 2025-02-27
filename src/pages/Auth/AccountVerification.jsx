import { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { verifyUserAPI } from '~/apis'


const AccountVerification = () => {
  const [searchParams] = useSearchParams()
  // const email = searchParams.get('email')
  // const token = searchParams.get('token')
  const { email, token } = Object.fromEntries([...searchParams])

  //tạo một biến để lưu trữ trạng thái của việc xác thực tài khoản
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    if (email && token) {
      verifyUserAPI({ email, token }).then(() => {
        setIsVerified(true)
      })
    }
  }, [email, token])

  //gọi api để xác thực tài khoản

  //nếu url, có vấn đề, không tồn tại 1 trong 2 tham số email hoặc token, thì chuyển đến trang 404
  if (!email || !token) {
    return <Navigate to='/404' />
  }

  if (!isVerified) {
    return <PageLoadingSpinner caption='Verifying account...' />
  }

  //nếu đã xác thực tài khoản thành công, thì chuyển đến trang login

  return <Navigate to={`/login?registeredEmail=${email}`} />
}

export default AccountVerification