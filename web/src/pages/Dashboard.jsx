import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Fade,
  Grow,
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  BarChart,
  Notifications,
  Person,
  Group,
  CalendarToday
} from '@mui/icons-material';

// Mock data for charts and statistics
const mockData = {
  stats: [
    { id: 1, title: 'Всего пользователей', value: '1,255', icon: <Person />, color: '#8e24aa' },
    { id: 2, title: 'Активные проекты', value: '32', icon: <BarChart />, color: '#3949ab' },
    { id: 3, title: 'Общий доход', value: '$12,435', icon: <TrendingUp />, color: '#43a047' },
    { id: 4, title: 'Члены команды', value: '24', icon: <Group />, color: '#d81b60' }
  ],
  notifications: [
    { id: 1, title: 'Зарегистрирован новый пользователь', time: '5 мин. назад', read: false },
    { id: 2, title: 'Приближается срок сдачи проекта', time: '2 часа назад', read: false },
    { id: 3, title: 'Запланировано обслуживание сервера', time: 'Вчера', read: true },
    { id: 4, title: 'Отправлен запрос на новую функцию', time: '3 дня назад', read: true }
  ],
  projects: [
    { id: 1, name: 'Редизайн веб-сайта', progress: 75, status: 'В процессе' },
    { id: 2, name: 'Разработка мобильного приложения', progress: 32, status: 'В процессе' },
    { id: 3, name: 'Миграция базы данных', progress: 100, status: 'Завершено' },
    { id: 4, name: 'Интеграция API', progress: 45, status: 'В процессе' }
  ]
};

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from an API
    setTimeout(() => {
      setStats(mockData.stats);
      setProjects(mockData.projects);
      setNotifications(mockData.notifications);
      setLoading(false);
    }, 1200);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Завершено':
        return 'success';
      case 'В процессе':
        return 'info';
      case 'На удержании':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Панель управления
      </Typography>
    </Box>
  );
} 