import { useColorScheme } from '@mui/material'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'


function ModeSelect() {
  const { mode, setMode } = useColorScheme()
  const handleChange = (event) => {
    setMode(event.target.value)
  }
  return (
    <Box sx={{ m: 1, maxWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="label-select-dark-light-mode">Mode</InputLabel>
        <Select
          labelId="label-select-dark-light-mode"
          id="select-dark-light-mode"
          value={mode}
          label="mode"
          onChange={handleChange}
          sx={{
            height: '35px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <MenuItem value="dark">
            <Box sx={{ display: 'flex', textAlign: 'center', gap: 1 }}>
              <DarkModeIcon fontSize='small' /> Dark
            </Box>
          </MenuItem>
          <MenuItem value="light">
            <Box sx={{ display: 'flex', textAlign: 'center', gap: 1 }}>
              <LightModeIcon fontSize='small' /> Light
            </Box>
          </MenuItem>
          <MenuItem value="system">
            <Box sx={{ display: 'flex', textAlign: 'center', gap: 1 }}>
              <SettingsBrightnessIcon fontSize='small' /> System
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default ModeSelect

