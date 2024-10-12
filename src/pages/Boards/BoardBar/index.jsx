import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import AvatarGroup from '@mui/material/AvatarGroup'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const MENU_STYLE ={
  color: 'white',
  backgroundColor: 'transparent',
  borderRadius: '4px',
  border: 'none',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    backgroundColor: 'primary.50'
  }
}

const BoardBar = () => {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      overflowX: 'auto',
      borderBottom: '1px solid white',
      paddingX: 2,
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#24495e' : '#1976d2',
      '&::-webkit-scrollbar-track': { m: 1 }
    }}>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardIcon />}
          label="quyendev stack board"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label="Public/Private workspace"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Add to Google drive"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<BoltIcon />}
          label="Automations"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>

        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white'
            }
          }}
        >Invite</Button>

        <AvatarGroup sx={{
          gap: '10px',
          '& .MuiAvatar-root': {
            width: 34,
            height: 34,
            fontSize: 16,
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            '&:first-of-type': {
              backgroundColor: '#a4b0be',
            }
          }
        }} max={6}>
          <Avatar alt="Remy Sharp" src="https://avatars.githubusercontent.com/u/10354250?v=4" />
          <Avatar alt="Travis Howard" src="https://avatars.githubusercontent.com/u/10354250?v=4" />
          <Avatar alt="Cindy Baker" src="https://avatars.githubusercontent.com/u/10354250?v=4" />
          <Avatar alt="Cindy Baker" src="https://avatars.githubusercontent.com/u/10354250?v=4" />
          <Avatar alt="Cindy Baker" src="https://avatars.githubusercontent.com/u/10354250?v=4" />
          <Avatar alt="Cindy Baker" src="https://avatars.githubusercontent.com/u/10354250?v=4" />
          <Avatar alt="Cindy Baker" src="https://avatars.githubusercontent.com/u/10354250?v=4" />
          <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar