import { Editor, OnMount } from '@monaco-editor/react'
import { Box, TextField } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

export default function DualEditorPage() {
    const bodyEditor = useRef<any>(null) // Guardaremos la instancia del editor aquí
    const jsonResultRef = useRef<any>(null) // Guardaremos la instancia del editor aquí

    const [prefix, setPrefix] = useState('')
    const [description, setDescription] = useState('')
    const [scopes, setScopes] = useState('')
    const [body, setBody] = useState('')

    const [jsonSnippet, setJsonSnippet] = useState({})

    const handleLeftEditorDidMount: OnMount = (editor, monaco) => {
        bodyEditor.current = editor
    }
    // Función que se ejecuta cuando el editor de la derecha se carga
    const handleEditorDidMount: OnMount = (editor, monaco) => {
        jsonResultRef.current = editor

        editor.onDidPaste(() => {
            const content = editor.getValue();
            const infoJSON = JSON.parse(content)
            setPrefix(infoJSON.prefix)
            setDescription(infoJSON.description)
            setBody(infoJSON.body.join('\n'))
            console.log(infoJSON.scopes ?? [])
            setScopes((infoJSON.scopes ?? []).join(','))
            bodyEditor.current.setValue((infoJSON.body ?? []).join('\n'))
        });
    }

    useEffect(() => {
        console.log('estableciendo')
        const newSnippet = {
            prefix, description, scopes,
            body: body.split('\n')
        }
        setJsonSnippet(newSnippet)

        // Actualizar el valor del editor directamente si la instancia existe
        if (jsonResultRef.current) {
            console.log('actualizando editor')
            const jsonString = JSON.stringify(newSnippet, null, 2)
            jsonResultRef.current.setValue(jsonString)
        }
    }, [prefix, description, scopes, body])

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 5,
            p: 4
        }}>
            {/* Columna Izquierda: Inputs */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                    fullWidth 
                    label="Prefijo" 
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)} 
                />
                <TextField
                    value={description}
                    fullWidth 
                    label="Descripción" 
                    onChange={(e) => setDescription(e.target.value)} 
                />
                <TextField 
                    value={scopes}
                    fullWidth 
                    label="Scopes" 
                    onChange={(e) => setScopes(e.target.value)} 
                />
                <Editor 
                    language={scopes.length == 0 ? 'plaintext' : scopes.split(',')[0]}
                    theme='vs-dark'
                    height={'200px'} 
                    onChange={(value) => setBody(value || '')}
                    onMount={handleLeftEditorDidMount}
                />
            </Box>

            {/* Columna Derecha: Resultado JSON */}
            <Box>
                <Editor 
                    language="json" // Cambiado a JSON para mejor resaltado
                    theme='vs-dark' 
                    height={'100%'} 
                    options={{ minimap: { enabled: false } }}
                    onMount={handleEditorDidMount}
                />
            </Box>
        </Box>
    )
}