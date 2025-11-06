import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = 'http://localhost:8000';

const pop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 1rem;
`;

const ReactionButton = styled.button`
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0'};
  color: ${props => props.$active ? 'white' : '#555'};
  border: none;
  border-radius: 25px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${props => props.$active ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : '#e0e0e0'};
  }

  .emoji {
    font-size: 1.2rem;
    animation: ${props => props.$justClicked ? pop : 'none'} 0.3s ease;
  }
`;

const ReactionCount = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`;

const ReactionPicker = styled.div`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border-radius: 30px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
  z-index: 1000;
`;

const ReactionOption = styled.button`
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.3);
  }
`;

const PickerTrigger = styled.button`
  background: #f0f0f0;
  border: none;
  border-radius: 25px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
  color: #555;

  &:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }
`;

const TotalReactions = styled.div`
  margin-left: auto;
  color: #888;
  font-size: 0.9rem;
  font-weight: 600;
`;

const REACTIONS = {
  like: { emoji: '👍', label: 'Me gusta' },
  love: { emoji: '❤️', label: 'Me encanta' },
  haha: { emoji: '😂', label: 'Me divierte' },
  sad: { emoji: '😢', label: 'Me entristece' },
  angry: { emoji: '😠', label: 'Me enoja' }
};

function ReactionBar({ postId }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    like: 0,
    love: 0,
    haha: 0,
    sad: 0,
    angry: 0,
    total: 0,
    user_reaction: null
  });
  const [showPicker, setShowPicker] = useState(false);
  const [justClicked, setJustClicked] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Generar o recuperar session ID para usuarios anónimos
    let sid = localStorage.getItem('reaction_session_id');
    if (!sid) {
      sid = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('reaction_session_id', sid);
    }
    setSessionId(sid);

    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/ugc/posts/${postId}/reactions`,
        {
          params: { session_id: sessionId },
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching reactions:', err);
    }
  };

  const handleReaction = async (tipo) => {
    try {
      await axios.post(
        `${API_BASE}/ugc/posts/${postId}/react`,
        { tipo, session_id: sessionId },
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );

      // Animación
      setJustClicked(tipo);
      setTimeout(() => setJustClicked(null), 300);

      // Actualizar estadísticas
      await fetchReactions();
      setShowPicker(false);
    } catch (err) {
      console.error('Error adding reaction:', err);
      alert('Error al agregar reacción: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleQuickReaction = () => {
    if (stats.user_reaction) {
      // Si ya tiene reacción, cambiarla o quitarla
      handleReaction(stats.user_reaction);
    } else {
      // Si no tiene reacción, dar "like" por defecto
      handleReaction('like');
    }
  };

  return (
    <Container>
      <PickerTrigger
        onClick={() => setShowPicker(!showPicker)}
        title="Seleccionar reacción"
      >
        <span className="emoji">
          {stats.user_reaction ? REACTIONS[stats.user_reaction].emoji : '😊'}
        </span>
        <span>Reacciones</span>
        
        <ReactionPicker $show={showPicker}>
          {Object.entries(REACTIONS).map(([tipo, data]) => (
            <ReactionOption
              key={tipo}
              onClick={(e) => {
                e.stopPropagation();
                handleReaction(tipo);
              }}
              title={data.label}
            >
              {data.emoji}
            </ReactionOption>
          ))}
        </ReactionPicker>
      </PickerTrigger>

      {/* Mostrar reacciones activas */}
      {Object.entries(REACTIONS).map(([tipo, data]) => {
        if (stats[tipo] > 0) {
          return (
            <ReactionButton
              key={tipo}
              $active={stats.user_reaction === tipo}
              $justClicked={justClicked === tipo}
              onClick={() => handleReaction(tipo)}
              title={data.label}
            >
              <span className="emoji">{data.emoji}</span>
              <ReactionCount>{stats[tipo]}</ReactionCount>
            </ReactionButton>
          );
        }
        return null;
      })}

      {stats.total > 0 && (
        <TotalReactions>
          {stats.total} {stats.total === 1 ? 'reacción' : 'reacciones'}
        </TotalReactions>
      )}
    </Container>
  );
}

export default ReactionBar;




