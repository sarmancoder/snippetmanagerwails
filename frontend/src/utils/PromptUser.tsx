import { Box, Button, Card, CardActions, CardContent, CardHeader, Modal, SxProps, TextField } from '@mui/material';
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

type ResponseType = null | string

const MyDialog = ({ show, proceed, message }: ConfirmDialogProps<AdditionalProps, ResponseType>) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log('fd response', formData.get('value'))
        proceed(formData.get('value') as string);
    };

    return (
        <Modal
            open={show}
            onClose={() => proceed(null)}
        >
            <Box sx={style}>
                <Card elevation={0}>
                    <CardHeader title={message} />
                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <TextField name="value" fullWidth autoFocus />
                        </CardContent>
                        <CardActions sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 4 }}>
                            <Button type="submit" variant="contained" disableElevation>
                                Enviar
                            </Button>
                        </CardActions>
                    </form>
                </Card>
            </Box>
        </Modal>
    );
};

// 3. LA CLAVE: confirmable(MyDialog) devuelve un componente que TS ya entiende 
// que no necesita recibir 'show' o 'proceed' externamente.
export const promptUser = createConfirmation(confirmable(MyDialog));

export default promptUser;