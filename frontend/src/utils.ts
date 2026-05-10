import { SnippetType } from "./AppSnippetsContext";

export function isEmptySnippet(snippet: SnippetType): boolean {
    return snippet.body.length === 0 && !snippet.description && !snippet.prefix;
}

export function areSnippetsEqual(snippet1: SnippetType, snippet2: SnippetType): boolean {
    return (
        snippet1.prefix === snippet2.prefix &&
        snippet1.description === snippet2.description &&
        JSON.stringify(snippet1.body) === JSON.stringify(snippet2.body)
    );
}