import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material";

const theme = createTheme({
  cssVariables: true,
});

export default function MyMuiThemeProvider({children}) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>;
    </StyledEngineProvider>
  )
}