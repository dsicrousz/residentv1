import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Typography,
  Table,
  Button,
  Form,
  Input,
  Modal,
  message,
  Spin,
  Card,
  Row,
  Col,
  Empty,
  Space,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  BankOutlined,
  GlobalOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import type { Campus } from '../types/campus';
import { getCampus, createCampus, updateCampus, deleteCampus } from '../services/campus';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

const { Title, Text } = Typography;

export default function Campuses() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<Campus>();
  const [currentCampus, setCurrentCampus] = useState<Campus>();
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });

  const { data: campusesData, isLoading } = useQuery({
    queryKey: ['campuses'],
    queryFn: () => getCampus(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { mutate: createCampusMutation } = useMutation({
    mutationFn: createCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      messageApi.success('Campus ajouté avec succès');
    },
    onError: () => {
      messageApi.error("Erreur lors de l'ajout du campus");
    },
  });

  const { mutate: updateCampusMutation } = useMutation({
    mutationFn: updateCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      messageApi.success('Campus mis à jour avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du campus');
    },
  });

  const { mutate: deleteCampusMutation } = useMutation({
    mutationFn: deleteCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      messageApi.success('Campus supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du campus');
    },
  });

  const stats = {
    total: campusesData?.length || 0,
    withGps: campusesData?.filter((c) => c.latitude && c.longitude).length || 0,
  };

  const columns = [
    {
      title: 'Campus',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Campus, b: Campus) => a.nom.localeCompare(b.nom),
      render: (text: string, record: Campus) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            <BankOutlined />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {record.adresse || 'Adresse non renseignée'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Coordonnées GPS',
      key: 'coordinates',
      render: (_: unknown, record: Campus) => (
        <Space size={8} wrap>
          <span
            className="tabular-nums"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <CompassOutlined style={{ color: '#2563eb' }} />
            Lat: {record.latitude || '-'}
          </span>
          <span
            className="tabular-nums"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <GlobalOutlined style={{ color: '#10b981' }} />
            Long: {record.longitude || '-'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: Campus) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/campusDetail/${record._id}`)}
            style={{
              color: '#2563eb',
              background: '#eff6ff',
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Détails
          </Button>
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{
                color: '#d97706',
                background: '#fffbeb',
                borderRadius: 8,
              }}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id!)}
              style={{
                background: '#fff1f2',
                borderRadius: 8,
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredCampuses = campusesData?.filter(
    (campus: Campus) =>
      campus.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      (campus.adresse || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentCampus(undefined);
    form.resetFields();
  };

  const handleEdit = (campus: Campus) => {
    setCurrentCampus(campus);
    setIsEditing(true);
    form.setFieldsValue({
      nom: campus.nom,
      adresse: campus.adresse,
      latitude: campus.latitude,
      longitude: campus.longitude,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce campus ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        deleteCampusMutation(id);
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        if (isEditing && currentCampus?._id) {
          updateCampusMutation({ ...values, _id: currentCampus._id });
        } else {
          createCampusMutation({ ...values, anneeUniversitaireId: activeAnnee?._id });
        }
        handleCancel();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du campus', error);
        messageApi.error('Erreur lors de la sauvegarde du campus');
      }
    });
  };

  return (
    <div className="page-shell">
      {contextHolder}

      {/* Summary KPI Row */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <Spin spinning={isLoading}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <BankOutlined />
                </div>
                <div>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Campus
                  </Text>
                  <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                    {stats.total}
                  </Title>
                </div>
              </div>
            </Spin>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <EnvironmentOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sites Universitaires
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {stats.total}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <GlobalOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Géolocalisés (GPS)
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {stats.withGps}
                </Title>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Card className="card-enter stagger-2" styles={{ body: { padding: 0 } }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Liste des Campus
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Gérez les différents sites d'hébergement de l'établissement
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher un campus..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={handleSearchChange}
              style={{ width: 280 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEditing(false);
                setCurrentCampus(undefined);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Nouveau Campus
            </Button>
          </Space>
        </div>

        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredCampuses && filteredCampuses.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredCampuses}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} campus`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description={
                <span style={{ fontSize: 14, color: '#64748b' }}>
                  {searchText ? 'Aucun campus ne correspond à votre recherche' : 'Aucun campus disponible'}
                </span>
              }
              style={{ padding: '64px 0' }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? 'Modifier le campus' : 'Nouveau campus'}
        open={isModalOpen}
        onCancel={handleCancel}
        width={520}
        centered
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleCancel}>Annuler</Button>
            <Button type="primary" onClick={handleSubmit}>
              {isEditing ? 'Mettre à jour' : 'Créer le campus'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" initialValues={currentCampus}>
          <Form.Item
            label="Nom du campus"
            name="nom"
            rules={[{ required: true, message: 'Veuillez saisir un nom de campus' }]}
          >
            <Input
              placeholder="Ex: Campus Social Principal"
              prefix={<BankOutlined style={{ color: '#94a3b8' }} />}
            />
          </Form.Item>
          <Form.Item
            label="Adresse géographique"
            name="adresse"
            rules={[{ required: true, message: 'Veuillez saisir une adresse' }]}
          >
            <Input
              placeholder="Ex: Quartier Néma, Ziguinchor"
              prefix={<EnvironmentOutlined style={{ color: '#94a3b8' }} />}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Latitude"
                name="latitude"
                rules={[{ required: true, message: 'Veuillez saisir une latitude' }]}
              >
                <Input
                  placeholder="Ex: 12.5683"
                  prefix={<CompassOutlined style={{ color: '#94a3b8' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Longitude"
                name="longitude"
                rules={[{ required: true, message: 'Veuillez saisir une longitude' }]}
              >
                <Input
                  placeholder="Ex: -16.2719"
                  prefix={<GlobalOutlined style={{ color: '#94a3b8' }} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
