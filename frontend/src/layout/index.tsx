import MenuIcon from '@mui/icons-material/Menu';
import { colors } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const drawerWidth = '200px'

export default function LayoutApp({children}) {
    return (
        <div id='App'>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            AiSnippets
                        </Typography>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <Box sx={{
                bgcolor: colors.grey[300],
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: drawerWidth
            }}>
                <Toolbar />
                <p>drawer</p>
            </Box>
            <Box sx={{
                bgcolor: colors.grey[300],
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: drawerWidth
            }}>
                <Toolbar />
                <p>drawer drecha</p>
            </Box>
            <Box sx={{
                position: 'fixed',
                left: drawerWidth,
                right: drawerWidth,
                padding: 1,
                paddingTop: 3
            }}>
                <Toolbar />
                {children}
            </Box>
        </div>
    )
}

