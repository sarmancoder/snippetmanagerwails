
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { EscribirArchivo, LeerArchivo } from '../wailsjs/go/main/AdministradorArchivos';
import { isEmptySnippet } from './utils';

const MyContext = createContext<any>(null);

export type SnippetType = { body: string[], scope: string, description: string, prefix: string }
type SnippetArrayElem = SnippetType & {key: string}

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

    return {
        currentPathFile, setCurrentPathFile,
        currentPathContent, setCurrentPathContent,
        snippetsList, saved, setsaved, activeSnippet,
        setCurrentSnippetKey, currentSnippetKey,
        snippetEditing, setSnippetEditing,
        async saveSnippet() {
            const snippetObj = snippetsList.reduce((acc, {key, ...curr}) => {
                acc[key] = key == currentSnippetKey ? snippetEditing : curr
                return acc
            }, {})
            const jsonString = JSON.stringify(snippetObj, null, 4);
            await EscribirArchivo(currentPathFile, jsonString)
            setSnippetsList(snippetsList.map(a => {
                if (a.key == currentSnippetKey) return snippetEditing
                return a
            }) as any)
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
