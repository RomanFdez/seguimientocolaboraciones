import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Button,
    TextField,
    MenuItem,
    Chip,
    IconButton,
    TableSortLabel
} from '@mui/material';
import { Add as AddIcon, Visibility, Edit, Delete } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { STATUSES } from '../utils/constants';
import { formatDate } from '../utils/dateHelpers';

const CollaborationList = () => {
    const { collaborations, users, loading, deleteCollaboration, createCollaboration } = useData();
    const { currentUser, isAdmin, isAnalista } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [orderBy, setOrderBy] = useState('updated');
    const [order, setOrder] = useState('desc');

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedCollaborations = useMemo(() => {
        const filtered = collaborations.filter(collab => {
            const matchesSearch = (collab.title || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || collab.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            let valA, valB;
            switch (orderBy) {
                case 'title':
                    valA = (a.title || '').toLowerCase();
                    valB = (b.title || '').toLowerCase();
                    break;
                case 'status':
                    valA = a.status || '';
                    valB = b.status || '';
                    break;
                case 'analysts':
                    const aIds = a.description?.attributes?.analistas || [];
                    const bIds = b.description?.attributes?.analistas || [];
                    valA = (users.find(u => u.uid === aIds[0])?.name || '').toLowerCase();
                    valB = (users.find(u => u.uid === bIds[0])?.name || '').toLowerCase();
                    break;
                case 'area':
                    valA = (a.description?.attributes?.areaNegocio || '').toLowerCase();
                    valB = (b.description?.attributes?.areaNegocio || '').toLowerCase();
                    break;
                case 'updated':
                    const getMillis = (d) => d?.toMillis ? d.toMillis() : (d ? new Date(d).getTime() : 0);
                    valA = getMillis(a.updatedAt);
                    valB = getMillis(b.updatedAt);
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [collaborations, searchTerm, statusFilter, orderBy, order, users]);

    const handleCreate = () => {
        navigate('/colaboraciones/nuevo');
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Colaboraciones
                </Typography>
                {(isAdmin() || isAnalista()) && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                    >
                        Nueva Colaboración
                    </Button>
                )}
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Buscar"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <TextField
                        select
                        label="Estado"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        {STATUSES.map(status => (
                            <MenuItem key={status.value} value={status.value}>
                                {status.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sortDirection={orderBy === 'title' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'title'}
                                    direction={orderBy === 'title' ? order : 'asc'}
                                    onClick={() => handleRequestSort('title')}
                                >
                                    <strong>Colaboración</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'status' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'status'}
                                    direction={orderBy === 'status' ? order : 'asc'}
                                    onClick={() => handleRequestSort('status')}
                                >
                                    <strong>Estado</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'analysts' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'analysts'}
                                    direction={orderBy === 'analysts' ? order : 'asc'}
                                    onClick={() => handleRequestSort('analysts')}
                                >
                                    <strong>Analistas</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'area' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'area'}
                                    direction={orderBy === 'area' ? order : 'asc'}
                                    onClick={() => handleRequestSort('area')}
                                >
                                    <strong>Área de Negocio</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'updated' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'updated'}
                                    direction={orderBy === 'updated' ? order : 'asc'}
                                    onClick={() => handleRequestSort('updated')}
                                >
                                    <strong>Última Actualización</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right"><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCollaborations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">
                                        No se encontraron colaboraciones
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedCollaborations.map((collab) => (
                                <TableRow
                                    key={collab.id}
                                    hover
                                >
                                    <TableCell>{collab.title || 'Sin Título'}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={collab.status} />
                                    </TableCell>
                                    <TableCell>
                                        {collab.description?.attributes?.analistas?.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {collab.description.attributes.analistas.map((uid) => {
                                                    const user = users.find(u => u.uid === uid);
                                                    return (
                                                        <Chip
                                                            key={uid}
                                                            label={user?.name || user?.email || 'Usuario'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Sin asignar
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{collab.description?.attributes?.areaNegocio || '-'}</TableCell>
                                    <TableCell>{formatDate(collab.updatedAt)}</TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            {(isAdmin() || (isAnalista() && (
                                                !(collab.description?.attributes?.analistas) ||
                                                collab.description.attributes.analistas.length === 0 ||
                                                collab.description.attributes.analistas.includes(currentUser.uid)
                                            ))) && (
                                                    <IconButton
                                                        size="small"
                                                        color="action"
                                                        onClick={() => navigate(`/colaboraciones/${collab.id}/editar`)}
                                                        title="Editar"
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                )}

                                            {(isAdmin() || (isAnalista() && (
                                                !(collab.description?.attributes?.analistas) ||
                                                collab.description.attributes.analistas.length === 0 ||
                                                collab.description.attributes.analistas.includes(currentUser.uid)
                                            ))) && (
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={async () => {
                                                            if (window.confirm('¿Estás seguro de que quieres eliminar esta colaboración?')) {
                                                                await deleteCollaboration(collab.id);
                                                            }
                                                        }}
                                                        title="Eliminar"
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                )}

                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => navigate(`/colaboraciones/${collab.id}`)}
                                                title="Ver detalle"
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default CollaborationList;
