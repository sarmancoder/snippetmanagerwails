import { Editor, OnMount } from '@monaco-editor/react';
import { Box, Card, CardContent, CardHeader, TextField } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import Select from "react-select";
import { useAppContext } from '../../AppSnippetsContext';
import { languageScopes, LanguageScopeValue } from '../../config';
import { SnippetsReplacements } from './SnippetsReplacements';
import CardActions from '@mui/material/CardActions';

export default function DualEditorPage() {
    const { snippetsList, currentSnippetKey, setSnippetEditing, activeSnippet, setsaved } = useAppContext()

    const bodyEditor = useRef<any>(null)
    const jsonResultRef = useRef<any>(null)

    const [prefix, setPrefix] = useState('')
    const [description, setDescription] = useState('')
    const [scope, setScope] = useState('')
    const [body, setBody] = useState('')
    useEffect(() => {
        console.log(scope)
    }, [scope])

    useEffect(() => {
        const newSnippet = {
            key: currentSnippetKey, prefix, description, scope,
            body: body.split('\n')
        }

        if (jsonResultRef.current) {
            const jsonString = JSON.stringify(newSnippet, null, 2)
            jsonResultRef.current.setValue(jsonString)
        }

        const snippetEditingFromList = snippetsList.find(a => a.key == currentSnippetKey)
        if (!currentSnippetKey) return

        const equal = JSON.stringify(snippetEditingFromList) == JSON.stringify(newSnippet)
        if (equal) return

        setsaved(false)
        setSnippetEditing({ prefix, description, scope, body: body.split('\n') })
    }, [prefix, description, scope, body])

    useEffect(() => {
        const snippet = snippetsList.find(a => a.key == currentSnippetKey)
        if (!snippet) return
        setPrefix(snippet.prefix)
        setDescription(snippet.description)
        setScope(snippet.scope.split(',').map(a => {
            return languageScopes.find(x => x.value == a)?.value
        }).join(','))
        setBody(snippet.body.join('\n'))

        // Establecemos el valor del editor Monaco que hay en bodyEditor
        if (bodyEditor.current) {
            bodyEditor.current.setValue(snippet.body.join('\n'));
        }
    }, [currentSnippetKey])

    // const [jsonSnippet, setJsonSnippet] = useState({})

    const handleLeftEditorDidMount: OnMount = (editor, monaco: any) => {
        bodyEditor.current = editor
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });

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
            setScope((infoJSON.scopes ?? []).join(','))
            bodyEditor.current.setValue((infoJSON.body ?? []).join('\n'))
        });
    }

    const currentScope = useMemo<LanguageScopeValue>(() => {
        const _scope = scope.split(',')[0] as LanguageScopeValue
        if (_scope === 'javascriptreact') {
            return 'javascript'
        } else if (_scope === 'typescriptreact') {
            return 'typescript'
        } else if (_scope.length == 0) {
            return 'plaintext' as any
        } else {
            return _scope
        }
    }, [scope])

    const handleReplaceSelection = (textToInsert) => {
        const editor = bodyEditor.current;
        if (!editor) return;

        // Obtenemos TODAS las selecciones actuales (soporta multicursor)
        const selections = editor.getSelections();

        if (selections && selections.length > 0) {
            // Creamos una operación de edición por cada selección
            const edits = selections.map(sel => ({
                range: sel,
                text: textToInsert,
                forceMoveMarkers: true,
            }));

            // Ejecutamos todas las ediciones en un solo paso
            // Esto permite que "Deshacer" (Ctrl+Z) revierta todos los cambios a la vez
            editor.executeEdits('my-source', edits);

            editor.focus();
        }
    };

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
                    <CardHeader title={'Contenido'}
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
                                    value={languageScopes.filter(a => scope.split(',').includes(a.value))}
                                    onChange={(c) => setScope(c.map((a: any) => a.value).join(','))}
                                />
                            </Box>
                        )}
                    />
                    <CardContent>
                        <Editor
                            language={currentScope}
                            theme='vs-dark'
                            height={'350px'}
                            onChange={(value) => setBody(value || '')}
                            onMount={handleLeftEditorDidMount}
                        />
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'end', p: 2, bgcolor: '#f5f5f5' }}>
                        <SnippetsReplacements onReplace={(value) => {
                            handleReplaceSelection(value)
                        }} />
                    </CardActions>
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
