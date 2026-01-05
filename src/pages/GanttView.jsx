import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    TextField,
    Link,
    IconButton,
} from '@mui/material';
import { Star as StarIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { STATUSES, DELIVERY_TYPES, COLLABORATION_TYPES } from '../utils/constants';
import { getMonthsOfYear, formatDate } from '../utils/dateHelpers';
import StatusBadge from '../components/StatusBadge';

const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

const GanttRow = ({ collab, months, currentYear, updateCollaboration, navigate }) => {
    // 1. Determine dates for THIS year (Independent logic)
    let initialStart = null;
    let initialEnd = null;

    if (collab.timeline && collab.timeline[currentYear]) {
        initialStart = collab.timeline[currentYear].startDate;
        initialEnd = collab.timeline[currentYear].endDate;
    } else {
        if (collab.startDate && new Date(collab.startDate).getFullYear() === currentYear) {
            initialStart = collab.startDate;
        }
        if (collab.endDate && new Date(collab.endDate).getFullYear() === currentYear) {
            initialEnd = collab.endDate;
        }
    }

    const defaultStart = new Date(currentYear, 0, 1);
    const defaultEnd = new Date(currentYear, 0, 31);

    const startDate = initialStart ? new Date(initialStart) : defaultStart;
    const endDate = initialEnd ? new Date(initialEnd) : defaultEnd;
    const daysInYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 366 : 365;

    // Auto-create default timeline for the year if missing
    useEffect(() => {
        const hasTimeline = collab.timeline && collab.timeline[currentYear];
        // Check legacy only if we want to respect it. 
        // If we want to "Force" a timeline entry, we might ignore legacy?
        // But better to respect it to avoid duplication if it exists.
        const hasLegacy = collab.startDate && new Date(collab.startDate).getFullYear() === currentYear;

        if (!hasTimeline && !hasLegacy) {
            const defStart = new Date(currentYear, 0, 1);
            const defEnd = new Date(currentYear, 0, 31);

            const newTimeline = { ...(collab.timeline || {}) };
            newTimeline[currentYear] = {
                startDate: defStart.toISOString(),
                endDate: defEnd.toISOString()
            };

            // Use console.log to debug
            console.log(`Auto-creating timeline frame for ${collab.title} in ${currentYear}`);
            updateCollaboration(collab.id, { timeline: newTimeline });
        }
    }, [collab.timeline, collab.startDate, currentYear, collab.id]);

    const startDay = (startDate.getFullYear() === currentYear) ? getDayOfYear(startDate) : 0;
    const endDay = (endDate.getFullYear() === currentYear) ? getDayOfYear(endDate) : 30;
    const duration = endDay - startDay;

    const baseLeftPct = Math.max(0, Math.min(100, (startDay / daysInYear) * 100));
    const baseWidthPct = Math.max(0, Math.min(100 - baseLeftPct, (duration / daysInYear) * 100));

    const [localLeftPct, setLocalLeftPct] = useState(baseLeftPct);
    const [localWidthPct, setLocalWidthPct] = useState(baseWidthPct);
    const [dragMode, setDragMode] = useState(null);

    useEffect(() => {
        if (!dragMode) {
            setLocalLeftPct(baseLeftPct);
            setLocalWidthPct(baseWidthPct);
        }
    }, [baseLeftPct, baseWidthPct, dragMode]);

    const { currentUser, isAdmin, isAnalista } = useAuth();
    const dragStartRef = useRef({ x: 0, left: 0, width: 0 });
    const rowRef = useRef(null);

    const canEdit = isAdmin() || (isAnalista() && (
        !(collab.description?.attributes?.analistas) ||
        collab.description.attributes.analistas.length === 0 ||
        collab.description.attributes.analistas.includes(currentUser.uid)
    ));

    const handleMouseDown = (e, mode) => {
        if (!canEdit) return; // Prevent dragging
        e.preventDefault();
        e.stopPropagation();
        setDragMode(mode);
        dragStartRef.current = {
            x: e.clientX,
            left: localLeftPct,
            width: localWidthPct
        };
    };

    const handleMouseMove = (e) => {
        if (!dragMode || !rowRef.current) return;
        const rowWidth = rowRef.current.getBoundingClientRect().width;
        const deltaPixels = e.clientX - dragStartRef.current.x;
        const deltaPct = (deltaPixels / rowWidth) * 100;
        const minWidthPct = 8.2;

        if (dragMode === 'move') {
            let newLeft = dragStartRef.current.left + deltaPct;
            newLeft = Math.max(0, Math.min(100 - dragStartRef.current.width, newLeft));
            setLocalLeftPct(newLeft);
        } else if (dragMode === 'resize-r') {
            let newWidth = dragStartRef.current.width + deltaPct;
            const maxAvailableWidth = 100 - dragStartRef.current.left;
            newWidth = Math.max(minWidthPct, Math.min(maxAvailableWidth, newWidth));
            setLocalWidthPct(newWidth);
        } else if (dragMode === 'resize-l') {
            let newLeft = dragStartRef.current.left + deltaPct;
            let newWidth = dragStartRef.current.width - deltaPct;

            if (newLeft < 0) {
                newWidth = dragStartRef.current.left + dragStartRef.current.width;
                newLeft = 0;
            }
            if (newWidth < minWidthPct) {
                newWidth = minWidthPct;
                newLeft = dragStartRef.current.left + dragStartRef.current.width - minWidthPct;
            }
            setLocalLeftPct(newLeft);
            setLocalWidthPct(newWidth);
        }
    };

    const handleMouseUp = async () => {
        if (!dragMode) return;
        setDragMode(null);

        // Clamp calculations to current year
        let newStartDayIndex = Math.round((localLeftPct / 100) * daysInYear);
        newStartDayIndex = Math.max(0, Math.min(daysInYear - 1, newStartDayIndex));

        const newStartDate = new Date(currentYear, 0, newStartDayIndex + 1);

        // Calculate duration and end
        let newDurationDay = Math.round((localWidthPct / 100) * daysInYear);
        let newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + newDurationDay);

        if (newEndDate.getFullYear() > currentYear) {
            newEndDate = new Date(currentYear, 11, 31);
        }

        // Save to TIMELINE map independent for this year
        const newTimeline = { ...(collab.timeline || {}) };
        newTimeline[currentYear] = {
            startDate: newStartDate.toISOString(),
            endDate: newEndDate.toISOString()
        };

        const result = await updateCollaboration(collab.id, {
            timeline: newTimeline
        });

        if (!result.success) {
            alert("Error al guardar fechas: " + result.error);
        }
    };

    useEffect(() => {
        if (dragMode) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragMode, localLeftPct, localWidthPct]);

    return (
        <TableRow hover sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
            <TableCell sx={{ py: 0.5, px: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/colaboraciones/${collab.id}`)}
                        title="Ver detalle"
                        sx={{ p: 0.25 }}
                    >
                        <ViewIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                    <Link
                        component="button"
                        variant="caption"
                        onClick={() => navigate(`/colaboraciones/${collab.id}`)}
                        sx={{
                            textAlign: 'left',
                            fontWeight: 500,
                            color: 'text.primary',
                            textDecoration: 'none',
                            lineHeight: 1.2,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {collab.title}
                    </Link>
                </Box>
            </TableCell>
            <TableCell sx={{ py: 0.5, px: 1, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                <StatusBadge status={collab.status} size="small" />
            </TableCell>

            <TableCell
                colSpan={12}
                padding="none"
                sx={{ position: 'relative', height: 40, p: 0 }}
                ref={rowRef}
            >
                <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
                    {months.map(m => (
                        <Box
                            key={m.index}
                            sx={{ flex: 1, borderRight: '1px solid rgba(224, 224, 224, 1)', height: '100%' }}
                        />
                    ))}
                </Box>

                <Box
                    sx={{
                        position: 'absolute',
                        left: `${localLeftPct}%`,
                        width: `${localWidthPct}%`,
                        top: 15,
                        bottom: 15,
                        bgcolor: '#ef9a9a',
                        borderRadius: 4,
                        opacity: 0.6,
                        cursor: dragMode === 'move' ? 'grabbing' : 'grab',
                        zIndex: 5,
                        '&:hover': { opacity: 0.8 },
                        userSelect: 'none'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                    title={`${formatDate(startDate)} - ${formatDate(endDate)}`}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 10,
                            cursor: 'ew-resize',
                            zIndex: 6,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'resize-l')}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 10,
                            cursor: 'ew-resize',
                            zIndex: 6,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'resize-r')}
                    />
                </Box>

                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {(collab.deliveries || []).map((delivery, idx) => {
                        if (!delivery.date || !delivery.starType) return null;
                        const dDate = new Date(delivery.date);
                        if (dDate.getFullYear() !== currentYear) return null;

                        const dDay = getDayOfYear(dDate);
                        const dLeft = (dDay / daysInYear) * 100;
                        const color = delivery.starType === 'estimated' ? '#2196f3' :
                            delivery.starType === 'actual' ? '#4caf50' :
                                delivery.starType === 'new' ? '#ff9800' : 'transparent';

                        return (
                            <StarIcon
                                key={idx}
                                sx={{
                                    position: 'absolute',
                                    left: `${dLeft}%`,
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: color,
                                    fontSize: 18,
                                    zIndex: 10,
                                    pointerEvents: 'auto',
                                }}
                                titleAccess={`${dDate.getDate()}/${dDate.getMonth() + 1}: ${delivery.description || ''}`}
                            />
                        );
                    })}
                </Box>

            </TableCell>
        </TableRow>
    );
};

const GanttView = () => {
    const { collaborations, loading, updateCollaboration } = useData();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const statusParam = searchParams.get('status');
    const [statusFilter, setStatusFilter] = useState(statusParam || 'all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const months = getMonthsOfYear(selectedYear);

    const filteredCollaborations = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return collaborations.filter(collab => {
            const matchesStatus = statusFilter === 'all' || collab.status === statusFilter;
            const matchesType = typeFilter === 'all' || collab.type === typeFilter;

            // Visibilidad por año:
            // 1. Si está asignada explícitamente a este año
            // 2. O si estamos en el año actual y la colaboración no está cancelada (visibilidad total)
            const isAssignedToYear = (collab.years || []).includes(selectedYear);
            const isActiveInCurrentYear = selectedYear === currentYear && collab.status !== 'Cancelados';
            const matchesYear = isAssignedToYear || isActiveInCurrentYear || (!collab.years && selectedYear === currentYear);

            return matchesStatus && matchesType && matchesYear;
        });
    }, [collaborations, statusFilter, typeFilter, selectedYear]);

    if (loading) {
        return (
            <Container>
                <Typography>Cargando...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Vista Gantt {selectedYear}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Planificación anual de colaboraciones
                </Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        label="Año"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        sx={{ minWidth: 100 }}
                    >
                        {Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, i) => 2024 + i).map(year => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Filtrar por Tipo"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        {COLLABORATION_TYPES.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Filtrar por Estado"
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

            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{
                                minWidth: 200,
                                fontWeight: 'bold',
                                backgroundColor: 'background.paper',
                                py: 0.5,
                                px: 1
                            }}>
                                Colaboración
                            </TableCell>
                            <TableCell sx={{
                                fontWeight: 'bold',
                                backgroundColor: 'background.paper',
                                py: 0.5,
                                px: 1,
                                minWidth: 90,
                                width: 90,
                                borderRight: '1px solid rgba(224, 224, 224, 1)'
                            }}>
                                Estado
                            </TableCell>
                            {months.map(month => (
                                <TableCell
                                    key={month.index}
                                    align="center"
                                    sx={{
                                        minWidth: 60,
                                        fontWeight: 'bold',
                                        backgroundColor: 'background.paper',
                                        py: 0.5,
                                        px: 0.5,
                                        fontSize: '0.75rem',
                                        position: 'relative',
                                        zIndex: 2,
                                    }}
                                >
                                    {month.shortName}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCollaborations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={14} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">
                                        No se encontraron colaboraciones
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCollaborations.map((collab) => (
                                <GanttRow
                                    key={collab.id}
                                    collab={collab}
                                    months={months}
                                    currentYear={selectedYear}
                                    updateCollaboration={updateCollaboration}
                                    navigate={navigate}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Leyenda de Entregas:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {DELIVERY_TYPES.map(type => (
                        <Box key={type.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ color: type.color, fontSize: 20 }} />
                            <Typography variant="body2">{type.label}</Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Container>
    );
};

export default GanttView;
