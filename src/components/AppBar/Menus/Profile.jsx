import { useState } from 'react'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser, logoutUserApi } from '~/redux/user/userSlice.js'
import { useConfirm } from 'material-ui-confirm'

const Profile = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const confirmLogout = useConfirm()

  const handleLogout = () => {
    confirmLogout({
      title: 'Are you sure you want to logout?',
      cancellationText: 'Cancel',
      confirmationText: 'Confirm'
    })
      .then(() => dispatch(logoutUserApi()))
      .catch(() => { })
  }
  return (
    <Box>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ p: 0 }}
          aria-controls={open ? 'basic-menu-profiles' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            sx={{ width: 36, height: 36 }}
            alt="profile"
            src={currentUser?.avatar}
          />
        </IconButton>
      </Tooltip>
      <Menu
        id="basic-menu-profiles"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-profiles'
        }}
      >
        <MenuItem sx={{
          '&:hover': {
            color: 'success.light'
          }
        }}>
          <Avatar sx={{ width: 28, height: 28, mr: 2 }} src={currentUser?.avatar} /> Profile
        </MenuItem>
        <Divider />
        <MenuItem >
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          Add another account
        </MenuItem>
        <MenuItem >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{
          '&:hover': {
            color: 'warning.dark',
            '& .logout-icon': {
              color: 'warning.dark'
            }
          }
        }}>
          <ListItemIcon >
            <Logout className='logout-icon' fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Profile