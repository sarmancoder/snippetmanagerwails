import { Box, Button, colors, IconButton, List, ListItemButton, ListItemText, Toolbar } from '@mui/material'
import { useAppContext } from '../AppSnippetsContext'
import { drawerWidth } from '../config'
import createSnippet from '../utils/CreateSnippet'
import { Delete } from '@mui/icons-material'

export default function DrawerSnippets() {
    const { snippetsList, currentPathFile, lookForSave, insertSnippet, deleteSnippet, currentSnippetKey, setCurrentSnippetKey } = useAppContext()
    return (
        <Box sx={{
            bgcolor: colors.grey[300],
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Toolbar />
            <List>
                {snippetsList.map((snippet, index) => (
                    <ListItemButton draggable={true} onDragStart={(e) => {
                        const data = JSON.stringify(snippet, null, 4)
                        e.dataTransfer.setData('text', data)
                    }} className='list-item' selected={currentSnippetKey == snippet.key} title={snippet.description} key={index} onClick={async () => {
                        if (!(await lookForSave())) return
                        setCurrentSnippetKey(snippet.key)
                    }}>
                        <ListItemText primary={snippet.prefix} secondary={
                            <span style={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                                overflow: 'hidden',
                                wordBreak: "break-all",
                                cursor: 'pointer',
                                overflowWrap: "anywhere"
                            }}>
                                {snippet.description}
                            </span>
                        } />
                        <IconButton className='list-item__action'>
                            <Delete sx={{color: 'red'}} onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                deleteSnippet(snippet.key)
                            }} />
                        </IconButton>
                    </ListItemButton>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }}></Box>
            <Button variant="contained" size='small' disableElevation disabled={currentPathFile.length == 0} sx={{ margin: 1 }} color="primary" onClick={async () => {
                if (!(await lookForSave())) return
                const snippet = await createSnippet({})
                if (snippet == null) return;
                await insertSnippet(snippet)
            }}>
                Añadir snippet
            </Button>
        </Box>
    )
}
