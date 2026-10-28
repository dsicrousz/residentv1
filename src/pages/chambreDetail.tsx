import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Button,
  Empty,
  Tag,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  BuildOutlined,
  KeyOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { FaBed } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import { getChambreById } from '../services/chambre';

const { Title, Text } = Typography;

export default function ChambreDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: chambre, isLoading: isLoadingChambre } = useQuery({
    queryKey: ['chambre', id],
    queryFn: () => getChambreById(id!),
    enabled: !!id,
  });

  if (isLoadingChambre) {
    return (
      <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '65vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!chambre && !isLoadingChambre) {
    return (
      <div className="page-shell">
        <Card>
          <Empty description="Chambre introuvable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/chambres')}>
              Retour à la liste des chambres
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalLits = chambre?.lits?.length || 0;

  return (
    <div className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/chambres')}>
          Retour aux chambres
        </Button>
        {chambre?.pavillonId && (
          <Button
            type="primary"
            icon={<BuildOutlined />}
            onClick={() => navigate(`/dashboard/pavillonDetail/${chambre?.pavillonId}`)}
          >
            Voir le Pavillon ({chambre?.pavillon?.nom || 'Pavillon'})
          </Button>
        )}
      </div>

      {/* Hero Banner */}
      <div className="page-hero">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  color: '#c4b5fd',
                  flexShrink: 0,
                }}
              >
                <KeyOutlined />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                  Unité d'hébergement
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: '2px 0 8px' }}>
                  Chambre {chambre?.nom}
                </Title>
                <Space size={10} wrap>
                  <span style={{ background: 'rgba(255, 255, 255, 0.14)', padding: '4px 12px', borderRadius: 999, fontSize: 12 }}>
                    <BuildOutlined style={{ marginRight: 6 }} />
                    {chambre?.pavillon?.nom || 'Pavillon'}
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.14)', padding: '4px 12px', borderRadius: 999, fontSize: 12 }}>
                    <AppstoreOutlined style={{ marginRight: 6 }} />
                    {totalLits} lit(s)
                  </span>
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Row gutter={12}>
              <Col span={12}>
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800 }}>{totalLits}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>Lits installés</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: 'rgba(16, 185, 129, 0.22)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 22, color: '#34d399' }} />
                  <div style={{ fontSize: 12, color: '#ecfdf5', marginTop: 4, fontWeight: 600 }}>Opérationnelle</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Lits Grid */}
      <Card
        className="card-enter stagger-2"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaBed />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Lits de la chambre</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>
                {totalLits} place(s) répertoriée(s)
              </div>
            </div>
          </div>
        }
      >
        {totalLits > 0 ? (
          <Row gutter={[16, 16]}>
            {chambre?.lits?.map((lit, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={lit._id || index}>
                <div
                  className="stat-card-interactive"
                  onClick={() => lit._id && navigate(`/dashboard/litDetail/${lit._id}`)}
                  style={{
                    padding: 20,
                    background: '#f8fafc',
                    borderRadius: 14,
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                    cursor: lit._id ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      margin: '0 auto 12px',
                    }}
                  >
                    <FaBed />
                  </div>
                  <Text strong style={{ fontSize: 15, display: 'block', color: '#0f172a' }}>
                    {(lit as { numero?: string }).numero || `Lit ${index + 1}`}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Disponible
                    </Tag>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Aucun lit configuré dans cette chambre" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  );
}
