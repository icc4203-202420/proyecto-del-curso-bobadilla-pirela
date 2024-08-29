import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif'
    ].join(','), // Definiendo Roboto como la fuente principal
  },
  palette: {
    primary: {
      main: '#569de3',  // Un azul suave, cambia esto por el color que prefieras
    },
    secondary: {
      main: '#2369ad',  // Un verde suave, cambia esto por el color que prefieras
    },
    error: {
      main: '#ff1744',
    },
    background: {
      default: '#303030', // Color de fondo general
      paper: '#424242',   // Color de fondo para papel (opcional)
    },
    text: {
      primary: '#ffffff',  // Color para texto principal, blanco para contraste
      secondary: '#b0b0b0',  // Color para texto secundario
      link: '#1872cc',  // Puedes agregar esto para links
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          color: '#ffffff',  // Establece el color de la fuente a blanco
          backgroundColor: '#569de3',  // Cambia esto por el color que desees para la topbar
        },
      },
    },
  },
});

export default theme;