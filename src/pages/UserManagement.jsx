import { useState } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Alert
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// User secondary auth to create users without logging out
const firebaseConfig = {
    apiKey: "AIzaSyAtrDQsX_ReKKttmRE4roaJ63a-wZU1HBc",
    authDomain: "seguimientocolaboracione-1eea6.firebaseapp.com",
    projectId: "seguimientocolaboracione-1eea6",
    storageBucket: "seguimientocolaboracione-1eea6.firebasestorage.app",
    messagingSenderId: "125577135252",
    appId: "1:125577135252:web:330ad9d02c7179e3c96081"
};

const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

const ROLES = [
    { value: 'admin', label: 'Administrador', color: 'error' },
    { value: 'analista', label: 'Analista', color: 'primary' },
    { value: 'seguimiento', label: 'Seguimiento', color: 'success' },
];

const UserManagement = () => {
    const { users, updateUser, createUser } = useData();
    const { currentUser: authUser, changePassword } = useAuth();
    const [editOpen, setEditOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', roles: [], password: '', confirmPassword: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', roles: ['analista'], password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEdit = (user) => {
        setError('');
        setSuccess('');
        setEditingUser(user);
        const userRoles = user.roles || (user.role ? [user.role] : []);
        setFormData({
            name: user.name || '',
            roles: userRoles,
            password: '',
            confirmPassword: ''
        });
        setEditOpen(true);
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setError('');
        setSuccess('');

        if (formData.password) {
            if (formData.password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Las contraseñas no coinciden');
                return;
            }
        }

        setLoading(true);
        const updates = {
            name: formData.name,
            roles: formData.roles,
            role: null
        };

        const result = await updateUser(editingUser.uid, updates);

        if (result.success) {
            if (formData.password) {
                // If it's the current user, we can change the password
                if (editingUser.uid === authUser.uid) {
                    const passResult = await changePassword(formData.password);
                    if (passResult.success) {
                        setSuccess('¡Datos y contraseña actualizados correctamente!');
                        setTimeout(() => setEditOpen(false), 1500);
                    } else {
                        setError('Datos actualizados, pero error al cambiar contraseña: ' + passResult.error);
                    }
                } else {
                    setError('Nota: Solo puedes cambiar tu propia contraseña desde aquí. Los demás datos se han actualizado correctamente.');
                }
            } else {
                setEditOpen(false);
            }
        } else {
            setError('Error al guardar: ' + result.error);
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        setError('');
        setSuccess('');
        if (!newUser.email || !newUser.name) {
            setError('Nombre y Email son obligatorios');
            return;
        }

        if (!newUser.password || newUser.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            // 1. Create in Firebase Auth using the secondary auth instance
            const authResult = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);
            const uid = authResult.user.uid;

            // 2. Create in Firestore
            const dbResult = await createUser(uid, {
                name: newUser.name,
                email: newUser.email,
                roles: newUser.roles
            });

            if (dbResult.success) {
                setSuccess('¡Usuario creado correctamente!');
                setTimeout(() => {
                    setAddOpen(false);
                    setNewUser({ name: '', email: '', roles: ['analista'], password: '', confirmPassword: '' });
                    setSuccess('');
                }, 1500);
            } else {
                setError('Usuario creado en Auth, pero error en Base de Datos: ' + dbResult.error);
            }
        } catch (e) {
            setError('Error al crear usuario: ' + e.message);
        }
        setLoading(false);
    };

    const getRoleLabel = (roleVal) => {
        const r = ROLES.find(item => item.value === roleVal);
        return r ? r.label : roleVal;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Gestión de Usuarios
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra los accesos y roles de los usuarios del sistema.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => { setError(''); setAddOpen(true); }}
                >
                    Añadir Usuario
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Roles</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => {
                            const userRoles = user.roles || (user.role ? [user.role] : []);
                            return (
                                <TableRow key={user.uid} hover>
                                    <TableCell>{user.name || 'Sin Nombre'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {userRoles.map((role, idx) => {
                                                const config = ROLES.find(r => r.value === role);
                                                return (
                                                    <Chip
                                                        key={idx}
                                                        label={config ? config.label : role}
                                                        size="small"
                                                        color={config ? config.color : 'default'}
                                                        variant="outlined"
                                                    />
                                                );
                                            })}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleEdit(user)} size="small" color="primary">
                                            <Edit />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Añadir Usuario */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Crea un nuevo usuario en el sistema. Se registrará tanto en la autenticación como en la base de datos.
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Nombre Completo"
                            fullWidth
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            fullWidth
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <TextField
                            label="Confirmar Contraseña"
                            type="password"
                            fullWidth
                            value={newUser.confirmPassword}
                            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Roles</InputLabel>
                            <Select
                                multiple
                                value={newUser.roles}
                                label="Roles"
                                onChange={(e) => {
                                    const { target: { value } } = e;
                                    setNewUser({
                                        ...newUser,
                                        roles: typeof value === 'string' ? value.split(',') : value,
                                    });
                                }}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={getRoleLabel(value)} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {ROLES.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleAdd}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="UID (No editable)"
                            fullWidth
                            disabled
                            value={editingUser?.uid || ''}
                        />
                        <TextField
                            label="Email (No editable)"
                            fullWidth
                            disabled
                            value={editingUser?.email || ''}
                        />
                        <TextField
                            label="Nombre"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Nueva Contraseña"
                            type="password"
                            fullWidth
                            placeholder="Dejar en blanco para no cambiar"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <TextField
                            label="Confirmar Nueva Contraseña"
                            type="password"
                            fullWidth
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Roles</InputLabel>
                            <Select
                                multiple
                                value={formData.roles}
                                label="Roles"
                                onChange={(e) => {
                                    const { target: { value } } = e;
                                    setFormData({
                                        ...formData,
                                        roles: typeof value === 'string' ? value.split(',') : value,
                                    });
                                }}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={getRoleLabel(value)} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {ROLES.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement;
