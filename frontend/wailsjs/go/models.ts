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

