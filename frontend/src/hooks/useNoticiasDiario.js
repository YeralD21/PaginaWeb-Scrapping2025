import { useState, useEffect } from 'react';
import axios from 'axios';

export const useNoticiasDiario = (nombreDiario, fecha = null) => {
  const [noticias, setNoticias] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar fechas disponibles para el diario
        const fechasResponse = await axios.get(`http://localhost:8000/noticias/fechas-disponibles/${nombreDiario}`);
        setFechasDisponibles(fechasResponse.data.fechas);

        // Cargar noticias del diario
        let url = `http://localhost:8000/noticias/por-diario/${nombreDiario}`;
        if (fecha) {
          url += `?fecha=${fecha}`;
        } else if (fechasResponse.data.fechas && fechasResponse.data.fechas.length > 0) {
          // Si no hay fecha específica, usar la primera fecha disponible
          url += `?fecha=${fechasResponse.data.fechas[0].fecha}`;
        }
        
        const noticiasResponse = await axios.get(url);
        setNoticias(noticiasResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching noticias del diario:', error);
        setError('Error al cargar las noticias del diario');
      } finally {
        setLoading(false);
      }
    };

    if (nombreDiario) {
      fetchData();
    }
  }, [nombreDiario, fecha]);

  const fetchNoticiasPorFecha = async (fechaEspecifica) => {
    setLoading(true);
    try {
      const url = `http://localhost:8000/noticias/por-diario/${nombreDiario}?fecha=${fechaEspecifica}`;
      const response = await axios.get(url);
      setNoticias(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching noticias por fecha:', error);
      setError('Error al cargar las noticias por fecha');
    } finally {
      setLoading(false);
    }
  };

  return { 
    noticias, 
    fechasDisponibles, 
    loading, 
    error, 
    fetchNoticiasPorFecha 
  };
};
