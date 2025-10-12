import React from 'react';
import styled from 'styled-components';

const DebugContainer = styled.div`
  background: #f8f9fa;
  border: 2px solid #dc3545;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 0.9rem;
`;

const DebugTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #dc3545;
  font-size: 1rem;
`;

const DebugInfo = styled.div`
  margin-bottom: 0.5rem;
`;

const DateFilterDebug = ({ noticias }) => {
  // Procesar las noticias para mostrar información de depuración
  const debugInfo = React.useMemo(() => {
    if (!noticias || noticias.length === 0) {
      return {
        totalNoticias: 0,
        fechasUnicas: [],
        mesesUnicos: [],
        noticiasSinFecha: 0
      };
    }

    const fechasUnicas = new Set();
    const mesesUnicos = new Set();
    let noticiasSinFecha = 0;

    noticias.forEach(noticia => {
      const fecha = noticia.fecha_publicacion || noticia.published_at;
      
      if (!fecha) {
        noticiasSinFecha++;
        return;
      }

      try {
        const date = new Date(fecha);
        if (!isNaN(date.getTime())) {
          const fechaStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
          const mesStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          fechasUnicas.add(fechaStr);
          mesesUnicos.add(mesStr);
        }
      } catch (error) {
        noticiasSinFecha++;
      }
    });

    return {
      totalNoticias: noticias.length,
      fechasUnicas: Array.from(fechasUnicas).sort().reverse(),
      mesesUnicos: Array.from(mesesUnicos).sort().reverse(),
      noticiasSinFecha
    };
  }, [noticias]);

  return (
    <DebugContainer>
      <DebugTitle>🐛 Debug - Filtro de Fechas</DebugTitle>
      
      <DebugInfo>
        <strong>Total noticias recibidas:</strong> {debugInfo.totalNoticias}
      </DebugInfo>
      
      <DebugInfo>
        <strong>Noticias sin fecha:</strong> {debugInfo.noticiasSinFecha}
      </DebugInfo>
      
      <DebugInfo>
        <strong>Meses únicos encontrados:</strong> {debugInfo.mesesUnicos.length}
        <br />
        {debugInfo.mesesUnicos.length > 0 && (
          <span style={{ color: '#28a745' }}>
            {debugInfo.mesesUnicos.join(', ')}
          </span>
        )}
      </DebugInfo>
      
      <DebugInfo>
        <strong>Fechas únicas encontradas:</strong> {debugInfo.fechasUnicas.length}
        <br />
        {debugInfo.fechasUnicas.length > 0 && (
          <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '0.5rem' }}>
            {debugInfo.fechasUnicas.slice(0, 10).map(fecha => (
              <div key={fecha} style={{ color: '#007bff' }}>
                {fecha}
              </div>
            ))}
            {debugInfo.fechasUnicas.length > 10 && (
              <div style={{ color: '#6c757d' }}>
                ... y {debugInfo.fechasUnicas.length - 10} fechas más
              </div>
            )}
          </div>
        )}
      </DebugInfo>
      
      {debugInfo.totalNoticias === 0 && (
        <div style={{ color: '#dc3545', fontWeight: 'bold' }}>
          ⚠️ No se recibieron noticias. Verificar la conexión con el backend.
        </div>
      )}
    </DebugContainer>
  );
};

export default DateFilterDebug;

