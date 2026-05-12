import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  cssVariables: true,
});

export default function MyMuiThemeProvider({children}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}