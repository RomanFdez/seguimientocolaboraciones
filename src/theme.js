import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#d32f2f', // Red for buttons and titles
        },
        secondary: {
            main: '#1976d2', // Blue accent
        },
        background: {
            default: '#f4f6f8',
            paper: '#ffffff',
        },
        // Status colors
        status: {
            nuevo: '#2196f3',      // Blue
            enCurso: '#4caf50',    // Green
            especial: '#ff9800',   // Orange
            enPausa: '#9e9e9e',    // Grey
            soporte: '#00bcd4',    // Cyan
            finalizado: '#607d8b', // Blue Grey
        },
        // Risk levels
        risk: {
            green: '#4caf50',
            orange: '#ff9800',
            red: '#f44336',
        },
        // Delivery types
        delivery: {
            estimated: '#2196f3',  // Blue
            new: '#ff9800',        // Orange
            actual: '#4caf50',     // Green
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
                elevation1: {
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.05), 0px 4px 5px 0px rgba(0,0,0,0.01), 0px 1px 10px 0px rgba(0,0,0,0.02)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

export default theme;
