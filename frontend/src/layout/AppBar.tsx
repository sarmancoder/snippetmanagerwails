import { Save } from '@mui/icons-material';
import { Box, colors, IconButton } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../AppSnippetsContext';

export default function MyAppBar() {
    const {saved, setsaved, saveSnippet} = useAppContext()
    return (
        <AppBar elevation={0} position="fixed">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    AiSnippets
                </Typography>
                <Box sx={{display: 'flex', gap: 2}}>
                    <IconButton sx={{color: saved ? 'white' : colors.red[700]}} onClick={async () => {
                        await saveSnippet()
                        await setsaved(true)
                    }}>
                        <Save />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    )
}
