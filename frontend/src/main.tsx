import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AppContextProvider from './AppSnippetsContext'
import LayoutApp from './layout'
import './style.css'
import MyMuiThemeProvider from './components/MyMuiThemeProvider'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <AppContextProvider>
            <MyMuiThemeProvider>
                <LayoutApp>
                    <App />
                </LayoutApp>
            </MyMuiThemeProvider>
        </AppContextProvider>
    </React.StrictMode>
)
