import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiMessageCircle, FiX, FiSend, FiMinimize2, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const ChatBotContainer = styled.div`
  position: fixed;
  bottom: ${props => props.isOpen ? '20px' : '20px'};
  right: ${props => props.isOpen ? '20px' : '20px'};
  z-index: 1000;
  transition: all 0.3s ease;
`;

const ChatButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
  }
  
  ${props => props.isOpen && 'display: none;'}
`;

const ChatWindow = styled.div`
  width: 380px;
  height: 600px;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    height: calc(100vh - 40px);
    max-height: 600px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChatActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(26, 31, 58, 0.5);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.5);
    border-radius: 10px;
    
    &:hover {
      background: rgba(102, 126, 234, 0.7);
    }
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  gap: 0.3rem;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: ${props => props.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.isUser ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  font-size: 0.9rem;
  line-height: 1.6;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: pre-wrap;
  
  /* Estilos para markdown */
  strong {
    font-weight: 600;
    color: ${props => props.isUser ? 'white' : 'rgba(255, 255, 255, 1)'};
  }
  
  em {
    font-style: italic;
  }
  
  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.3rem 0;
    line-height: 1.5;
  }
  
  p {
    margin: 0.5rem 0;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  code {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.85em;
  }
`;

const MessageTime = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 0.5rem;
`;

const QuickQuestions = styled.div`
  padding: 1rem;
  background: rgba(26, 31, 58, 0.6);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
`;

const QuickQuestionTitle = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const QuickQuestionButton = styled.button`
  padding: 0.5rem 0.75rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateX(4px);
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  background: rgba(26, 31, 58, 0.6);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.6);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.3rem;
  padding: 0.75rem 1rem;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    animation: bounce 1.4s infinite ease-in-out;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

function ChatBot({ context = null }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: '¡Hola! 👋 Soy tu asistente de noticias. Puedo ayudarte a encontrar información sobre las noticias más relevantes, categorías, diarios y más. ¿En qué puedo ayudarte?',
      isUser: false,
      timestamp: new Date(),
      suggestedQuestions: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestedQuestions, setCurrentSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Preguntas rápidas predeterminadas basadas en el contexto
  const getQuickQuestions = () => {
    const baseQuestions = [
      '¿Cuál fue la noticia más relevante de la última semana?',
      '¿Qué noticias hay sobre política?',
      '¿Cuáles son las noticias más recientes?',
      '¿Qué diarios están disponibles?'
    ];

    if (context === 'premium') {
      return [
        '¿Qué noticias premium hay disponibles?',
        '¿Cuál es la noticia premium más reciente?',
        ...baseQuestions
      ];
    } else if (context === 'cnn') {
      return [
        '¿Qué noticias hay de CNN?',
        '¿Cuál es la última noticia de CNN?',
        ...baseQuestions
      ];
    } else if (context === 'correo') {
      return [
        '¿Qué noticias hay del Diario Correo?',
        '¿Cuál es la última noticia del Correo?',
        ...baseQuestions
      ];
    } else if (context === 'popular') {
      return [
        '¿Qué noticias hay de El Popular?',
        '¿Cuál es la última noticia de El Popular?',
        ...baseQuestions
      ];
    } else if (context === 'comercio') {
      return [
        '¿Qué noticias hay de El Comercio?',
        '¿Cuál es la última noticia de El Comercio?',
        ...baseQuestions
      ];
    }

    return baseQuestions;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text = null) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Agregar mensaje del usuario
    const userMessage = {
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chatbot/ask`, {
        question: messageText,
        context: context
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const botMessage = {
        text: response.data.answer || 'Lo siento, no pude procesar tu pregunta.',
        isUser: false,
        timestamp: new Date(),
        suggestedQuestions: response.data.suggested_questions || []
      };
      setMessages(prev => [...prev, botMessage]);
      setCurrentSuggestedQuestions(response.data.suggested_questions || []);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage = {
        text: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    setCurrentSuggestedQuestions([]); // Limpiar sugerencias al hacer una nueva pregunta
    sendMessage(question);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear el texto markdown a JSX legible
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Dividir por líneas
    const lines = text.split('\n');
    const elements = [];
    let currentList = null;
    let listItems = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Si es una línea vacía, cerrar lista si existe
      if (!trimmedLine) {
        if (currentList !== null) {
          elements.push(
            <ul key={`list-${index}`} style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              {listItems.map((item, i) => (
                <li key={i} style={{ margin: '0.3rem 0', lineHeight: '1.5' }}>{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          currentList = null;
        }
        return;
      }
      
      // Detectar listas numeradas (1., 2., etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        const itemText = numberedMatch[2];
        listItems.push(formatInlineMarkdown(itemText));
        currentList = 'numbered';
        return;
      }
      
      // Detectar listas con guiones o asteriscos
      const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
      if (bulletMatch) {
        const itemText = bulletMatch[1];
        listItems.push(formatInlineMarkdown(itemText));
        currentList = 'bullet';
        return;
      }
      
      // Si hay una lista pendiente, renderizarla
      if (currentList !== null && listItems.length > 0) {
        elements.push(
          <ul key={`list-${index}`} style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            {listItems.map((item, i) => (
              <li key={i} style={{ margin: '0.3rem 0', lineHeight: '1.5' }}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
        currentList = null;
      }
      
      // Procesar línea normal con markdown inline
      if (trimmedLine) {
        elements.push(
          <p key={index} style={{ margin: '0.5rem 0' }}>
            {formatInlineMarkdown(trimmedLine)}
          </p>
        );
      }
    });
    
    // Si queda una lista pendiente al final
    if (currentList !== null && listItems.length > 0) {
      elements.push(
        <ul key={`list-final`} style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ margin: '0.3rem 0', lineHeight: '1.5' }}>{item}</li>
          ))}
        </ul>
      );
    }
    
    return elements.length > 0 ? elements : text;
  };

  // Función para formatear markdown inline (negritas, cursivas, enlaces, etc.)
  const formatInlineMarkdown = (text) => {
    if (!text) return '';
    
    const parts = [];
    let lastIndex = 0;
    
    // Buscar enlaces markdown [texto](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    const matches = [];
    
    // Recopilar todos los matches de enlaces
    while ((match = linkRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[1],
        url: match[2]
      });
    }
    
    // Buscar negritas **texto**
    const boldRegex = /\*\*(.+?)\*\*/g;
    const boldMatches = [];
    while ((match = boldRegex.exec(text)) !== null) {
      boldMatches.push({
        index: match.index,
        length: match[0].length,
        text: match[1]
      });
    }
    
    // Combinar y ordenar todos los matches
    const allMatches = [
      ...matches.map(m => ({ ...m, type: 'link' })),
      ...boldMatches.map(m => ({ ...m, type: 'bold' }))
    ].sort((a, b) => a.index - b.index);
    
    // Procesar todos los matches
    allMatches.forEach((match) => {
      // Agregar texto antes del match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push(beforeText);
        }
      }
      
      // Agregar el elemento procesado
      if (match.type === 'link') {
        const handleLinkClick = (e) => {
          e.preventDefault();
          const url = match.url;
          if (url.startsWith('/')) {
            // Navegación interna
            navigate(url);
          } else if (url.startsWith('http')) {
            // Enlace externo
            window.open(url, '_blank');
          }
        };
        parts.push(
          <a
            key={`link-${match.index}`}
            href={match.url}
            onClick={handleLinkClick}
            style={{
              color: 'rgba(102, 126, 234, 1)',
              textDecoration: 'underline',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: '500'
            }}
          >
            {match.text}
            <FiExternalLink style={{ fontSize: '0.8rem' }} />
          </a>
        );
      } else if (match.type === 'bold') {
        parts.push(<strong key={`bold-${match.index}`}>{match.text}</strong>);
      }
      
      lastIndex = match.index + match.length;
    });
    
    // Agregar texto restante
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    // Si no hay matches, retornar el texto original
    if (parts.length === 0) {
      return text;
    }
    
    return parts;
  };

  if (isMinimized) {
    return (
      <ChatBotContainer>
        <ChatButton onClick={() => setIsMinimized(false)}>
          <FiMessageCircle />
        </ChatButton>
      </ChatBotContainer>
    );
  }

  return (
    <ChatBotContainer isOpen={isOpen}>
      {!isOpen ? (
        <ChatButton onClick={() => setIsOpen(true)}>
          <FiMessageCircle />
        </ChatButton>
      ) : (
        <ChatWindow>
          <ChatHeader>
            <ChatTitle>
              <FiMessageCircle /> Asistente de Noticias
            </ChatTitle>
            <ChatActions>
              <IconButton onClick={() => setIsMinimized(true)}>
                <FiMinimize2 />
              </IconButton>
              <IconButton onClick={() => setIsOpen(false)}>
                <FiX />
              </IconButton>
            </ChatActions>
          </ChatHeader>

          <MessagesContainer>
            {messages.map((message, index) => (
              <Message key={index} isUser={message.isUser}>
                <MessageBubble isUser={message.isUser}>
                  {formatMessage(message.text)}
                </MessageBubble>
                <MessageTime>{formatTime(message.timestamp)}</MessageTime>
              </Message>
            ))}
            {isLoading && (
              <Message isUser={false}>
                <MessageBubble isUser={false}>
                  <LoadingDots>
                    <span></span>
                    <span></span>
                    <span></span>
                  </LoadingDots>
                </MessageBubble>
              </Message>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          {messages.length === 1 && (
            <QuickQuestions>
              <QuickQuestionTitle>💡 Preguntas rápidas:</QuickQuestionTitle>
              {getQuickQuestions().slice(0, 4).map((question, index) => (
                <QuickQuestionButton
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </QuickQuestionButton>
              ))}
            </QuickQuestions>
          )}

          {currentSuggestedQuestions.length > 0 && !isLoading && (
            <QuickQuestions>
              <QuickQuestionTitle>💡 Preguntas sugeridas para continuar:</QuickQuestionTitle>
              {currentSuggestedQuestions.map((question, index) => (
                <QuickQuestionButton
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </QuickQuestionButton>
              ))}
            </QuickQuestions>
          )}

          <InputContainer>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <SendButton onClick={() => sendMessage()} disabled={isLoading || !inputValue.trim()}>
              <FiSend />
            </SendButton>
          </InputContainer>
        </ChatWindow>
      )}
    </ChatBotContainer>
  );
}

export default ChatBot;

