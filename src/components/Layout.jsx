import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Divider,
    Button,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    ViewTimeline as GanttIcon,
    Folder as FolderIcon,
    People as PeopleIcon,
    AccountCircle,
    Logout,
    Slideshow as PresentationIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 180;

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [presentationMode, setPresentationMode] = useState(false);
    const onTogglePresentation = () => setPresentationMode(!presentationMode);
    const [anchorEl, setAnchorEl] = useState(null);
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Resumen', icon: <DashboardIcon />, path: '/' },
        { text: 'Gantt', icon: <GanttIcon />, path: '/gantt' },
        { text: 'Colaboraciones', icon: <FolderIcon />, path: '/colaboraciones' },
    ];

    if (isAdmin()) {
        menuItems.push({ text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' });
    }

    const drawer = (
        <div>
            <List sx={{ px: 0.5 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                mb: 0.5
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 32, mr: 1, color: 'primary.main' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    noWrap: true
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ mt: 'auto', p: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center' }}>
                    Versión 1.2
                </Typography>
            </Box>
        </div>
    );

    if (presentationMode) {
        return (
            <Box className="presentation-mode" sx={{ position: 'relative', minHeight: '100vh' }}>
                <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 2000, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DashboardIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            opacity: 0.5,
                            '&:hover': { opacity: 1 }
                        }}
                    >
                        Resumen
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={onTogglePresentation}
                        sx={{
                            opacity: 0.5,
                            '&:hover': { opacity: 1 }
                        }}
                    >
                        Salir modo presentación
                    </Button>
                </Box>
                <Outlet context={{ presentationMode }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: 'background.default', // Ensure background is applied here
            minWidth: 'fit-content', // This keeps the background covering full width if content overflows
            width: '100%'
        }}>
            <AppBar
                position="fixed"
                color="default"
                elevation={1}
                sx={{
                    width: '100%',
                    zIndex: { sm: (theme) => theme.zIndex.drawer + 1, xs: (theme) => theme.zIndex.drawer - 1 },
                    backgroundColor: '#ffffff',
                    color: 'primary.main',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Seguimiento de Colaboraciones
                    </Typography>

                    <Button
                        color="inherit"
                        startIcon={<PresentationIcon />}
                        onClick={onTogglePresentation}
                        sx={{ mr: 2 }}
                    >
                        Modo Presentación
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', md: 'block' } }}>
                            {currentUser?.username || currentUser?.name || currentUser?.email}
                        </Typography>
                        <IconButton
                            size="large"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2">{currentUser?.email}</Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Cerrar Sesión
                        </MenuItem>
                    </Menu>

                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            zIndex: (theme) => theme.zIndex.drawer + 2 // Ensure it's above the app bar
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            mt: 8, // Offset by the AppBar height
                            height: 'calc(100% - 64px)', // Adjust height
                            borderBottom: 'none'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                }}
            >
                <Outlet context={{ presentationMode }} />
            </Box>
        </Box >
    );
};

export default Layout;
