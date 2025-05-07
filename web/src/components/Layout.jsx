import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  useMediaQuery,
  Divider,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  ScatterPlot as ScatterPlotIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AccountTree as AccountTreeIcon,
  ManageAccounts as ManageAccountsIcon
} from '@mui/icons-material';

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [location, navigate] = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = isAuthenticated
    ? [
        { text: 'Главная', icon: <HomeIcon />, path: '/' },
        { text: 'Граф', icon: <ScatterPlotIcon />, path: '/graph' },
        { text: 'Управление', icon: <ManageAccountsIcon />, path: '/management' },
      ]
    : [
        { text: 'Вход', icon: <LoginIcon />, path: '/login' },
        { text: 'Регистрация', icon: <RegisterIcon />, path: '/register' }
      ];

  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2
        }}
      >
        {isAuthenticated && (
          <>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mb: 1,
                bgcolor: theme.palette.secondary.main
              }}
            >
              {user?.username?.charAt(0) || 'П'}
            </Avatar>
            <Typography variant="h6">{user?.username || 'Пользователь'}</Typography>
          </>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            selected={location === item.path}
            style={{ userSelect: 'none', cursor: 'pointer' }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <ListItem button onClick={handleLogout} style={{ userSelect: 'none', cursor: 'pointer' }}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Выйти"/>
          </ListItem>
        )}
      </List>
    </>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(18, 18, 18, 0.8)'
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          {!isMobile && (
            <Box>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{ mx: 1 }}
                >
                  {item.text}
                </Button>
              ))}
              {isAuthenticated && (
                <Button
                  color="secondary"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  variant="outlined"
                  sx={{ ml: 2 }}
                >
                  Выйти
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="center"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        {drawer}
      </Drawer>
      <Box component="div" sx={{ pt: 10, pb: 4, minHeight: '100vh' }} >
        <Container>{children}</Container>
      </Box>
    </>
  );
} 