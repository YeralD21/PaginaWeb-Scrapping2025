import React, { useState } from 'react';
import DateFilter from './DateFilter';

// Datos de ejemplo para demostrar el filtro de fechas
const sampleNews = [
  {
    id: 1,
    titulo: "Noticia de hoy - Tecnología",
    contenido: "Contenido de la noticia de hoy",
    fecha_publicacion: "2025-09-14T10:30:00",
    categoria: "Tecnología",
    diario: "El Comercio",
    imagen_url: "https://example.com/image1.jpg"
  },
  {
    id: 2,
    titulo: "Noticia de ayer - Deportes",
    contenido: "Contenido de la noticia de ayer",
    fecha_publicacion: "2025-09-13T15:45:00",
    categoria: "Deportes",
    diario: "Diario Correo",
    imagen_url: "https://example.com/image2.jpg"
  },
  {
    id: 3,
    titulo: "Noticia de hace 2 días - Economía",
    contenido: "Contenido de la noticia de hace 2 días",
    fecha_publicacion: "2025-09-12T08:20:00",
    categoria: "Economía",
    diario: "El Popular",
    imagen_url: "https://example.com/image3.jpg"
  },
  {
    id: 4,
    titulo: "Noticia de agosto - Mundo",
    contenido: "Contenido de la noticia de agosto",
    fecha_publicacion: "2025-08-25T14:15:00",
    categoria: "Mundo",
    diario: "CNN en Español",
    imagen_url: "https://example.com/image4.jpg"
  },
  {
    id: 5,
    titulo: "Noticia sin fecha",
    contenido: "Esta noticia no tiene fecha",
    fecha_publicacion: null,
    categoria: "Sin categoría",
    diario: "El Comercio",
    imagen_url: "https://example.com/image5.jpg"
  }
];

const DateFilterExample = () => {
  const [filteredNews, setFilteredNews] = useState(sampleNews);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const handleDateFilter = (date, news, monthData) => {
    if (date) {
      setSelectedDate(date);
      setSelectedMonth(null);
      setFilteredNews(news);
    } else if (monthData) {
      setSelectedMonth(monthData.key);
      setSelectedDate(null);
      setFilteredNews(news);
    } else {
      setSelectedDate(null);
      setSelectedMonth(null);
      setFilteredNews(sampleNews);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
        Ejemplo del Filtro de Fechas por Mes
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Panel izquierdo - Filtro de fechas */}
        <div>
          <DateFilter
            noticias={sampleNews}
            onDateFilter={handleDateFilter}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
          />
        </div>

        {/* Panel derecho - Noticias filtradas */}
        <div>
          <div style={{ 
            background: 'white', 
            borderRadius: '15px', 
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
              Noticias Filtradas ({filteredNews.length})
            </h3>
            
            {filteredNews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredNews.map((noticia) => (
                  <div
                    key={noticia.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      background: '#f8f9fa'
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                      {noticia.titulo}
                    </h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      <span><strong>Categoría:</strong> {noticia.categoria}</span>
                      <span><strong>Diario:</strong> {noticia.diario}</span>
                      <span><strong>Fecha:</strong> {
                        noticia.fecha_publicacion 
                          ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-ES')
                          : 'Sin fecha'
                      }</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                <p>No hay noticias para mostrar con los filtros seleccionados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información de uso */}
      <div style={{ 
        marginTop: '2rem', 
        background: '#e3f2fd', 
        padding: '1.5rem', 
        borderRadius: '15px',
        border: '1px solid #2196f3'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1976d2' }}>Cómo usar el filtro:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#333' }}>
          <li><strong>Hacer clic en un mes</strong> para expandir y ver los días disponibles</li>
          <li><strong>Seleccionar "Todos los días del mes"</strong> para ver todas las noticias del mes</li>
          <li><strong>Seleccionar un día específico</strong> para ver solo las noticias de ese día</li>
          <li><strong>Usar "Limpiar filtros"</strong> para volver a ver todas las noticias</li>
          <li><strong>Noticias sin fecha</strong> aparecen en una sección separada</li>
        </ul>
      </div>
    </div>
  );
};

export default DateFilterExample;
