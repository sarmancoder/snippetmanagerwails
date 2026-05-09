import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { drawerWidth } from '../config';
import MyAppBar from './AppBar';
import DrawerFiles from './DrawerFiles';
import DrawerSnippets from './DrawerSnippets';


export default function LayoutApp({children}) {
    return (
        <div id='App'>
            <Box sx={{ flexGrow: 1 }}>
                <MyAppBar />
            </Box>
            <DrawerFiles />
            <DrawerSnippets />
            <Box sx={{
                position: 'fixed',
                left: drawerWidth,
                right: drawerWidth,
                padding: 1,
                paddingTop: 3
            }}>
                <Toolbar />
                {children}
            </Box>
        </div>
    )
}

