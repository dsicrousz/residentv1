import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Button,
  Empty,
  message,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  BuildOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { FaBed } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import { getLitById } from '../services/litService';
import type { Lit } from '../types/lit';
import type { Chambre } from '../types/chambre';
import type { Pavillon } from '../types/pavillon';

const { Title, Text } = Typography;

export default function LitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: lit, isLoading: isLoadingLit, error: litError } = useQuery<Lit>({
    queryKey: ['lit', id],
    queryFn: () => getLitById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (litError) {
      messageApi.error('Erreur lors du chargement des détails du lit');
    }
  }, [litError, messageApi]);

  if (isLoadingLit) {
    return (
      <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '65vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lit && !isLoadingLit) {
    return (
      <div className="page-shell">
        <Card>
          <Empty description="Lit introuvable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/lits')}>
              Retour à la liste des lits
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const pavillonName = ((lit?.chambreId as Chambre)?.pavillonId as Pavillon)?.nom || '—';
  const pavillonId = ((lit?.chambreId as Chambre)?.pavillonId as Pavillon)?._id;
  const chambreObj = lit?.chambreId as Chambre;

  return (
    <div className="page-shell">
      {contextHolder}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/lits')}>
          Retour aux lits
        </Button>
        <Space>
          <Button
            icon={<KeyOutlined />}
            onClick={() => navigate(`/dashboard/chambreDetail/${chambreObj?._id || lit?.chambreId}`)}
          >
            Voir la Chambre
          </Button>
          <Button
            type="primary"
            icon={<BuildOutlined />}
            onClick={() => navigate(`/dashboard/pavillonDetail/${pavillonId}`)}
            disabled={!pavillonId}
          >
            Voir le Pavillon
          </Button>
        </Space>
      </div>

      {/* Hero Banner */}
      <div
        className="page-hero"
        style={{
          background:
            lit?.actif !== false
              ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
        }}
      >
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
                  color: '#60a5fa',
                  flexShrink: 0,
                }}
              >
                <FaBed />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                  Couchage Individuel
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: '2px 0 8px' }}>
                  Lit {lit?.numero}
                </Title>
                <Space size={10} wrap>
                  <span style={{ background: 'rgba(255, 255, 255, 0.14)', padding: '4px 12px', borderRadius: 999, fontSize: 12 }}>
                    <KeyOutlined style={{ marginRight: 6 }} />
                    {chambreObj?.nom || 'Chambre'}
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.14)', padding: '4px 12px', borderRadius: 999, fontSize: 12 }}>
                    <BuildOutlined style={{ marginRight: 6 }} />
                    {pavillonName}
                  </span>
                  <span
                    style={{
                      background: lit?.actif !== false ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.14)',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {lit?.actif !== false ? <CheckCircleOutlined style={{ marginRight: 6 }} /> : <CloseCircleOutlined style={{ marginRight: 6 }} />}
                    {lit?.actif !== false ? 'Actif' : 'Inactif'}
                  </span>
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Lit Details */}
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
              <InfoCircleOutlined />
            </div>
            <span>Caractéristiques du lit</span>
          </div>
        }
      >
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, height: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                Numéro du lit
              </Text>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaBed />
                {lit?.numero}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, height: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                Chambre associée
              </Text>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#7c3aed', marginTop: 6 }}>
                <KeyOutlined style={{ marginRight: 8 }} />
                {chambreObj?.nom || '-'}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, height: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                Pavillon
              </Text>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d97706', marginTop: 6 }}>
                <BuildOutlined style={{ marginRight: 8 }} />
                {pavillonName}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, height: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                Statut
              </Text>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: lit?.actif !== false ? '#059669' : '#64748b',
                  marginTop: 6,
                }}
              >
                {lit?.actif !== false ? <CheckCircleOutlined style={{ marginRight: 8 }} /> : <CloseCircleOutlined style={{ marginRight: 8 }} />}
                {lit?.actif !== false ? 'Actif' : 'Inactif'}
              </div>
            </div>
          </Col>
        </Row>

        {lit?.description && (
          <div
            style={{
              marginTop: 20,
              padding: 18,
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Description
            </Text>
            <Text style={{ fontSize: 14, color: '#334155' }}>{lit.description}</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
