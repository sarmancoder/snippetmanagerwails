import React from 'react'
import { drawerWidth } from '../config'
import { Box, colors, List, ListItem, ListItemButton, ListItemText, Toolbar, Button } from '@mui/material'
import { useAppContext } from '../AppSnippetsContext'
import confirmAction from '../utils/ConfirmAction'

export default function DrawerSnippets() {
    const { snippetsList, currentPathFile, saved, setsaved, saveSnippet, currentSnippetKey, setCurrentSnippetKey } = useAppContext()
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
                    <ListItemButton selected={currentSnippetKey == snippet.key} title={snippet.description} key={index} onClick={async () => {
                        if (!saved) {
                            const change = await confirmAction({
                                message: "¿Quieres salvar los cambios?",
                            })
                            if (change) await saveSnippet()
                            setsaved(true)
                        }
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
                    </ListItemButton>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }}></Box>
            <Button variant="contained" size='small' disabled={currentPathFile.length == 0} sx={{ margin: 1 }} color="primary">
                Añadir snippet
            </Button>
        </Box>
    )
}
