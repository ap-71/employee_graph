import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Fade,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [userData, setUserData] = useState({
    username: user?.username || 'Пользователь',
    email: user?.email || 'user@example.com',
    fullName: 'Иван Иванов',
    phone: '+7 (123) 456-7890',
    location: 'Москва, Россия',
    bio: 'Инженер-программист с опытом работы с React, Node.js и современными веб-технологиями.'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    setEditMode(false);
    setSnackbar({
      open: true,
      message: 'Профиль успешно обновлен!',
      severity: 'success'
    });
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const activityHistory = [
    { id: 1, activity: 'Изменен пароль', date: '2 дня назад' },
    { id: 2, activity: 'Обновлена информация профиля', date: '1 неделю назад' },
    { id: 3, activity: 'Создан аккаунт', date: '1 месяц назад' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Fade in={true} timeout={800}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, overflow: 'visible' }}>
              <Box
                sx={{
                  height: 120,
                  background: 'linear-gradient(to right, #3949ab, #5c6bc0)',
                  position: 'relative'
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mt: -8
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: '5px solid #1e1e1e',
                    bgcolor: 'secondary.main',
                    fontSize: 40
                  }}
                >
                  {userData.username.charAt(0).toUpperCase()}
                  <input
                    type="file"
                    id="profile-photo"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profile-photo">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </label>
                </Avatar>
                <CardContent sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom>
                    {userData.username}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {userData.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {userData.location}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Тип аккаунта" secondary="Пользователь" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <HistoryIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Участник с"
                        secondary="Январь 2023"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden' 
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="profile tabs"
                >
                  <Tab
                    icon={<PersonIcon />}
                    label="Личная информация"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<SecurityIcon />}
                    label="Безопасность"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<NotificationsIcon />}
                    label="Уведомления"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<SettingsIcon />}
                    label="Настройки"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <Typography variant="h6">Личная информация</Typography>
                  <Button
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    variant="outlined"
                    color="secondary"
                    onClick={editMode ? handleSave : handleEdit}
                  >
                    {editMode ? 'Сохранить' : 'Редактировать'}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Имя пользователя"
                      name="username"
                      value={userData.username}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Полное имя"
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Телефон"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Местоположение"
                      name="location"
                      value={userData.location}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="О себе"
                      name="bio"
                      value={userData.bio}
                      onChange={handleChange}
                      disabled={!editMode}
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Настройки безопасности
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Управляйте настройками безопасности аккаунта и изменяйте пароль.
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mr: 2 }}
                  >
                    Изменить пароль
                  </Button>
                  <Button variant="outlined">Включить 2FA</Button>
                </Box>

                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Недавняя активность
                </Typography>

                <List>
                  {activityHistory.map((item) => (
                    <ListItem key={item.id} divider>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.activity}
                        secondary={item.date}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Настройки уведомлений
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Управляйте способами получения уведомлений и оповещений.
                </Typography>
                {/* Notification settings would go here */}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Настройки аккаунта
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Управляйте настройками и предпочтениями вашего аккаунта.
                </Typography>
                {/* Account settings would go here */}
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 