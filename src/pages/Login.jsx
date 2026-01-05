import { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Error al iniciar sesión');
        }

        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ color: 'primary.main', fontWeight: 600 }}
                    >
                        Seguimiento de Colaboraciones
                    </Typography>
                    <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
                        Imputad malditos... v1.2
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }} autoComplete="off">
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
