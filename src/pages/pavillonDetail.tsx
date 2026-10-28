import { useParams, useNavigate } from 'react-router';
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Button,
  Table,
  Space,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  BankOutlined,
  BuildOutlined,
  KeyOutlined,
  ManOutlined,
  WomanOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getPavillonById } from '../services/pavillon';
import { getChambreByPavillonId } from '../services/chambre';
import type { Chambre } from '../types/chambre';

const { Title, Text } = Typography;

export default function PavillonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: pavillon, isLoading: isLoadingPavillon } = useQuery({
    queryKey: ['pavillon', id],
    queryFn: () => getPavillonById(id!),
    enabled: !!id,
  });

  const { data: chambres, isLoading: isLoadingChambres } = useQuery({
    queryKey: ['chambres', id],
    queryFn: () => getChambreByPavillonId(id!),
    enabled: !!id,
  });

  const totalPlaces = chambres?.reduce((acc, chambre) => acc + (chambre.lits?.length || 0), 0) || 0;
  const totalChambres = chambres?.length || 0;

  const chambreColumns = [
    {
      title: 'Chambre',
      dataIndex: 'nom',
      key: 'nom',
      render: (text: string, record: Chambre) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <KeyOutlined />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.lits?.length || 0} lit(s) rattaché(s)
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Capacité',
      dataIndex: 'places',
      key: 'places',
      render: (_: number, record: Chambre) => (
        <span
          className="tabular-nums"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: '#eff6ff',
            color: '#2563eb',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          <AppstoreOutlined />
          {record.lits?.length || 0} place(s)
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: Chambre) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/dashboard/chambreDetail/${record._id}`)}
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

  if (isLoadingPavillon) {
    return (
      <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '65vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!pavillon && !isLoadingPavillon) {
    return (
      <div className="page-shell">
        <Card>
          <Empty description="Pavillon introuvable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/pavilions')}>
              Retour à la liste des pavillons
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/pavilions')}>
          Retour aux pavillons
        </Button>
        {pavillon?.campusId?._id && (
          <Button
            type="primary"
            icon={<BankOutlined />}
            onClick={() => navigate(`/dashboard/campusDetail/${pavillon?.campusId?._id}`)}
          >
            Voir le Campus ({pavillon?.campusId?.nom || pavillon?.campus?.nom})
          </Button>
        )}
      </div>

      {/* Hero Card */}
      <div
        className="page-hero"
        style={{
          background:
            pavillon?.type === 'HOMME'
              ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #831843 100%)',
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
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <BuildOutlined />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>
                  Bâtiment d'hébergement
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: '2px 0 8px' }}>
                  {pavillon?.nom}
                </Title>
                <Space size="middle" wrap>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.16)',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {pavillon?.type === 'HOMME' ? <ManOutlined /> : <WomanOutlined />} {pavillon?.type}
                  </span>
                  <span style={{ color: '#e2e8f0', fontSize: 13 }}>
                    <EnvironmentOutlined style={{ marginRight: 6 }} />
                    {pavillon?.campusId?.nom || pavillon?.campus?.nom || 'Campus'}
                  </span>
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Row gutter={12}>
              <Col span={12}>
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800 }}>{totalChambres}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Chambres</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800 }}>{totalPlaces}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Places (Lits)</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Chambres List */}
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
              <KeyOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Chambres du pavillon</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>
                {totalChambres} chambre(s) enregistrée(s)
              </div>
            </div>
          </div>
        }
      >
        {isLoadingChambres ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : chambres && chambres.length > 0 ? (
          <Table
            columns={chambreColumns}
            dataSource={chambres}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} chambres`,
              style: { padding: '16px 24px', margin: 0 },
            }}
          />
        ) : (
          <Empty
            description="Aucune chambre trouvée pour ce pavillon"
            style={{ padding: '60px 0' }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
}
