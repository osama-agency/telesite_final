// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AccountDetailsModern from './AccountDetailsModern'

const Account = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AccountDetailsModern />
      </Grid>
    </Grid>
  )
}

export default Account
