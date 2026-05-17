import { createTheme, CssBaseline, ScopedCssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";

const theme = createTheme({
  cssVariables: true,
});

export default function MyMuiThemeProvider({children}) {
  return (
    <StyledEngineProvider injectFirst>
      <ScopedCssBaseline>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>;
      </ScopedCssBaseline>
    </StyledEngineProvider>
  )
}