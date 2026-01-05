import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Button, Container, Chip, List, ListItem, ListItemText, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel, IconButton, Menu, MenuItem, Select, FormControl, InputLabel,
    Alert, Snackbar, CircularProgress
} from '@mui/material';
import { ArrowBack, AddCircle, Delete, Edit, Save, Close, Star } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { STATUSES, RISK_LEVELS, PIEZAS, COLLABORATION_TYPES } from '../utils/constants';
import { isCurrentMonth, formatDate } from '../utils/dateHelpers';

const CollaborationEdit = () => {
    const { id } = useParams();
    const isNew = !id || id === 'nuevo';
    const navigate = useNavigate();
    const { getCollaborationById, updateCollaboration, createCollaboration, users } = useData();
    const [collaboration, setCollaboration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Dialog States
    const [piezasDialogOpen, setPiezasDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [riskMenuAnchor, setRiskMenuAnchor] = useState(null);

    // Temp State for Dialogs
    const [tempUpdate, setTempUpdate] = useState('');
    const [editingUpdateIndex, setEditingUpdateIndex] = useState(null);
    const [editingDeliveryIndex, setEditingDeliveryIndex] = useState(null);
    const [tempDelivery, setTempDelivery] = useState({ date: new Date().toISOString().split('T')[0], description: '', starType: '' });

    // Validation state
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            if (isNew) {
                setCollaboration({
                    title: "",
                    status: "Nuevo",
                    type: "Estratégico",
                    description: {
                        short: "",
                        piezas: [],
                        attributes: {
                            operacional: "NSE",
                            responsable: "",
                            areaNegocio: "",
                            jefeProyecto: "",
                            analistas: [],
                            fechaNecesidad: "",
                        },
                    },
                    situation: {
                        updates: [],
                    },
                    risks: {
                        level: "green",
                        description: "",
                        summary: ""
                    },
                    deliveries: [],
                    years: [new Date().getFullYear()]
                });
            } else {
                const result = await getCollaborationById(id);
                if (result.success) {
                    setCollaboration(result.data);
                }
            }
            setLoading(false);
        };
        load();
    }, [id, isNew, getCollaborationById]);

    // Handle final save to DB
    const handleFinalSave = async () => {
        if (!collaboration) return;

        // Validation
        const newErrors = {};
        if (!collaboration.title?.trim()) newErrors.title = 'El título es obligatorio';
        if (!collaboration.status) newErrors.status = 'El estado es obligatorio';
        if (!collaboration.type) newErrors.type = 'El tipo es obligatorio';

        // At least one analyst is usually required in this project
        const analistas = collaboration.description?.attributes?.analistas || [];
        if (analistas.length === 0) newErrors.analistas = 'Debe haber al menos un analista asignado';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSnackbar({ open: true, message: 'Por favor, rellena los campos obligatorios', severity: 'error' });
            return;
        }

        setSaving(true);
        setErrors({});

        let result;
        if (isNew) {
            result = await createCollaboration(collaboration);
        } else {
            result = await updateCollaboration(collaboration.id, collaboration);
        }

        setSaving(false);

        if (result.success) {
            setSnackbar({ open: true, message: `¡Colaboración ${isNew ? 'creada' : 'guardada'} correctamente!`, severity: 'success' });
            if (isNew) {
                setTimeout(() => navigate(`/colaboraciones/${result.id}/editar`), 1000);
            }
        } else {
            console.error('Error de Firebase:', result.error);
            setSnackbar({ open: true, message: 'Error al guardar: ' + (result.error || 'Error desconocido'), severity: 'error' });
        }
    };

    const handleRemovePieza = (pieza) => {
        const current = collaboration?.description?.piezas || [];
        const newPiezas = current.filter(p => p !== pieza);
        setCollaboration({
            ...collaboration,
            description: { ...(collaboration?.description || {}), piezas: newPiezas }
        });
    };

    const handleDeleteUpdate = (originalIndex) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta actualización?")) return;
        const currentUpdates = [...(collaboration?.situation?.updates || [])];
        currentUpdates.splice(originalIndex, 1);
        setCollaboration({
            ...collaboration,
            situation: { ...(collaboration?.situation || {}), updates: currentUpdates }
        });
    };

    const handleSaveUpdateDialog = () => {
        const currentUpdates = [...(collaboration?.situation?.updates || [])];
        if (editingUpdateIndex !== null) {
            currentUpdates[editingUpdateIndex] = { ...(currentUpdates[editingUpdateIndex] || {}), text: tempUpdate };
        } else {
            currentUpdates.unshift({ date: new Date().toISOString(), text: tempUpdate });
        }
        setCollaboration({
            ...collaboration,
            situation: { ...(collaboration?.situation || {}), updates: currentUpdates }
        });
        setUpdateDialogOpen(false);
        setEditingUpdateIndex(null);
        setTempUpdate('');
    };

    const openAddUpdateDialog = () => {
        setEditingUpdateIndex(null);
        setTempUpdate('');
        setUpdateDialogOpen(true);
    };

    const openEditUpdateDialog = (originalIndex, text) => {
        setEditingUpdateIndex(originalIndex);
        setTempUpdate(text);
        setUpdateDialogOpen(true);
    };

    const openAddDeliveryDialog = () => {
        setEditingDeliveryIndex(null);
        setTempDelivery({ date: new Date().toISOString().split('T')[0], description: '', starType: '' });
        setDeliveryDialogOpen(true);
    };

    const openEditDeliveryDialog = (index, delivery) => {
        setEditingDeliveryIndex(index);
        setTempDelivery({
            date: delivery?.date?.toDate ? delivery.date.toDate().toISOString().split('T')[0] : new Date(delivery?.date || new Date()).toISOString().split('T')[0],
            description: delivery?.description || delivery?.type || '',
            starType: delivery?.starType || ''
        });
        setDeliveryDialogOpen(true);
    };

    const handleSaveDeliveryDialog = () => {
        let updatedList = [...(collaboration?.deliveries || [])];
        const newDeliveryObj = {
            date: new Date(tempDelivery.date).toISOString(),
            description: tempDelivery.description,
            starType: tempDelivery.starType || ''
        };
        if (editingDeliveryIndex !== null) {
            updatedList[editingDeliveryIndex] = newDeliveryObj;
        } else {
            updatedList.push(newDeliveryObj);
        }
        updatedList.sort((a, b) => {
            const dateA = a?.date?.toDate ? a.date.toDate() : new Date(a?.date || 0);
            const dateB = b?.date?.toDate ? b.date.toDate() : new Date(b?.date || 0);
            return dateA - dateB;
        });
        setCollaboration({ ...collaboration, deliveries: updatedList });
        setDeliveryDialogOpen(false);
        setEditingDeliveryIndex(null);
        setTempDelivery({ date: new Date().toISOString().split('T')[0], description: '', starType: '' });
    };

    const handleDeleteDelivery = (index) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta entrega?")) return;
        const currentDeliveries = [...(collaboration?.deliveries || [])];
        currentDeliveries.splice(index, 1);
        setCollaboration({ ...collaboration, deliveries: currentDeliveries });
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (!collaboration) return <Box p={4}>Colaboración no encontrada</Box>;

    const availableAnalysts = (Array.isArray(users) ? users : []).filter(user => {
        if (!user) return false;
        const roles = user.roles || (user.role ? [user.role] : []) || [];
        return Array.isArray(roles) && (roles.includes('analista') || roles.includes('admin'));
    });

    const allUpdates = (collaboration?.situation?.updates || []).map((u, i) => ({ ...u, originalIndex: i }));
    const currentUpdates = allUpdates.filter(u => {
        if (!u?.date) return false;
        try {
            const d = u.date.toDate ? u.date.toDate() : new Date(u.date);
            return isCurrentMonth(d);
        } catch { return false; }
    });
    const previousUpdates = allUpdates.filter(u => {
        if (!u?.date) return false;
        try {
            const d = u.date.toDate ? u.date.toDate() : new Date(u.date);
            return !isCurrentMonth(d);
        } catch { return false; }
    });

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                >
                    Volver
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    onClick={handleFinalSave}
                    disabled={saving}
                    sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                    {saving ? 'Guardando...' : 'Guardar Colaboración'}
                </Button>
            </Box>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                {/* Header Row */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
                    <TextField
                        fullWidth
                        multiline
                        variant="standard"
                        label="Título"
                        error={!!errors.title}
                        helperText={errors.title}
                        value={collaboration?.title || ''}
                        onChange={(e) => {
                            setCollaboration({ ...collaboration, title: e.target.value });
                            if (errors.title) setErrors({ ...errors, title: null });
                        }}
                        placeholder="Título de la colaboración"
                        InputProps={{
                            sx: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }
                        }}
                    />

                    <FormControl error={!!errors.status}>
                        <Select
                            size="small"
                            value={collaboration?.status || ''}
                            onChange={(e) => {
                                setCollaboration({ ...collaboration, status: e.target.value });
                                if (errors.status) setErrors({ ...errors, status: null });
                            }}
                            renderValue={(selected) => STATUSES.find(s => s.value === selected)?.label || selected}
                            sx={{
                                bgcolor: STATUSES.find(s => s.value === (collaboration?.status))?.color || '#9e9e9e',
                                color: 'white',
                                borderRadius: 10,
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                '& .MuiSelect-icon': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                minWidth: 120
                            }}
                        >
                            {STATUSES.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: status.color, mr: 1, display: 'inline-block' }} />
                                    {status.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.status && <Typography variant="caption" color="error">{errors.status}</Typography>}
                    </FormControl>
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
                            <TextField
                                fullWidth
                                multiline
                                variant="standard"
                                value={collaboration?.description?.short || ''}
                                onChange={(e) => setCollaboration({
                                    ...collaboration,
                                    description: { ...(collaboration?.description || {}), short: e.target.value }
                                })}
                                placeholder="Añade una descripción breve de la colaboración..."
                                inputProps={{ sx: { fontSize: '0.875rem', lineHeight: 1.6 } }}
                            />
                        </Box>

                        {/* Piezas / Etiquetas */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    PIEZAS / ETIQUETAS
                                </Typography>
                                <IconButton size="small" onClick={() => setPiezasDialogOpen(true)}>
                                    <AddCircle color="error" fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {(collaboration?.description?.piezas || []).length > 0 ? (
                                    collaboration.description.piezas.map((pieza, index) => (
                                        <Chip
                                            key={index}
                                            label={pieza}
                                            size="small"
                                            variant="outlined"
                                            onDelete={() => handleRemovePieza(pieza)}
                                            sx={{ borderRadius: 1.5 }}
                                        />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                        No hay piezas seleccionadas.
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Situation */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    SITUACIÓN
                                </Typography>
                                <IconButton size="small" onClick={openAddUpdateDialog}>
                                    <AddCircle color="error" fontSize="small" />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Current Month Updates */}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Mes Actual
                                    </Typography>
                                    {currentUpdates.length > 0 ? (
                                        <List disablePadding>
                                            {currentUpdates.map((update) => (
                                                <ListItem
                                                    key={update.originalIndex}
                                                    disablePadding
                                                    sx={{
                                                        mb: 1.5,
                                                        alignItems: 'flex-start',
                                                        '&:hover .update-actions': { opacity: 1 }
                                                    }}
                                                >
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, mr: 2, flexShrink: 0 }} />
                                                    <ListItemText
                                                        primary={update.text}
                                                        primaryTypographyProps={{ variant: 'body2', sx: { lineHeight: 1.6 } }}
                                                    />
                                                    <Box className="update-actions" sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex', ml: 1 }}>
                                                        <IconButton size="small" onClick={() => openEditUpdateDialog(update.originalIndex, update.text)}>
                                                            <Edit fontSize="inherit" />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteUpdate(update.originalIndex)}>
                                                            <Delete fontSize="inherit" />
                                                        </IconButton>
                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', pl: 3 }}>
                                            Sin actualizaciones este mes.
                                        </Typography>
                                    )}
                                </Box>

                                {/* Previous Updates */}
                                {previousUpdates.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Anteriores
                                        </Typography>
                                        <List disablePadding>
                                            {previousUpdates.map((update) => (
                                                <ListItem
                                                    key={update.originalIndex}
                                                    disablePadding
                                                    sx={{
                                                        mb: 1,
                                                        alignItems: 'flex-start',
                                                        '&:hover .update-actions': { opacity: 1 }
                                                    }}
                                                >
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.disabled', mt: 1, mr: 2, flexShrink: 0 }} />
                                                    <ListItemText
                                                        primary={update.text}
                                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', sx: { lineHeight: 1.6 } }}
                                                    />
                                                    <Box className="update-actions" sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex', ml: 1 }}>
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteUpdate(update.originalIndex)}>
                                                            <Delete fontSize="inherit" />
                                                        </IconButton>
                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Risks */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                                RIESGOS
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box
                                    onClick={(e) => setRiskMenuAnchor(e.currentTarget)}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: RISK_LEVELS.find(r => r.value === (collaboration?.risks?.level || 'green'))?.color || '#4caf50',
                                        mt: 1.5,
                                        flexShrink: 0,
                                        cursor: 'pointer',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                />
                                <Menu
                                    anchorEl={riskMenuAnchor}
                                    open={Boolean(riskMenuAnchor)}
                                    onClose={() => setRiskMenuAnchor(null)}
                                >
                                    {RISK_LEVELS.map((level) => (
                                        <MenuItem
                                            key={level.value}
                                            onClick={() => {
                                                setCollaboration({ ...collaboration, risks: { ...(collaboration?.risks || {}), level: level.value } });
                                                setRiskMenuAnchor(null);
                                            }}
                                        >
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: level.color, mr: 1 }} />
                                            {level.label}
                                        </MenuItem>
                                    ))}
                                </Menu>
                                <TextField
                                    fullWidth
                                    multiline
                                    variant="standard"
                                    value={collaboration?.risks?.summary || ''}
                                    onChange={(e) => setCollaboration({
                                        ...collaboration,
                                        risks: { ...(collaboration?.risks || {}), summary: e.target.value }
                                    })}
                                    placeholder="Describe los riesgos o bloqueos actuales..."
                                    inputProps={{ sx: { fontSize: '0.875rem', lineHeight: 1.6 } }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Deliveries */}
                        <Box sx={{ mt: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    ENTREGAS
                                </Typography>
                                <IconButton size="small" onClick={openAddDeliveryDialog}>
                                    <AddCircle color="error" fontSize="small" />
                                </IconButton>
                            </Box>
                            {(collaboration?.deliveries || []).length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {(collaboration?.deliveries || []).map((delivery, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, flexShrink: 0 }}>
                                                {formatDate(delivery?.date)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {delivery?.description || delivery?.type || '-'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {delivery?.starType && (
                                                    <Star sx={{
                                                        color: delivery?.starType === 'estimated' ? '#2196f3' :
                                                            delivery?.starType === 'actual' ? '#4caf50' :
                                                                delivery?.starType === 'new' ? '#ff9800' : 'transparent',
                                                        mr: 0.5
                                                    }} fontSize="small" />
                                                )}
                                                <IconButton size="small" onClick={() => openEditDeliveryDialog(index, delivery)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteDelivery(index)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
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

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {/* Tipo */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Tipo</Typography>
                                <Select
                                    fullWidth
                                    variant="standard"
                                    error={!!errors.type}
                                    value={collaboration?.type || ''}
                                    onChange={(e) => {
                                        setCollaboration({ ...collaboration, type: e.target.value });
                                        if (errors.type) setErrors({ ...errors, type: null });
                                    }}
                                    sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                                >
                                    {COLLABORATION_TYPES.map(t => (
                                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            {/* Operacional */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Operacional</Typography>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    value={collaboration?.description?.attributes?.operacional || ''}
                                    onChange={(e) => setCollaboration({
                                        ...collaboration,
                                        description: {
                                            ...(collaboration?.description || {}),
                                            attributes: { ...(collaboration?.description?.attributes || {}), operacional: e.target.value }
                                        }
                                    })}
                                    inputProps={{ sx: { fontWeight: 500, fontSize: '0.875rem' } }}
                                />
                            </Box>

                            {/* Responsable */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Responsable</Typography>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    value={collaboration?.description?.attributes?.responsable || ''}
                                    onChange={(e) => setCollaboration({
                                        ...collaboration,
                                        description: {
                                            ...(collaboration?.description || {}),
                                            attributes: { ...(collaboration?.description?.attributes || {}), responsable: e.target.value }
                                        }
                                    })}
                                    inputProps={{ sx: { fontWeight: 500, fontSize: '0.875rem' } }}
                                />
                            </Box>

                            {/* Área de Negocio */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Área de Negocio</Typography>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    value={collaboration?.description?.attributes?.areaNegocio || ''}
                                    onChange={(e) => setCollaboration({
                                        ...collaboration,
                                        description: {
                                            ...(collaboration?.description || {}),
                                            attributes: { ...(collaboration?.description?.attributes || {}), areaNegocio: e.target.value }
                                        }
                                    })}
                                    inputProps={{ sx: { fontWeight: 500, fontSize: '0.875rem' } }}
                                />
                            </Box>

                            {/* Jefe de Proyecto */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Jefe de Proyecto</Typography>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    value={collaboration?.description?.attributes?.jefeProyecto || ''}
                                    onChange={(e) => setCollaboration({
                                        ...collaboration,
                                        description: {
                                            ...(collaboration?.description || {}),
                                            attributes: { ...(collaboration?.description?.attributes || {}), jefeProyecto: e.target.value }
                                        }
                                    })}
                                    inputProps={{ sx: { fontWeight: 500, fontSize: '0.875rem' } }}
                                />
                            </Box>

                            {/* Analista (Multi-Select) */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Analista(s)</Typography>
                                <Select
                                    multiple
                                    fullWidth
                                    variant="standard"
                                    error={!!errors.analistas}
                                    value={collaboration?.description?.attributes?.analistas || []}
                                    onChange={(e) => {
                                        const values = e.target.value;
                                        setCollaboration({
                                            ...collaboration,
                                            description: {
                                                ...(collaboration?.description || {}),
                                                attributes: { ...(collaboration?.description?.attributes || {}), analistas: values }
                                            }
                                        });
                                        if (errors.analistas) setErrors({ ...errors, analistas: null });
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(Array.isArray(selected) ? selected : []).map((value) => {
                                                const u = availableAnalysts.find(user => user.uid === value);
                                                return <Chip key={value} label={u?.name || value} size="small" />;
                                            })}
                                        </Box>
                                    )}
                                    sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                                >
                                    {availableAnalysts.map((user) => (
                                        <MenuItem key={user.uid} value={user.uid}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            {/* Fecha Necesidad */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Fecha Necesidad</Typography>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    value={collaboration?.description?.attributes?.fechaNecesidad || ''}
                                    onChange={(e) => setCollaboration({
                                        ...collaboration,
                                        description: {
                                            ...(collaboration?.description || {}),
                                            attributes: { ...(collaboration?.description?.attributes || {}), fechaNecesidad: e.target.value }
                                        }
                                    })}
                                    placeholder="Libre (ej. Marzo, 15/05...)"
                                    inputProps={{ sx: { fontWeight: 500, fontSize: '0.875rem' } }}
                                />
                            </Box>

                            {/* Años (Multi-Select) */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Años</Typography>
                                <Select
                                    multiple
                                    fullWidth
                                    variant="standard"
                                    value={collaboration?.years || []}
                                    onChange={(e) => {
                                        const values = e.target.value;
                                        setCollaboration({ ...collaboration, years: values });
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(Array.isArray(selected) ? selected : []).map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                    sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                                >
                                    {[2024, 2025, 2026].map((year) => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        </Box>
                    </Box>

                </Box>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                >
                    Volver
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleFinalSave}
                        disabled={saving}
                        sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </Box>
            </Box>

            {/* Piezas Selection Dialog */}
            <Dialog open={piezasDialogOpen} onClose={() => setPiezasDialogOpen(false)}>
                <DialogTitle>Gestionar Piezas</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1 }}>
                        {PIEZAS.map(pieza => {
                            const isChecked = (collaboration?.description?.piezas || []).includes(pieza);
                            return (
                                <FormControlLabel
                                    key={pieza}
                                    control={
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const current = collaboration?.description?.piezas || [];
                                                let newPiezas;
                                                if (e.target.checked) {
                                                    newPiezas = [...current, pieza];
                                                } else {
                                                    newPiezas = current.filter(p => p !== pieza);
                                                }
                                                setCollaboration({
                                                    ...collaboration,
                                                    description: { ...(collaboration?.description || {}), piezas: newPiezas }
                                                });
                                            }}
                                        />
                                    }
                                    label={pieza}
                                />
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPiezasDialogOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUpdateIndex !== null ? 'Editar Actualización' : 'Nueva Actualización'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={4}
                        value={tempUpdate}
                        onChange={(e) => setTempUpdate(e.target.value)}
                        inputProps={{ maxLength: 150 }}
                        helperText={`${tempUpdate.length}/150`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveUpdateDialog} variant="contained" disabled={!tempUpdate.trim()}>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delivery Dialog */}
            <Dialog open={deliveryDialogOpen} onClose={() => setDeliveryDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDeliveryIndex !== null ? 'Editar Entrega' : 'Nueva Entrega'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Fecha"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={tempDelivery.date}
                            onChange={(e) => setTempDelivery({ ...tempDelivery, date: e.target.value })}
                        />
                        <TextField
                            label="Descripción"
                            fullWidth
                            multiline
                            rows={2}
                            value={tempDelivery.description}
                            onChange={(e) => setTempDelivery({ ...tempDelivery, description: e.target.value })}
                            inputProps={{ maxLength: 75 }}
                            helperText={`${tempDelivery.description.length}/75`}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Hito en Gantt (Opcional)</InputLabel>
                            <Select
                                value={tempDelivery.starType || ''}
                                label="Hito en Gantt (Opcional)"
                                onChange={(e) => setTempDelivery({ ...tempDelivery, starType: e.target.value })}
                            >
                                <MenuItem value="">Sin estrella</MenuItem>
                                <MenuItem value="estimated">Fecha estimada (Azul)</MenuItem>
                                <MenuItem value="actual">Fecha real (Verde)</MenuItem>
                                <MenuItem value="new">Nueva entrega prevista (Naranja)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeliveryDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveDeliveryDialog} variant="contained" disabled={!tempDelivery.description.trim()}>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );
};

export default CollaborationEdit;
