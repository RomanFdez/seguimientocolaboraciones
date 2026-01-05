import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, Container, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import { ArrowBack, Star, Edit } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { STATUSES, RISK_LEVELS } from '../utils/constants';
import { isCurrentMonth, formatDate } from '../utils/dateHelpers';

const CollaborationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCollaborationById, users } = useData();
    const { currentUser, isAdmin, isAnalista } = useAuth();
    const [collaboration, setCollaboration] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const result = await getCollaborationById(id);
            if (result.success) {
                setCollaboration(result.data);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) return <Box p={4}>Cargando...</Box>;
    if (!collaboration) return <Box p={4}>Colaboración no encontrada</Box>;

    const statusConfig = STATUSES.find(s => s.value === collaboration.status);

    const canEdit = collaboration && (isAdmin() || (isAnalista() && (
        !(collaboration.description?.attributes?.analistas) ||
        collaboration.description.attributes.analistas.length === 0 ||
        collaboration.description.attributes.analistas.includes(currentUser.uid)
    )));

    const currentUpdates = collaboration ? (collaboration.situation?.updates || []).filter(u => {
        if (!u.date) return false;
        try { return isCurrentMonth(new Date(u.date)); } catch { return false; }
    }) : [];

    const previousUpdates = collaboration ? (collaboration.situation?.updates || []).filter(u => {
        if (!u.date) return false;
        try { return !isCurrentMonth(new Date(u.date)); } catch { return false; }
    }) : [];

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 1 }}
            >
                Volver
            </Button>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                {/* Header Row */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                            {collaboration.title}
                        </Typography>
                    </Box>

                    {statusConfig && (
                        <Box sx={{
                            bgcolor: statusConfig.color,
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 10,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap'
                        }}>
                            {statusConfig.label}
                        </Box>
                    )}
                </Box>

                {/* Content Split: 85% Main / 15% Sidebar */}
                <Box sx={{ display: 'flex', gap: 4 }}>

                    {/* Main Content (85%) */}
                    <Box sx={{ width: '85%', flexShrink: 0 }}>
                        {/* Description */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                                DESCRIPCIÓN
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.875rem' }}>
                                {collaboration.description?.short || 'Sin descripción'}
                            </Typography>
                        </Box>

                        {/* Piezas / Tags */}
                        {collaboration.description?.piezas?.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                                    PIEZAS
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {collaboration.description.piezas.map((pieza, index) => (
                                        <Chip
                                            key={index}
                                            label={pieza}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 500,
                                                borderColor: 'rgba(0,0,0,0.2)'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        <Divider sx={{ my: 4 }} />

                        {/* Situation Section */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
                                SITUACIÓN
                            </Typography>

                            {/* Actual */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontWeight: 700, display: 'block' }}>
                                    Actual
                                </Typography>
                                {currentUpdates.length > 0 ? (
                                    <List dense disablePadding>
                                        {currentUpdates.map((update, index) => (
                                            <ListItem key={index} disableGutters sx={{ py: 0.5, px: 0, alignItems: 'flex-start' }}>
                                                <Box sx={{ mr: 1.5, minWidth: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary', mt: 1 }} />
                                                <ListItemText
                                                    primary={update.text}
                                                    primaryTypographyProps={{ variant: 'body1', sx: { lineHeight: 1.6 } }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                        No hay actualizaciones para este mes.
                                    </Typography>
                                )}
                            </Box>

                            {/* Anterior */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontWeight: 700, display: 'block' }}>
                                    Anterior
                                </Typography>
                                {previousUpdates.length > 0 ? (
                                    <List dense disablePadding>
                                        {previousUpdates.map((update, index) => (
                                            <ListItem key={index} disableGutters sx={{ py: 0.5, px: 0, alignItems: 'flex-start' }}>
                                                <Box sx={{ mr: 1.5, minWidth: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', mt: 1 }} />
                                                <ListItemText
                                                    primary={update.text}
                                                    secondary={formatDate(update.date)}
                                                    primaryTypographyProps={{ variant: 'body1', sx: { lineHeight: 1.6 } }}
                                                    secondaryTypographyProps={{ variant: 'caption', color: 'text.disabled' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                        Sin historial.
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Risks */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                                RIESGOS
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: RISK_LEVELS.find(r => r.value === (collaboration.risks?.level || 'green'))?.color || '#4caf50',
                                    mt: 0.8,
                                    flexShrink: 0
                                }} />
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.875rem' }}>
                                    {collaboration.risks?.summary || 'Sin riesgos identificados.'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Deliveries */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                                ENTREGAS
                            </Typography>
                            {(collaboration.deliveries || []).length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {(collaboration.deliveries || []).map((delivery, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, flexShrink: 0 }}>
                                                {formatDate(delivery.date)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {delivery.description || delivery.type || '-'}
                                            </Typography>
                                            {delivery.starType && (
                                                <Star sx={{
                                                    color: delivery.starType === 'estimated' ? '#2196f3' :
                                                        delivery.starType === 'actual' ? '#4caf50' :
                                                            delivery.starType === 'new' ? '#ff9800' : 'transparent'
                                                }} fontSize="small" />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    Sin entregas registradas.
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Sidebar Attributes (15%) */}
                    <Box sx={{ width: '15%', flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,0.05)', pl: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
                            DETALLES
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Tipo</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>{collaboration.type || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Operacional</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>{collaboration.description?.attributes?.operacional || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Responsable</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>{collaboration.description?.attributes?.responsable || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Área de Negocio</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>{collaboration.description?.attributes?.areaNegocio || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Jefe de Proyecto</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>{collaboration.description?.attributes?.jefeProyecto || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Analista</Typography>
                                <Box>
                                    {(collaboration.description?.attributes?.analistas || []).length > 0 ? (
                                        (collaboration.description.attributes.analistas || []).map(uid => {
                                            const user = users?.find(u => u.uid === uid);
                                            return (
                                                <Typography key={uid} variant="body2" fontWeight={500} sx={{ display: 'block', fontSize: '0.875rem' }}>
                                                    {user?.name || 'Usuario'}
                                                </Typography>
                                            );
                                        })
                                    ) : (
                                        <Typography variant="body2" fontWeight={500}>-</Typography>
                                    )}
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary">Fecha de necesidad</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>{collaboration.description?.attributes?.fechaNecesidad || '-'}</Typography>
                            </Box>
                        </Box>
                    </Box>

                </Box>
            </Paper>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mt: 2 }}
            >
                Volver
            </Button>
        </Container>
    );
};

export default CollaborationView;
