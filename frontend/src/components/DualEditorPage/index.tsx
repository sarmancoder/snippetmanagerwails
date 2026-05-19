import { Editor, OnMount } from '@monaco-editor/react';
import { Box, Card, CardContent, CardHeader, FormControlLabel, Switch, TextField } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import Select from "react-select";
import { SnippetType, useAppContext } from '../../AppSnippetsContext';
import { languageScopes, LanguageScopeValue } from '../../config';
import { SnippetsReplacements } from './SnippetsReplacements';

type SnippetState = {
    prefix: string
    description: string
    scope: string
    body: string
    isFileTemplate: boolean
}

type SnippetAction =
    | { type: 'SET_FIELD'; field: keyof SnippetState; value: SnippetState[keyof SnippetState] }
    | { type: 'RESET'; payload: SnippetState }

function snippetReducer(state: SnippetState, action: SnippetAction): SnippetState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value }
        case 'RESET':
            return action.payload
        default:
            return state
    }
}

const initialState: SnippetState = {
    prefix: '',
    description: '',
    scope: '',
    body: '',
    isFileTemplate: false,
}

export default function DualEditorPage() {
    const loadingSnippetRef = useRef(false)
    const { snippetsList, currentSnippetKey, activeSnippet, setSnippetEditing, setsaved } = useAppContext()

    const bodyEditor = useRef<any>(null)
    const jsonResultRef = useRef<any>(null)
    // 💡 Bandera para evitar que salte el setSaved(false) al cargar el snippet
    const isInitializing = useRef<boolean>(false) 

    const [state, dispatch] = useReducer(snippetReducer, initialState)
    const { prefix, description, scope, body, isFileTemplate } = state

    useEffect(() => {
        const snippetEditing: SnippetType = {
            isFileTemplate: state.isFileTemplate ?? false,
            description: state.description,
            body: state.body.split('\n'),
            prefix: state.prefix,
            scope: state.scope
        }
        if (jsonResultRef.current) {
            jsonResultRef.current.setValue(JSON.stringify(snippetEditing, null, 2))
        }

        if (!activeSnippet) return
        
        const snippetSaved: SnippetType = {
            isFileTemplate: activeSnippet.isFileTemplate ?? false,
            description: activeSnippet.description,
            body: activeSnippet.body,
            prefix: activeSnippet.prefix,
            scope: activeSnippet.scope
        }

        if (!loadingSnippetRef.current) {
            const equal = JSON.stringify(snippetEditing) == JSON.stringify(snippetSaved)
            console.log({equal, loading: loadingSnippetRef.current})
            if (!equal) {
                setsaved(false)
            } else {
                setsaved(true)
            }
        }

        setSnippetEditing(snippetEditing)
    }, [state])

    useEffect(() => {
        loadingSnippetRef.current = true
        const snippet = snippetsList.find(a => a.key == currentSnippetKey)
        if (!snippet) return

        // 💡 Activamos el flag de inicialización justo antes de resetear el estado local
        isInitializing.current = true;

        const resolvedScope = (snippet.scope ?? '').split(',').map(a => {
            return languageScopes.find(x => x.value == a)?.value
        }).join(',')

        dispatch({
            type: 'RESET',
            payload: {
                prefix: snippet.prefix ?? '',
                description: snippet.description ?? '',
                scope: resolvedScope,
                body: Array.isArray(snippet.body) ? snippet.body.join('\n') : '',
                isFileTemplate: (snippet as any).isFileTemplate ?? false,
            }
        })

        if (bodyEditor.current) {
            bodyEditor.current.setValue(Array.isArray(snippet.body) ? snippet.body.join('\n') : '')
        }
        loadingSnippetRef.current = false
    }, [currentSnippetKey])

    const handleLeftEditorDidMount: OnMount = (editor, monaco: any) => {
        bodyEditor.current = editor
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        })
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        })
    }

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        jsonResultRef.current = editor

        editor.onDidBlurEditorWidget(() => {
            try {
                const content = editor.getValue()
                const infoJSON = JSON.parse(content)

                dispatch({
                    type: 'RESET',
                    payload: {
                        prefix: infoJSON.prefix ?? '',
                        description: infoJSON.description ?? '',
                        scope: (infoJSON.scope ?? infoJSON.scopes ?? []).join?.(',') ?? infoJSON.scope ?? '',
                        body: (infoJSON.body ?? []).join('\n'),
                        isFileTemplate: infoJSON.isFileTemplate ?? false,
                    }
                })

                bodyEditor.current?.setValue((infoJSON.body ?? []).join('\n'))
            } catch { }
        })
    }

    const currentScope = useMemo<LanguageScopeValue>(() => {
        const _scope = scope.split(',')[0] as LanguageScopeValue
        if (_scope === 'javascriptreact') return 'javascript'
        if (_scope === 'typescriptreact') return 'typescript'
        if (_scope.length === 0) return 'plaintext' as any
        return _scope
    }, [scope])

    const handleReplaceSelection = (textToInsert: string) => {
        const editor = bodyEditor.current
        if (!editor) return
        const selections = editor.getSelections()

        if (selections?.length > 0) {
            editor.executeEdits('my-source', selections.map(sel => ({
                range: sel,
                text: textToInsert,
                forceMoveMarkers: true,
            })))
            editor.focus()
        }
    }

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5, p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Prefijo"
                    value={prefix}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'prefix', value: e.target.value })}
                />
                <TextField
                    fullWidth
                    label="Descripción"
                    value={description}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                />
                <FormControlLabel
                    label="Es una plantilla"
                    control={
                        <Switch
                            checked={isFileTemplate}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'isFileTemplate', value: e.target.checked })}
                        />
                    }
                />
                <Card variant="outlined">
                    <CardHeader
                        title="Contenido"
                        action={(
                            <Box>
                                <Select
                                    options={languageScopes}
                                    isMulti
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        container: (base) => ({ ...base, width: '400px' })
                                    }}
                                    value={languageScopes.filter(a => scope.split(',').includes(a.value))}
                                    onChange={(c) => dispatch({
                                        type: 'SET_FIELD',
                                        field: 'scope',
                                        value: c.map((a: any) => a.value).join(',')
                                    })}
                                />
                            </Box>
                        )}
                    />
                    <CardContent>
                        <Editor
                            language={currentScope}
                            theme="vs-dark"
                            height="350px"
                            onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'body', value: value || '' })}
                            onMount={handleLeftEditorDidMount}
                        />
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'end', p: 2, bgcolor: '#f5f5f5' }}>
                        <SnippetsReplacements onReplace={handleReplaceSelection} />
                    </CardActions>
                </Card>
            </Box>
            <Box>
                <Editor
                    language="json"
                    theme="vs-dark"
                    height="100%"
                    options={{ minimap: { enabled: false } }}
                    onMount={handleEditorDidMount}
                />
            </Box>
        </Box>
    )
}