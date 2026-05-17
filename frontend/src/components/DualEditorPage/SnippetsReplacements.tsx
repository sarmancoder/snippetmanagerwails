import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box, Divider, ListSubheader } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface Props {
    onReplace: (value: string) => void;
}

// Definimos las variables por categorías para que el menú sea usable
const SNIPPET_VARIABLES = [
    {
        label: 'Editor & Archivo',
        variables: [
            { id: 'TM_SELECTED_TEXT', desc: 'Texto seleccionado' },
            { id: 'TM_CURRENT_LINE', desc: 'Línea actual' },
            { id: 'TM_CURRENT_WORD', desc: 'Palabra bajo cursor' },
            { id: 'TM_LINE_INDEX', desc: 'Índice de línea (0)' },
            { id: 'TM_LINE_NUMBER', desc: 'Número de línea (1)' },
            { id: 'TM_FILENAME', desc: 'Nombre archivo' },
            { id: 'TM_FILENAME_BASE', desc: 'Nombre sin extensión' },
            { id: 'TM_DIRECTORY', desc: 'Directorio' },
            { id: 'TM_FILEPATH', desc: 'Ruta completa' },
            { id: 'RELATIVE_FILEPATH', desc: 'Ruta relativa' },
            { id: 'CLIPBOARD', desc: 'Portapapeles' },
        ]
    },
    {
        label: 'Workspace',
        variables: [
            { id: 'WORKSPACE_NAME', desc: 'Nombre workspace' },
            { id: 'WORKSPACE_FOLDER', desc: 'Ruta workspace' },
        ]
    },
    {
        label: 'Cursor',
        variables: [
            { id: 'CURSOR_INDEX', desc: 'Índice cursor (0)' },
            { id: 'CURSOR_NUMBER', desc: 'Número cursor (1)' },
        ]
    },
    {
        label: 'Fecha y Hora',
        variables: [
            { id: 'CURRENT_YEAR', desc: 'Año' },
            { id: 'CURRENT_YEAR_SHORT', desc: 'Año corto' },
            { id: 'CURRENT_MONTH', desc: 'Mes (02)' },
            { id: 'CURRENT_MONTH_NAME', desc: 'Mes nombre' },
            { id: 'CURRENT_DATE', desc: 'Día del mes' },
            { id: 'CURRENT_DAY_NAME', desc: 'Día nombre' },
            { id: 'CURRENT_HOUR', desc: 'Hora (24h)' },
            { id: 'CURRENT_MINUTE', desc: 'Minuto' },
            { id: 'CURRENT_SECOND', desc: 'Segundo' },
            { id: 'CURRENT_TIMEZONE_OFFSET', desc: 'Zona horaria' },
        ]
    }
];

export function SnippetsReplacements({ onReplace }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuClick = (varId: string) => {
        onReplace(`\${${varId}}`);
        handleClose();
    };

    return (
        <Box>
            <Button
            variant="contained"
            color="primary" // Forzamos el color principal de tu tema
            disableElevation
            size="small"
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon />}
        >
            Reemplazar
        </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: 400, // Limita el alto de forma correcta con scroll interno
                            width: '320px',
                        },
                    },
                }}
            >
                {SNIPPET_VARIABLES.map((group, idx) => [
                    idx > 0 && <Divider key={`div-${idx}`} />,
                    <ListSubheader key={`header-${idx}`} sx={{ lineHeight: '32px', bgcolor: 'background.paper' }}>
                        {group.label}
                    </ListSubheader>,
                    group.variables.map((v) => (
                        <MenuItem
                            key={v.id}
                            onClick={() => handleMenuClick(v.id)}
                            sx={{ justifyContent: 'space-between' }}
                        >
                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{v.id}</span>
                            <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{v.desc}</span>
                        </MenuItem>
                    ))
                ])}
            </Menu>
        </Box>
    );
}