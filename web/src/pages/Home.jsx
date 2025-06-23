import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Fade,
  CircularProgress
} from '@mui/material';
import { getCountDepartments, getCountEmployees, getCountPositions, getCountProjects } from '../services/api';

export default function Home() {
  const [fadeIn, setFadeIn] = useState(false);
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    positions: 0,
    projects: 0,
    loading: true
  });

  useEffect(() => {
    setFadeIn(true);
    
    const fetchStats = async () => {
      try {
        const [employeesRes, departmentsRes, positionsRes, projectsRes] = await Promise.all([
          getCountEmployees(),
          getCountDepartments(),
          getCountPositions(), 
          getCountProjects()
        ]);
        
        setStats({
          employees: employeesRes.count,
          departments: departmentsRes.count,
          positions: positionsRes.count,
          projects: projectsRes.count,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchStats();
  }, []);

  // const dashboardStats = [
  //   { title: 'Сотрудники', value: stats.employees, color: '#4caf50' },
  //   { title: 'Отделы', value: stats.departments, color: '#2196f3' },
  //   { title: 'Должности', value: stats.positions, color: '#ff9800' },
  //   { title: 'Проекты', value: stats.projects, color: '#9c27b0' }
  // ];

  const cards = [
    {
      title: 'Графы',
      description: 'Просмотр графов',
      image: 'https://source.unsplash.com/random/1200x800/?analytics',
      link: '/graph/sections'
    },
    {
      title: 'Управление',
      description: 'Создание связей',
      image: 'https://source.unsplash.com/random/1200x800/?analytics',
      link: '/management'
    }
  ];

  return (
    <Box>
      {/* <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Дашборд
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {stats.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          dashboardStats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Fade in={fadeIn} timeout={1000} style={{ transitionDelay: `${index * 150}ms` }}>
                <Card sx={{ 
                  height: '100%', 
                  position: 'relative', 
                  overflow: 'hidden',
                  boxShadow: 3
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '5px', 
                    height: '100%', 
                    bgcolor: stat.color 
                  }} />
                  <CardContent>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))
        )}
      </Grid> */}

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Быстрый доступ
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Fade in={fadeIn} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    href={card.link}
                    fullWidth
                  >
                    Перейти
                  </Button>
                </Box>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 