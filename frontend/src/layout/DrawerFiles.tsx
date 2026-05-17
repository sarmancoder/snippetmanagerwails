import { Delete, Folder } from '@mui/icons-material'
import { Box, Button, colors, IconButton, MenuItem, MenuList, Toolbar, Typography } from '@mui/material'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { AbrirCarpetaEnExplorador, AgregarSnippet, EliminarArchivo, EscribirArchivo, LoadLastDirectory, SeleccionarYLeerCarpeta, UnirRutas } from '../../wailsjs/go/main/AdministradorArchivos'
import { useAppContext } from '../AppSnippetsContext'
import { drawerWidth, filesExtension } from '../config'
import alertMessage from '../utils/AlertMessage'
import confirmAction from '../utils/ConfirmAction'
import promptUser from '../utils/PromptUser'

export default function DrawerFiles() {
    const { setCurrentPathFile, currentPathFile, currentSnippetKey, setCurrentSnippetKey, deleteSnippet } = useAppContext()

    const [files, setfiles] = useState<string[]>([])
    const [pathFolder, setPathFolder] = useState('')

    const [draggingNew, setDraggingNew] = useState(false)

    const abrirCarpeta = async (dir: string) => {
        try {
            // Pasamos 'dir' a Go. Si es "", Go debe decidir si abrir Dialog o usar LastPath
            console.log(dir)
            const r = await SeleccionarYLeerCarpeta(dir ?? '')
            if (r) {
                setfiles(r.archivos || [])
                setPathFolder(r.ruta || '')
            }
        } catch (error) {
            console.error("Error al abrir carpeta:", error)
        }
    }

    useEffect(() => {
        // Al arrancar, pedimos la última ruta guardada
        LoadLastDirectory().then((dir) => {
            // Llamamos a abrirCarpeta con el resultado (asegurando un string)
            abrirCarpeta(dir || '')
        })
    }, [])


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
        console.log('escribiendo archivo', fullPath, content)
        await EscribirArchivo(fullPath, content)
        setfiles([...files, fileName])
        return true
    }

    const handleDragOnEmpty = async (e) => {
        e.preventDefault()
        try {
            const data = e.dataTransfer.getData('text')
            if (!data) return
            const created = await createNewFile(data)
            if (created !== true) return
            const dataJSON = JSON.parse(data)
            const snippetKey = dataJSON[Object.keys(dataJSON)[0]].key
            console.log('limpiando...', JSON.parse(data))
            if (currentSnippetKey == snippetKey)
                setCurrentSnippetKey('')
            deleteSnippet(snippetKey)
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
            <div className="bg-purple-500 text-white p-4">
  Tailwind funciona
</div>
            <Box sx={{ display: 'flex', pt: 2 }}>
                <IconButton aria-label="abrir" onClick={() => abrirCarpeta('')}>
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
            <MenuList dense sx={{ pb: 0 }}>
                {files.map((item) =>
                    <FileMenuItem key={item}
                        isSelected={currentPathFile.endsWith(item)} item={item}
                        onClick={() => setCurrentPathFile(pathFolder + '/' + item)}
                        onDelete={async () => {
                            await EliminarArchivo(
                                await UnirRutas([pathFolder, item])
                            )
                            setfiles([...files.filter(f => f !== item)])
                            setCurrentPathFile('')
                        }}
                        handleDropSnippet={async (data) => {
                            const dataJSON = JSON.parse(data)
                            const snippet = dataJSON[Object.keys(dataJSON)[0]]

                            await AgregarSnippet(await UnirRutas([pathFolder, item]), JSON.stringify(snippet))

                            const snippetKey = snippet.key
                            console.log('limpiando...', JSON.parse(data))
                            if (currentSnippetKey == snippetKey)
                                setCurrentSnippetKey('')
                            deleteSnippet(snippetKey)
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

type FileMenuItemProps = {
    isSelected: boolean,
    item: string,
    onClick: () => void
    onDelete: () => void
    handleDropSnippet: (snippet: string) => void
}

function FileMenuItem({ item, isSelected, onClick, onDelete, handleDropSnippet }: FileMenuItemProps) {
    const fileName = item.replace('.' + filesExtension, '');
    const [droppingSnippet, setDroppingSnippet] = useState(false);
    const dragCounter = useRef(0);

    return (
        <MenuItem
            key={item}
            selected={isSelected}
            onClick={onClick}
            className={clsx('droppable-newfile list-item', { 'active': droppingSnippet })}
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
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="subtitle1" color="initial">{fileName}</Typography>

                <IconButton
                    className='list-item__action'
                    size="small"
                    onClick={async (e) => {
                        e.stopPropagation();
                        const confirmed = await confirmAction({
                            message: '¿Seguro que quieres borrar el archivo?'
                        })
                        if (!confirmed) return
                        onDelete();
                    }}
                    sx={{ ml: 1 }}
                >
                    <Delete sx={{ color: 'red' }} />
                </IconButton>
            </Box>
        </MenuItem>
    );
}
