import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Button,
  Table,
  Empty,
  message,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  BankOutlined,
  BuildOutlined,
  GlobalOutlined,
  CompassOutlined,
  EyeOutlined,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getCampusById } from '../services/campus';
import { getPavillonByCampusId } from '../services/pavillon';
import type { Pavillon } from '../types/pavillon';

const { Title, Text } = Typography;

export default function CampusDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: campus,
    isLoading: isLoadingCampus,
    error: campusError,
  } = useQuery({
    queryKey: ['campus', id],
    queryFn: () => getCampusById(id!),
    enabled: !!id,
  });

  const {
    data: pavilions,
    isLoading: isLoadingPavilions,
    error: pavilionsError,
  } = useQuery({
    queryKey: ['pavilions', id],
    queryFn: () => getPavillonByCampusId(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (campusError) {
      messageApi.error('Erreur lors du chargement des détails du campus');
    }
    if (pavilionsError) {
      messageApi.error('Erreur lors du chargement des pavillons');
    }
  }, [campusError, pavilionsError, messageApi]);

  const totalPavillons = pavilions?.length || 0;
  const pavillonsHommes = pavilions?.filter((p) => p.type === 'HOMME').length || 0;
  const pavillonsFemmes = pavilions?.filter((p) => p.type === 'FEMME').length || 0;

  const pavilionColumns = [
    {
      title: 'Pavillon',
      dataIndex: 'nom',
      key: 'nom',
      render: (text: string, record: Pavillon) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: record.type === 'HOMME' ? '#eff6ff' : '#fdf2f8',
              color: record.type === 'HOMME' ? '#2563eb' : '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <BuildOutlined />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.chambres?.length || 0} chambre(s)
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Affectation',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: type === 'HOMME' ? '#eff6ff' : '#fdf2f8',
            color: type === 'HOMME' ? '#2563eb' : '#db2777',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {type === 'HOMME' ? <ManOutlined /> : <WomanOutlined />}
          {type || '-'}
        </span>
      ),
    },
    {
      title: 'Chambres',
      dataIndex: 'chambres',
      key: 'chambres',
      render: (_: number, record: Pavillon) => (
        <span
          className="tabular-nums"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: '#f5f3ff',
            color: '#7c3aed',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          <HomeOutlined />
          {record.chambres?.length || 0} chambre(s)
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: Pavillon) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/dashboard/pavillonDetail/${record._id}`)}
          style={{
            color: '#2563eb',
            background: '#eff6ff',
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          Consulter
        </Button>
      ),
    },
  ];

  if (isLoadingCampus) {
    return (
      <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '65vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!campus && !isLoadingCampus) {
    return (
      <div className="page-shell">
        <Card>
          <Empty description="Campus introuvable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/campuses')}>
              Retour à la liste des campus
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {contextHolder}

      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/campuses')}
        >
          Retour aux campus
        </Button>
        {campus?.latitude && campus?.longitude && (
          <a
            href={`https://www.google.com/maps?q=${campus.latitude},${campus.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="primary" icon={<GlobalOutlined />}>
              Ouvrir dans Google Maps
            </Button>
          </a>
        )}
      </div>

      {/* Hero Banner */}
      <div className="page-hero">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={14}>
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
                <BankOutlined />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                  Site Universitaire
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: '2px 0 6px' }}>
                  {campus?.nom}
                </Title>
                <Space size={16} wrap style={{ color: '#cbd5e1', fontSize: 13 }}>
                  <span>
                    <EnvironmentOutlined style={{ marginRight: 6 }} />
                    {campus?.adresse || 'Adresse non renseignée'}
                  </span>
                  <span>
                    <CompassOutlined style={{ marginRight: 6 }} />
                    {campus?.latitude || '-'}, {campus?.longitude || '-'}
                  </span>
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} md={10}>
            <Row gutter={12}>
              <Col span={8}>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800 }}>{totalPavillons}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>Pavillons</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800 }}>{pavillonsHommes}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>Hommes</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800 }}>{pavillonsFemmes}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>Femmes</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Pavilions Table */}
      <Card
        className="card-enter stagger-2"
        styles={{ body: { padding: 0 } }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BuildOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Pavillons rattachés</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>
                {totalPavillons} pavillon(s) dans ce campus
              </div>
            </div>
          </div>
        }
      >
        {isLoadingPavilions ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : pavilions && pavilions.length > 0 ? (
          <Table
            columns={pavilionColumns}
            dataSource={pavilions}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} pavillons`,
              style: { padding: '16px 24px', margin: 0 },
            }}
          />
        ) : (
          <Empty
            description="Aucun pavillon trouvé pour ce campus"
            style={{ padding: '60px 0' }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
}
