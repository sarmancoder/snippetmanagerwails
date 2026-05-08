package main

import (
	"context"
	"os"
	"os/exec"
	"github.com/wailsapp/wails/v2/pkg/runtime" // Este es el de Wails
	goruntime "runtime"
)

// Estructura para devolver datos combinados al frontend
type ResultadoCarpeta struct {
	Ruta     string   `json:"ruta"`
	Archivos []string `json:"archivos"`
}

type AdministradorArchivos struct {
	ctx context.Context
}

func (f *AdministradorArchivos) SetContext(ctx context.Context) {
	f.ctx = ctx
}

func (f *AdministradorArchivos) SeleccionarYLeerCarpeta() (*ResultadoCarpeta, error) {
	// 1. Abrir selector de carpeta
	ruta, err := runtime.OpenDirectoryDialog(f.ctx, runtime.OpenDialogOptions{
		Title: "Seleccionar carpeta de Snippets",
	})

	if err != nil {
		return nil, err
	}

	if ruta == "" {
		return nil, nil // El usuario canceló
	}

	// 2. Leer los archivos
	entradas, err := os.ReadDir(ruta)
	if err != nil {
		return nil, err
	}

	var nombres []string
	for _, entrada := range entradas {
		nombres = append(nombres, entrada.Name())
	}

	// 3. Devolvemos el objeto con ambos datos
	return &ResultadoCarpeta{
		Ruta:     ruta,
		Archivos: nombres,
	}, nil
}

func (f *AdministradorArchivos) AbrirCarpetaEnExplorador(ruta string) {
	var cmd *exec.Cmd

	// Usamos el alias para que no choque con el runtime de Wails
	switch goruntime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", ruta)
	case "darwin":
		cmd = exec.Command("open", ruta)
	default: // Linux
		cmd = exec.Command("xdg-open", ruta)
	}

	if cmd != nil {
		cmd.Run()
	}
}