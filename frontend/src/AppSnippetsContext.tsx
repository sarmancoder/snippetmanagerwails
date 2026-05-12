
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { EscribirArchivo, LeerArchivo } from '../wailsjs/go/main/AdministradorArchivos';
import confirmAction from './utils/ConfirmAction';
import { SnippetCreationObject } from './utils/CreateSnippet';

const MyContext = createContext<any>(null);

export type SnippetType = { body: string[], scope: string, description: string, prefix: string }
type SnippetArrayElem = SnippetType & { key: string }

function useFetchData() {
    const [currentPathFile, setCurrentPathFile] = useState('');
    const [currentPathContent, setCurrentPathContent] = useState('');
    const [snippetsList, setSnippetsList] = useState<SnippetArrayElem[]>([])
    const [currentSnippetKey, setCurrentSnippetKey] = useState('')
    const [saved, setsaved] = useState(true)
    const [snippetEditing, setSnippetEditing] = useState<SnippetType>({
        body: [],
        scope: '',
        description: '',
        prefix: ''
    })

    const activeSnippet = useMemo(() => {
        return snippetsList.find(a => a.key == currentSnippetKey)
    }, [currentSnippetKey])

    useEffect(() => {
        LeerArchivo(currentPathFile).then(r => {
            setCurrentPathContent(r)
            const data: Record<string, SnippetType> = JSON.parse(r)
            const snippetsArray = Object.keys(data).reduce<SnippetArrayElem[]>((acc, key) => {
                acc.push({ key, ...data[key] });
                return acc;
            }, []);
            setSnippetsList(snippetsArray);
        })
    }, [currentPathFile])

    async function saveSnippet() {
        // await saveList();
        console.log('guardando snippet')
        const newList = snippetsList.map(a => {
            if (a.key == currentSnippetKey) {
                console.log({snippetEditing})
                return {
                    ...snippetEditing,
                    key: a.key
                }
            }
            return a
        })
        console.log({newList})
        setSnippetsList(newList as any)
    }

    async function saveList() {
        const snippetObj = snippetsList.reduce((acc, { key, ...curr }) => {
            acc[key] = key == currentSnippetKey ? snippetEditing : curr;
            return acc;
        }, {});
        const jsonString = JSON.stringify(snippetObj, null, 4);
        console.log(snippetObj);
        await EscribirArchivo(currentPathFile, jsonString);
    }

    async function lookForSave() {
        console.log({saved})
        if (saved) return true
        const change = await confirmAction({
            message: "¿Quieres salvar los cambios?",
        })
        if (change == null) return false
        if (change == true) await saveSnippet()
        setsaved(true)
        return true
    }

    useEffect(() => void saveList(), [snippetsList])
    useEffect(() => {
        setCurrentSnippetKey('')
    }, [currentPathFile])

    return {
        currentPathFile, setCurrentPathFile,
        currentPathContent, setCurrentPathContent,
        snippetsList, saved, setsaved, activeSnippet,
        setCurrentSnippetKey, currentSnippetKey,
        snippetEditing, setSnippetEditing,
        saveSnippet, lookForSave,

        async insertSnippet(snippet: SnippetCreationObject) {
            const newSnippet = {
                ...snippet,
                key: snippet.prefix + new Date().getTime(),
                body: [],
                scope: ''
            }
            console.log('new snippet', newSnippet)
            const newSnippetList: typeof snippetsList = [...snippetsList, newSnippet]
            setSnippetsList(newSnippetList)
            setCurrentSnippetKey(newSnippet.key)
        }
    };
}

export default function AppContextProvider({ children }) {
    const data = useFetchData();
    return (
        <MyContext.Provider value={data}>
            {children}
        </MyContext.Provider>
    )
};

export function useAppContext() {
    const data = useContext<ReturnType<typeof useFetchData>>(MyContext);
    if (!data) throw new Error('useMyContext must be used within a MyProvider');
    return data;
}
