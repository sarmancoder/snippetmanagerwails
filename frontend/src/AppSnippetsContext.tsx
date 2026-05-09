
import { createContext, useContext, useEffect, useState } from 'react';
import { LeerArchivo } from '../wailsjs/go/main/AdministradorArchivos';

const MyContext = createContext<any>(null);

type SnippetType = { body: string[], scope: string, description: string, prefix: string }
type SnippetArrayElem = SnippetType & {key: string}

function useFetchData() {
    const [saved, setSaved] = useState(true)
    const [currentPathFile, setCurrentPathFile] = useState('');
    const [currentPathContent, setCurrentPathContent] = useState('');
    const [snippetsList, setSnippetsList] = useState<SnippetArrayElem[]>([])
    const [currentSnippetKey, setCurrentSnippetKey] = useState('')

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
        snippetsList, saved, setSaved,
        setCurrentSnippetKey, currentSnippetKey
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
