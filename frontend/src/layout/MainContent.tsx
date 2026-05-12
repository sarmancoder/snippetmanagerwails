import React from 'react'
import { drawerWidth } from '../config'
import { Box, Toolbar } from '@mui/material'

export default function MainContent({children}) {
    return (
        <Box sx={{
            position: 'fixed',
            left: drawerWidth,
            right: drawerWidth,
            bottom: 0,
            top: 0
        }}>
            <Toolbar />
            {children}
        </Box>
    )
}
