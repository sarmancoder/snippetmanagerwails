import { Delete, Folder } from '@mui/icons-material'
import { Box, Button, colors, IconButton, Toolbar, Typography } from '@mui/material'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useState } from 'react'
import { AbrirCarpetaEnExplorador, EscribirArchivo, SeleccionarYLeerCarpeta, UnirRutas } from '../../wailsjs/go/main/AdministradorArchivos'
import { useAppContext } from '../AppSnippetsContext'
import { drawerWidth, filesExtension } from '../config'
import { Paper, MenuList, MenuItem} from '@mui/material';
import promptUser from '../utils/PromptUser'
import alertMessage from '../utils/AlertMessage'

export default function DrawerFiles() {
    const { setCurrentPathFile, currentPathFile } = useAppContext()

    const [files, setfiles] = useState<string[]>([])
    const [pathFolder, setPathFolder] = useState('')

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
            <MenuList dense>
                {files.map((item) => {
                    const isSelected = currentPathFile.endsWith(item);
                    const fileName = item.replace('.' + filesExtension, '');

                    return (
                        <MenuItem
                            key={item}
                            selected={isSelected}
                            onClick={() => setCurrentPathFile(pathFolder + '/' + item)}
                        >
                            <ListItemText
                                primary={fileName}
                            />

                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Borrar:', item);
                                }}
                                sx={{
                                    ml: 1,
                                    p: 0.5,
                                    color: isSelected ? 'inherit' : 'error.main',
                                    // Solo mostrar el botón al hacer hover sobre el MenuItem
                                    visibility: 'hidden',
                                    '.MuiMenuItem-root:hover &': { visibility: 'visible' }
                                }}
                            >
                                <Delete fontSize="inherit" />
                            </IconButton>
                        </MenuItem>
                    );
                })}
            </MenuList>
            <Box sx={{ flexGrow: 1 }}></Box>
            <Button
                variant="contained" disableElevation size='small'
                disabled={pathFolder.length == 0} sx={{ margin: 1 }} color="primary"
                onClick={async () => {
                    const response = await promptUser({
                        message: 'Que nombre le quieres poner al archivo'
                    })
                    const fileName = response?.endsWith('.' + filesExtension) ? response : response + `.${filesExtension}`
                    if (fileName == null) return
                    if (files.find(a => a === fileName)) {
                        await alertMessage({message: 'El fichero existe'})
                        return
                    }
                    const fullPath = await UnirRutas([pathFolder, fileName])
                    console.log(fullPath)
                    await EscribirArchivo(fullPath, '{}')
                    setfiles([...files, fileName])
                }}

            >
                Añadir archivo
            </Button>
        </Box>
    )
}
