import { Editor, OnMount } from '@monaco-editor/react'
import { Box, Card, CardContent, CardHeader, TextField } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import Select from "react-select";
import { languageScopes } from '../../config';
import { SnippetType, useAppContext } from '../../AppSnippetsContext';
import { areSnippetsEqual, isEmptySnippet } from '../../utils';

export default function DualEditorPage() {
    const {snippetsList, currentSnippetKey, activeSnippet, setsaved} = useAppContext()

    const bodyEditor = useRef<any>(null)
    const jsonResultRef = useRef<any>(null)

    const [prefix, setPrefix] = useState('')
    const [description, setDescription] = useState('')
    const [scopes, setScopes] = useState('')
    const [body, setBody] = useState('')

    useEffect(() => {
        const newSnippet = {
            prefix, description, scopes,
            body: body.split('\n')
        }
        
        const currentSnippet = {body: body.split('\n'), scope: scopes, description, prefix}
        const areEqual = activeSnippet && !areSnippetsEqual(currentSnippet, activeSnippet as SnippetType)
        if (!isEmptySnippet(currentSnippet) && areEqual) {
            setsaved(false)
        }

        // Actualizar el valor del editor directamente si la instancia existe
        if (jsonResultRef.current) {
            const jsonString = JSON.stringify(newSnippet, null, 2)
            jsonResultRef.current.setValue(jsonString)
        }
    }, [prefix, description, scopes, body])

    useEffect(() => {
        const snippet = snippetsList.find(a => a.key == currentSnippetKey)
        if (!snippet) return
        setPrefix(snippet.prefix)
        setDescription(snippet.description)
        setScopes(snippet.scope.split(',').map(a => {
            return languageScopes.find(x => x.value == a)?.value
        }).join(','))
        setBody(snippet.body.join('\n'))

        // Establecemos el valor del editor Monaco que hay en bodyEditor
        if (bodyEditor.current) {
            bodyEditor.current.setValue(snippet.body.join('\n'));
        }
    }, [currentSnippetKey])

    // const [jsonSnippet, setJsonSnippet] = useState({})

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
            setScopes((infoJSON.scopes ?? []).join(','))
            bodyEditor.current.setValue((infoJSON.body ?? []).join('\n'))
        });
    }

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
                <Card variant="outlined">
                    <CardHeader title={'Contenido del snippet'}
                        action={(
                            <Box>
                                <Select
                                    options={languageScopes}
                                    isMulti
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        container: (base) => ({ ...base, width: '340px' })
                                    }}
                                    value={languageScopes.filter(a => scopes.split(',').includes(a.value))}
                                    onChange={(c) => setScopes(c.map((a: any) => a.value).join(','))}
                                />
                            </Box>
                        )}
                    />
                    <CardContent>
                        <Editor
                            language={scopes.length == 0 ? 'plaintext' : scopes.split(',')[0]}
                            theme='vs-dark'
                            height={'350px'}
                            onChange={(value) => setBody(value || '')}
                            onMount={handleLeftEditorDidMount}
                        />
                    </CardContent>
                </Card>
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