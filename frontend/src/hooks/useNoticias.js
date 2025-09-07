import { useState, useEffect } from 'react';
import axios from 'axios';

export const useNoticias = (fecha = null) => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoticias = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8000/noticias/por-fecha';
        if (fecha) {
          url += `?fecha=${fecha}`;
        } else {
          // Si no hay fecha, obtener la primera fecha disponible
          const fechasResponse = await axios.get('http://localhost:8000/noticias/fechas-disponibles');
          if (fechasResponse.data.fechas && fechasResponse.data.fechas.length > 0) {
            url += `?fecha=${fechasResponse.data.fechas[0].fecha}`;
          }
        }
        
        const response = await axios.get(url);
        setNoticias(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching noticias:', error);
        setError('Error al cargar las noticias');
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, [fecha]);

  return { noticias, loading, error };
};
