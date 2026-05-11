import { Box, Button, Modal, SxProps, Typography } from '@mui/material';
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';

const style: SxProps = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: '10px'
};

// 1. Definimos qué datos EXTRAS le pasaremos nosotros (solo el mensaje)
interface AdditionalProps {
    message: string;
}

type ResponseType = boolean

// 2. El componente que recibe las props de react-confirm + las nuestras
// Usamos ConfirmDialogProps<Props_Que_Pasamos, Tipo_De_Respuesta>
const MyDialog = ({ show, proceed, message }: ConfirmDialogProps<AdditionalProps, ResponseType>) => {
    return (
        <Modal 
            open={show} 
            onClose={() => proceed(false)} // Si cierran el modal sin clickar botones
        >
            <Box sx={style}>
                <Typography variant='h6' component='h4'>
                    {message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 4 }}>
                    <Button variant="contained" color="error" onClick={() => proceed(false)}>
                        No
                    </Button>
                    <Button variant="contained" color="success" onClick={() => proceed(true)}>
                        Sí
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

// 3. LA CLAVE: confirmable(MyDialog) devuelve un componente que TS ya entiende 
// que no necesita recibir 'show' o 'proceed' externamente.
export const confirmAction = createConfirmation(confirmable(MyDialog));

export default confirmAction;