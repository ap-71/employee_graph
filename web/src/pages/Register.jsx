import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  Fade,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';

export default function Register() {
  const [location, navigate] = useLocation();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const steps = ['Личная информация', 'Детали аккаунта'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.username) {
        setError('Имя пользователя обязательно');
        return false;
      }
    } else if (activeStep === 1) {
      if (!formData.password) {
        setError('Пароль обязателен');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleStepAction = () => {
    if (!validateStep()) return;
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      setTimeout(() => {
        register({
          username: formData.username,
          password: formData.password,
          id: Math.random().toString(36).substring(2, 8)
        });
        navigate('/');
      }, 1500);
    } catch (err) {
      console.debug(err);
      setError('Регистрация не удалась. Пожалуйста, попробуйте снова.');
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
              Создать аккаунт
            </Typography>

            <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ width: '100%', mt: 1 }}>
              {activeStep === 0 ? (
                <Box>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Имя пользователя"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={formData.username}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Box>
              ) : (
                <Box>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Пароль"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Подтвердите пароль"
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 3 }}
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                >
                  Назад
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStepAction}
                  disabled={isLoading}
                  endIcon={activeStep === steps.length - 1 ? <PersonAdd /> : <ArrowForward />}
                >
                  {activeStep === steps.length - 1 ? (isLoading ? 'Регистрация...' : 'Зарегистрироваться') : 'Далее'}
                </Button>
              </Box>

              {activeStep === 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Уже есть аккаунт?{' '}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/login')}
                      color="secondary"
                      sx={{ fontWeight: 'medium' }}
                    >
                      Войти
                    </Link>
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
} 