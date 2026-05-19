import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Card, CardActions, CardContent, CardHeader, IconButton } from '@mui/material';
import { Folder } from '@mui/icons-material';
import { GetVSCodePath, LoadLastDirectory, SeleccionarYLeerCarpeta } from '../../wailsjs/go/main/AdministradorArchivos';
import { useAppContext } from '../AppSnippetsContext';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400
};

export default function OpenFolderButton({ setfiles, setPathFolder }) {
    const {setSnippetsList, setCurrentPathFile} = useAppContext()
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const abrirCarpeta = async (dir: string) => {
        try {
            // Pasamos 'dir' a Go. Si es "", Go debe decidir si abrir Dialog o usar LastPath
            console.log(dir)
            const r = await SeleccionarYLeerCarpeta(dir ?? '')
            if (r) {
                setfiles(r.archivos || [])
                setPathFolder(r.ruta || '')
                setCurrentPathFile('')
                setSnippetsList([])
            }
        } catch (error) {
            console.error("Error al abrir carpeta:", error)
        }
    }

    React.useEffect(() => {
        // Al arrancar, pedimos la última ruta guardada
        LoadLastDirectory().then((dir) => {
            // Llamamos a abrirCarpeta con el resultado (asegurando un string)
            abrirCarpeta(dir || '')
        })
    }, [])

    return (
        <div>
            <IconButton onClick={handleOpen}>
                <Folder />
            </IconButton>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Card>
                        <CardHeader title="Abrir carpeta" />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                <Button variant='contained' disableElevation onClick={async () => {
                                    await abrirCarpeta('')
                                    handleClose()
                                }}>Seleccionar carpeta</Button>
                                <Button variant='contained' disableElevation onClick={async () => {
                                    const vscodePath = await GetVSCodePath()
                                    await abrirCarpeta(vscodePath)
                                    handleClose()
                                }}>VSCode</Button>
                            </Box>
                        </CardContent>
                        <CardActions sx={{ display: 'flex', justifyContent: 'end' }}>
                            <Button variant='text' onClick={handleClose}>Cerrar</Button>
                        </CardActions>
                    </Card>
                </Box>
            </Modal>
        </div>
    );
}
