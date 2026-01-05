import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    Button
} from '@mui/material';
import { useData } from '../context/DataContext';
import { STATUSES } from '../utils/constants';
import LoadSampleDataButton from '../components/LoadSampleDataButton';

const Home = () => {
    const { collaborations, loading, updateCollaboration } = useData();
    const navigate = useNavigate();

    // Calculate counts by status
    const statusCounts = useMemo(() => {
        const counts = {};
        STATUSES.forEach(status => {
            counts[status.value] = collaborations.filter(
                collab => collab.status === status.value
            ).length;
        });
        return counts;
    }, [collaborations]);

    const handleStatusClick = (status) => {
        navigate(`/gantt?status=${status}`);
    };



    if (loading) {
        return (
            <Container>
                <Typography>Cargando...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Resumen de Colaboraciones
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Vista general del estado de las colaboraciones
                    </Typography>
                </Box>

            </Box>

            {/* Botón temporal para cargar datos de ejemplo */}
            {collaborations.length === 0 && (
                <Paper sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
                    <LoadSampleDataButton />
                </Paper>
            )}

            <Grid container spacing={3}>
                {STATUSES.map((status) => (
                    <Grid item xs={12} sm={6} md={4} key={status.value}>
                        <Card
                            sx={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                                borderTop: `4px solid ${status.color}`,
                            }}
                            onClick={() => handleStatusClick(status.value)}
                        >
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{ color: status.color, fontWeight: 600 }}
                                >
                                    {status.label}
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {statusCounts[status.value] || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {statusCounts[status.value] === 1 ? 'colaboración' : 'colaboraciones'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Total de Colaboraciones (sin cancelados)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {collaborations.filter(c => c.status !== 'Cancelados').length}
                </Typography>
            </Paper>
        </Container>
    );
};

export default Home;
