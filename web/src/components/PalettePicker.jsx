import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';

const colorOptions = ['#e31a1c', '#33a01c', '#1f78b4', '#c0c01c', '#c002c0', '#02c7c0', '#e1e1e1'];

export function PalettePicker({ onSelect=()=>{}, color=colorOptions[0]} = {}) {
  const [selectedColor, setSelectedColor] = useState(color);

  const handleSelectColor = useCallback((color) => {
    setSelectedColor(color)
    onSelect(color)
  }, [onSelect])

  return (
    <Box sx={{ textAlign: 'left', mt: 4 }}>
        <Box sx={{ mb: 2 }}>
        <strong>Цвет типа узла</strong>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {colorOptions.map((color) => (
          <Box 
            key={color}
            onClick={() => handleSelectColor(color)}
            sx={{
              width: 40,
              height: 40,
              bgcolor: color,
              borderRadius: '50%',
              padding: 0,
              boxShadow: selectedColor === color ? '0 0 0 5px rgba(0, 0, 0, 0.348)' : 'none',
              cursor: "pointer",
              '&:hover': {
                boxShadow: '0 0 0 5px rgba(0, 55, 255, 0.3)',
              },
              borderColor: "divider"
            }}
            aria-label={`Выбрать цвет ${color}`}
          />
        ))}
      </Box>

      
    </Box>
  );
}