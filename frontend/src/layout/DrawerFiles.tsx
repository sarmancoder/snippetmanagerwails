import { Delete, Folder } from '@mui/icons-material'
import { Box, Button, colors, IconButton, Toolbar, Typography } from '@mui/material'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import React, { DragEventHandler, useRef, useState } from 'react'
import { AbrirCarpetaEnExplorador, EliminarArchivo, EscribirArchivo, SeleccionarYLeerCarpeta, UnirRutas } from '../../wailsjs/go/main/AdministradorArchivos'
import { useAppContext } from '../AppSnippetsContext'
import { drawerWidth, filesExtension } from '../config'
import { Paper, MenuList, MenuItem } from '@mui/material';
import promptUser from '../utils/PromptUser'
import alertMessage from '../utils/AlertMessage'
import clsx from 'clsx'

export default function DrawerFiles() {
    const { setCurrentPathFile, currentPathFile } = useAppContext()

    const [files, setfiles] = useState<string[]>([])
    const [pathFolder, setPathFolder] = useState('')

    const [draggingNew, setDraggingNew] = useState(false)


    const createNewFile = async (content = '{}') => {
        const response = await promptUser({
            message: 'Que nombre le quieres poner al archivo'
        })
        const fileName = response?.endsWith('.' + filesExtension) ? response : response + `.${filesExtension}`
        if (fileName == null) return
        if (files.find(a => a === fileName)) {
            await alertMessage({ message: 'El fichero existe' })
            return
        }
        const fullPath = await UnirRutas([pathFolder, fileName])
        console.log(fullPath)
        await EscribirArchivo(fullPath, content)
        setfiles([...files, fileName])
    }

    const handleDragOnEmpty = async (e) => {
        e.preventDefault()
        try {
            const data = e.dataTransfer.getData('text')
            if (!data) return
            console.log(data)
        } catch (error) {
            console.log(error)
        } finally {
            setDraggingNew(false)
        }
    }

    return (
        <Box sx={{
            bgcolor: colors.grey[300],
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Toolbar />
            <Box sx={{ display: 'flex', pt: 2 }}>
                <IconButton aria-label="" onClick={async () => {
                    const r = await SeleccionarYLeerCarpeta()
                    setfiles(r.archivos)
                    setPathFolder(r.ruta)
                }}>
                    <Folder />
                </IconButton>
                <Typography title={pathFolder} variant="subtitle2" color="initial"
                    onClick={() => AbrirCarpetaEnExplorador(pathFolder)}
                    sx={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,      // Aquí defines el máximo de líneas
                        overflow: 'hidden',      // Oculta el texto que sobrepasa las 2 líneas
                        wordBreak: "break-all",  // Útil para rutas largas sin espacios
                        cursor: 'pointer',
                        overflowWrap: "anywhere"
                    }}>
                    {pathFolder}
                </Typography>
            </Box>
            <MenuList dense sx={{pb: 0}}>
                {files.map((item) =>
                    <SnippetMenuItem key={item}
                        isSelected={currentPathFile.endsWith(item)} item={item}
                        onClick={() => setCurrentPathFile(pathFolder + '/' + item)}
                        onDelete={async () => {
                            await EliminarArchivo(
                                await UnirRutas([pathFolder, item])
                            )
                            setfiles([...files.filter(f => f !== item)])
                            setCurrentPathFile('')
                        }}

                        handleDropSnippet={(data) => {
                            console.log('droppint snippet on', item)
                            console.log(data)
                        }}
                    />
                )}
            </MenuList>
            <Box className={clsx('droppable-newfile', { 'active': draggingNew })} style={{ flexGrow: 1 }}
                onDrop={handleDragOnEmpty}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDraggingNew(true)}
                onDragLeave={() => setDraggingNew(false)}
            ></Box>
            <Button
                variant="contained" disableElevation size='small'
                disabled={pathFolder.length == 0} sx={{ margin: 1 }} color="primary"
                onClick={async () => {
                    createNewFile()
                }}

            >
                Añadir archivo
            </Button>
        </Box>
    )
}

type SnippetMenuItemProps = {
    isSelected: boolean,
    item: string,
    onClick: () => void
    onDelete: () => void
    handleDropSnippet: (snippet: string) => void
}

function SnippetMenuItem({ item, isSelected, onClick, onDelete, handleDropSnippet }: SnippetMenuItemProps) {
    const fileName = item.replace('.' + filesExtension, '');
    const [droppingSnippet, setDroppingSnippet] = useState(false);
    const dragCounter = useRef(0);

    return (
        <MenuItem 
            key={item} 
            selected={isSelected}
            onClick={onClick}
            className={clsx('droppable-newfile', { 'active': droppingSnippet })}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
                e.preventDefault();
                dragCounter.current++;
                if (dragCounter.current === 1) {
                    setDroppingSnippet(true);
                }
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                dragCounter.current--;
                if (dragCounter.current === 0) {
                    setDroppingSnippet(false);
                }
            }}
            onDrop={(e) => { 
                e.preventDefault();
                if (isSelected) return;
                dragCounter.current = 0; // Reseteamos el contador
                setDroppingSnippet(false);
                
                const data = e.dataTransfer.getData('text');
                handleDropSnippet(data); 
            }}
        >
            <ListItemText primary={fileName} />

            <IconButton
                size="small"
                onClick={async (e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                sx={{ ml: 1 }}
            >
                {/* Tu icono de borrar */}
            </IconButton>
        </MenuItem>
    );
}
