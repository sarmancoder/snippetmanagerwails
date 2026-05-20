export namespace ia {
	
	export class SnippetState {
	    prefix: string;
	    description: string;
	    scope: string;
	    body: string[];
	    isFileTemplate: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SnippetState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.prefix = source["prefix"];
	        this.description = source["description"];
	        this.scope = source["scope"];
	        this.body = source["body"];
	        this.isFileTemplate = source["isFileTemplate"];
	    }
	}

}

export namespace main {
	
	export class ResultadoCarpeta {
	    ruta: string;
	    archivos: string[];
	
	    static createFrom(source: any = {}) {
	        return new ResultadoCarpeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ruta = source["ruta"];
	        this.archivos = source["archivos"];
	    }
	}

}

