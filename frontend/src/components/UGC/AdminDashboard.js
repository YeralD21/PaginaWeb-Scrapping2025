import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import ModerationPanel from './ModerationPanel';
import ReportedPostsPanel from './ReportedPostsPanel';
import EarningsConfigPanel from './EarningsConfigPanel';
import MonetizationSettingsPanel from './MonetizationSettingsPanel';

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#667eea'} 0%, ${props => props.color2 || '#764ba2'} 100%);
  padding: 2rem;
  border-radius: 15px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #667eea;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Badge = styled.span`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => props.isAdmin ? '#ff6b6b' : '#51cf66'};
  color: white;
`;

const Money = styled.span`
  color: #43e97b;
  font-weight: bold;
  font-size: 1.1rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.2rem;
`;

const RefreshButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 2rem;

  &:hover {
    background: #764ba2;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: 2px solid #667eea;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.$active ? '#764ba2' : '#f0f0f0'};
  }
`;

const PostCard = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PostTitle = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin: 1rem 0;
`;

const PostContent = styled.div`
  color: #555;
  line-height: 1.6;
  margin: 1rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
  ${props => {
    switch(props.variant) {
      case 'approve':
        return `
          background: #51cf66;
          color: white;
          &:hover { background: #40c057; }
        `;
      case 'reject':
        return `
          background: #ff6b6b;
          color: white;
          &:hover { background: #ff5252; }
        `;
      case 'suspend':
        return `
          background: #ffa94d;
          color: white;
          &:hover { background: #ff8c00; }
        `;
      default:
        return `
          background: #667eea;
          color: white;
          &:hover { background: #764ba2; }
        `;
    }
  }}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
`;

const ModalTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const API_BASE = 'http://localhost:8000';

const DiagnosticButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
`;

const DiagnosticResult = styled.pre`
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

function AdminDashboard({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'pending', 'users'
  const [diagnostic, setDiagnostic] = useState(null);

  const runDiagnostic = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/dashboard/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDiagnostic(response.data);
      console.log('🔍 Diagnóstico:', response.data);
      alert('✅ Diagnóstico completado. Revisa la consola y la sección de diagnóstico.');
    } catch (err) {
      console.error('Error en diagnóstico:', err);
      setDiagnostic({ error: err.message, details: err.response?.data });
      alert('❌ Error ejecutando diagnóstico: ' + err.message);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setDashboard(dashboardRes.data);
      setUsers(usersRes.data); // El backend devuelve directamente el array de usuarios
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      // Automáticamente ejecutar diagnóstico si hay error
      await runDiagnostic();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <Container>
        <Loading>⏳ Cargando dashboard...</Loading>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container>
        <Loading>❌ Error al cargar dashboard</Loading>
        <DiagnosticButton onClick={runDiagnostic}>
          🔍 Ejecutar Diagnóstico del Sistema
        </DiagnosticButton>
        {diagnostic && (
          <DiagnosticResult>
            {JSON.stringify(diagnostic, null, 2)}
          </DiagnosticResult>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        👑 Dashboard de Administrador
      </Title>

      {diagnostic && (
        <div>
          <DiagnosticButton onClick={runDiagnostic}>
            🔄 Re-ejecutar Diagnóstico
          </DiagnosticButton>
          <DiagnosticResult>
            <strong>🔍 Diagnóstico del Sistema:</strong>
            {'\n\n'}
            {JSON.stringify(diagnostic, null, 2)}
          </DiagnosticResult>
        </div>
      )}

      <TabContainer>
        <Tab 
          $active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Estadísticas
        </Tab>
        <Tab 
          $active={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Publicaciones Pendientes ({dashboard?.posts?.pending || 0})
        </Tab>
        <Tab 
          $active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          👥 Gestión de Usuarios
        </Tab>
        <Tab 
          $active={activeTab === 'reported'} 
          onClick={() => setActiveTab('reported')}
          style={{
            background: activeTab === 'reported' 
              ? 'linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%)' 
              : 'white',
            border: activeTab === 'reported' ? 'none' : '2px solid #667eea',
            animation: dashboard?.reports?.pending > 0 ? 'pulse 2s infinite' : 'none'
          }}
        >
          🚨 ALERT! ({dashboard?.posts?.flagged || 0})
        </Tab>
        <Tab 
          $active={activeTab === 'earnings'} 
          onClick={() => setActiveTab('earnings')}
          style={{
            background: activeTab === 'earnings' 
              ? 'linear-gradient(135deg, #28a745 0%, #51cf66 100%)' 
              : 'white',
            border: activeTab === 'earnings' ? 'none' : '2px solid #667eea'
          }}
        >
          💰 Gestionar Ganancias
        </Tab>
        <Tab 
          $active={activeTab === 'monetization'} 
          onClick={() => setActiveTab('monetization')}
          style={{
            background: activeTab === 'monetization' 
              ? 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' 
              : 'white',
            border: activeTab === 'monetization' ? 'none' : '2px solid #667eea'
          }}
        >
          ⚙️ Configurar Monetización
        </Tab>
      </TabContainer>

      {activeTab === 'dashboard' && (
        <>
          <RefreshButton onClick={fetchData}>
            🔄 Actualizar Datos
          </RefreshButton>

      {/* Estadísticas Principales */}
      <StatsGrid>
        <StatCard color="#667eea" color2="#764ba2">
          <StatValue>${dashboard.earnings?.total_ingresos || 0}</StatValue>
          <StatLabel>💰 Ingresos Totales</StatLabel>
        </StatCard>

        <StatCard color="#f093fb" color2="#f5576c">
          <StatValue>${dashboard.earnings?.ganancia_admin || 0}</StatValue>
          <StatLabel>👑 Ganancia Admin (70%)</StatLabel>
        </StatCard>

        <StatCard color="#43e97b" color2="#38f9d7">
          <StatValue>${dashboard.earnings?.ganancia_usuarios || 0}</StatValue>
          <StatLabel>👥 Ganancia Usuarios (30%)</StatLabel>
        </StatCard>

        <StatCard color="#fa709a" color2="#fee140">
          <StatValue>{dashboard.users?.total || 0}</StatValue>
          <StatLabel>👤 Total Usuarios</StatLabel>
        </StatCard>

        <StatCard color="#30cfd0" color2="#330867">
          <StatValue>{dashboard.posts?.total || 0}</StatValue>
          <StatLabel>📝 Total Posts</StatLabel>
        </StatCard>

        <StatCard color="#a8edea" color2="#fed6e3">
          <StatValue>{dashboard.users?.admins || 0}</StatValue>
          <StatLabel>👑 Admins</StatLabel>
        </StatCard>

        <StatCard color="#ff9a56" color2="#ff5e62">
          <StatValue>{dashboard.posts?.pending || 0}</StatValue>
          <StatLabel>⏳ Pendientes</StatLabel>
        </StatCard>

        <StatCard color="#21d4fd" color2="#b721ff">
          <StatValue>{dashboard.posts?.published || 0}</StatValue>
          <StatLabel>✅ Publicados</StatLabel>
        </StatCard>

        <StatCard color="#fdc830" color2="#f37335">
          <StatValue>{dashboard.reports?.total || 0}</StatValue>
          <StatLabel>🚩 Reportes</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Lista de Todos los Usuarios */}
      <Section>
        <SectionTitle>👥 Todos los Usuarios Registrados</SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Fecha Registro</Th>
              <Th>Posts</Th>
              <Th>Ganancia Total</Th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? users.map(user => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge isAdmin={user.role === 'admin'}>
                    {user.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
                  </Badge>
                </Td>
                <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                <Td>{user.total_posts || 0}</Td>
                <Td>
                  <Money>${user.ganancia_acumulada || 0}</Money>
                </Td>
              </Tr>
            )) : (
              <Tr>
                <Td colSpan="6" style={{textAlign: 'center', color: '#888'}}>
                  No hay usuarios registrados
                </Td>
              </Tr>
            )}
          </tbody>
        </Table>
      </Section>

          <div style={{
            background: '#e7f3ff', 
            padding: '1.5rem', 
            borderRadius: '12px',
            borderLeft: '4px solid #667eea'
          }}>
            <strong>ℹ️ Información del Sistema:</strong><br/>
            • Cada interacción (view/click) genera $0.01 USD<br/>
            • El admin recibe el 70% de cada interacción<br/>
            • Los creadores reciben el 30% de cada interacción<br/>
            • Puedes simular interacciones usando la API: POST /admin/simulate-interactions/:post_id
          </div>
        </>
      )}

      {activeTab === 'pending' && (
        <ModerationPanel token={token} onUpdate={fetchData} />
      )}

      {activeTab === 'reported' && (
        <ReportedPostsPanel token={token} onUpdate={fetchData} />
      )}

      {activeTab === 'users' && (
        <Section>
          <SectionTitle>👥 Gestión de Usuarios Registrados</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Fecha Registro</Th>
                <Th>Posts</Th>
                <Th>Ganancia Total</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? users.map(user => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge isAdmin={user.role === 'admin'}>
                      {user.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                  <Td>{user.total_posts || 0}</Td>
                  <Td>
                    <Money>${user.ganancia_acumulada || 0}</Money>
                  </Td>
                  <Td>
                    {user.suspendido ? (
                      <Badge style={{background: '#ff6b6b'}}>
                        🚫 SUSPENDIDO
                      </Badge>
                    ) : (
                      <Badge style={{background: '#51cf66'}}>
                        ✅ ACTIVO
                      </Badge>
                    )}
                  </Td>
                </Tr>
              )) : (
                <Tr>
                  <Td colSpan="7" style={{textAlign: 'center', color: '#888'}}>
                    No hay usuarios registrados
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </Section>
      )}

      {activeTab === 'earnings' && (
        <EarningsConfigPanel token={token} onUpdate={fetchData} />
      )}

      {activeTab === 'monetization' && (
        <MonetizationSettingsPanel token={token} onUpdate={fetchData} />
      )}
    </Container>
  );
}

export default AdminDashboard;

