import { Box, Typography } from '@mui/material';
import { useAppContext } from './AppSnippetsContext';
import DualEditorPage from './components/DualEditorPage';
import { useMemo } from 'react';

function App() {
    const {currentSnippetKey} = useAppContext()
    const isSnippetSelected = useMemo(() => {
        return currentSnippetKey.length == 0
    }, [currentSnippetKey])
    return (
        <Box sx={{height: '100%'}}>
            <Box sx={{
                display: isSnippetSelected ? 'none' : 'block',
                padding: 1,
                paddingTop: 3
            }}>
                <DualEditorPage />
            </Box>
            <Box sx={{
                display: !isSnippetSelected ? 'none' : 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            }}>
                <Typography variant="h3" color="initial">
                    Seleccione un snippet para empezar
                </Typography>
            </Box>
        </Box>
    )
}

export default App
