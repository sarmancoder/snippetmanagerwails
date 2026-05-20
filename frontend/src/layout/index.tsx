import {Box} from '@mui/material';
import MyAppBar from './AppBar';
import DrawerFiles from './DrawerFiles';
import DrawerSnippets from './DrawerSnippets';
import MainContent from './MainContent';
import IAButton from '../components/IAButton';


export default function LayoutApp({children}) {
    return (
        <div id='App'>
            <Box sx={{ flexGrow: 1 }}>
                <MyAppBar />
            </Box>
            <DrawerFiles />
            <DrawerSnippets />
            <IAButton />
            <MainContent>
                {children}
            </MainContent>
        </div>
    )
}

