/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Typography,
  Button,
  Table,
  Space,
  Input,
  Modal,
  Form,
  message,
  Spin,
  Card,
  Row,
  Col,
  Select,
  Empty,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BuildOutlined,
  EyeOutlined,
  SearchOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { Pavillon } from '../types/pavillon';
import { getPavillons, createPavillon, updatePavillon, deletePavillon } from '../services/pavillon';
import { getCampus } from '../services/campus';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Campus } from '../types/campus';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Pavilions() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentPavillon, setCurrentPavillon] = useState<Pavillon>();
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });

  const { data: campusesData, isLoading } = useQuery({
    queryKey: ['campuses'],
    queryFn: () => getCampus(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { data: pavilionsData } = useQuery({
    queryKey: ['pavilions', activeAnnee?._id],
    queryFn: () => getPavillons(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { mutate: createPavillonMutation } = useMutation({
    mutationFn: createPavillon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pavilions', activeAnnee?._id] });
      messageApi.success('Pavillon ajouté avec succès');
    },
    onError: () => {
      messageApi.error("Erreur lors de l'ajout du pavillon");
    },
  });

  const { mutate: updatePavillonMutation } = useMutation({
    mutationFn: updatePavillon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pavilions'] });
      messageApi.success('Pavillon mis à jour avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du pavillon');
    },
  });

  const { mutate: deletePavillonMutation } = useMutation({
    mutationFn: deletePavillon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pavilions'] });
      messageApi.success('Pavillon supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du pavillon');
    },
  });

  const stats = {
    total: pavilionsData?.length || 0,
    hommes: pavilionsData?.filter((p) => p.type === 'HOMME').length || 0,
    femmes: pavilionsData?.filter((p) => p.type === 'FEMME').length || 0,
    campusCount: [...new Set(pavilionsData?.map((p) => (p.campus as Campus)?._id))].length || 0,
  };

  const columns = [
    {
      title: 'Pavillon',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Pavillon, b: Pavillon) => a.nom.localeCompare(b.nom),
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
              fontSize: 17,
              flexShrink: 0,
            }}
          >
            <BuildOutlined />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.type === 'HOMME' ? 'Pavillon Hommes' : 'Pavillon Femmes'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Campus',
      dataIndex: 'campus',
      key: 'campus',
      render: (record: Campus) => (
        <Space>
          <HomeOutlined style={{ color: '#10b981' }} />
          <Text style={{ fontWeight: 500, color: '#334155' }}>{record?.nom || '-'}</Text>
        </Space>
      ),
    },
    {
      title: 'Affectation',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Homme', value: 'HOMME' },
        { text: 'Femme', value: 'FEMME' },
      ],
      onFilter: (value: any, record: Pavillon) => record.type === value,
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
          {type}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: Pavillon) => (
        <Space size="small">
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
              onClick={() => handleDelete(record._id || '')}
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

  const filteredPavilions = pavilionsData?.filter((pavillon) =>
    pavillon.nom.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentPavillon(undefined);
    form.resetFields();
  };

  const handleEdit = (pavillon: Pavillon) => {
    setCurrentPavillon(pavillon);
    setIsEditing(true);
    form.setFieldsValue({
      nom: pavillon.nom,
      campusId: pavillon.campusId,
      type: pavillon.type,
      description: pavillon.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce pavillon ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          deletePavillonMutation(id);
        } catch (error) {
          console.error('Erreur lors de la suppression du pavillon', error);
          messageApi.error('Erreur lors de la suppression du pavillon');
        }
      },
    });
  };

  const onFinish = () => {
    form.validateFields().then((values) => {
      if (isEditing && currentPavillon) {
        updatePavillonMutation({ ...values, _id: currentPavillon._id });
      } else {
        createPavillonMutation({ ...values, anneeUniversitaireId: activeAnnee?._id });
      }
      handleCancel();
    });
  };

  return (
    <div className="page-shell">
      {contextHolder}

      {/* Summary Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <BuildOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Pavillons
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {stats.total}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                <ManOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pavillons Hommes
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#2563eb' }}>
                  {stats.hommes}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
                <WomanOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pavillons Femmes
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#db2777' }}>
                  {stats.femmes}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <AppstoreOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Campus couverts
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#10b981' }}>
                  {stats.campusCount}
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
              Liste des Pavillons
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Gérez les bâtiments d'hébergement rattachés aux campus
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher un pavillon..."
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
                setCurrentPavillon(undefined);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Nouveau Pavillon
            </Button>
          </Space>
        </div>

        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredPavilions && filteredPavilions.length > 0 ? (
            <Table
              dataSource={filteredPavilions}
              columns={columns}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} pavillons`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description={
                searchText ? 'Aucun pavillon ne correspond à votre recherche' : 'Aucun pavillon disponible'
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? 'Modifier le pavillon' : 'Nouveau pavillon'}
        open={isModalOpen}
        onCancel={handleCancel}
        centered
        width={520}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleCancel}>Annuler</Button>
            <Button type="primary" onClick={onFinish}>
              {isEditing ? 'Mettre à jour' : 'Créer le pavillon'}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          name="pavillon_form"
          initialValues={{ capacite: 0 }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Nom du pavillon"
            name="nom"
            rules={[{ required: true, message: 'Veuillez saisir un nom' }]}
          >
            <Input
              placeholder="Ex: Pavillon A"
              prefix={<BuildOutlined style={{ color: '#94a3b8' }} />}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Campus"
                name="campusId"
                rules={[{ required: true, message: 'Veuillez sélectionner un campus' }]}
              >
                <Select placeholder="Sélectionnez un campus">
                  {campusesData?.map((campus) => (
                    <Option key={campus._id} value={campus._id}>
                      <Space>
                        <HomeOutlined style={{ color: '#10b981' }} />
                        {campus.nom}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Affectation"
                name="type"
                rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
              >
                <Select placeholder="Sélectionnez un type">
                  <Option value="HOMME">
                    <Space>
                      <ManOutlined style={{ color: '#2563eb' }} />
                      Hommes
                    </Space>
                  </Option>
                  <Option value="FEMME">
                    <Space>
                      <WomanOutlined style={{ color: '#db2777' }} />
                      Femmes
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description (optionnel)" name="description">
            <TextArea rows={3} placeholder="Ajoutez une description du pavillon..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
