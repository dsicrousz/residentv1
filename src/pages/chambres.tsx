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
  Card,
  Row,
  Col,
  Select,
  Tooltip,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  KeyOutlined,
  BuildOutlined,
  EyeOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { Chambre } from '../types/chambre';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChambres, createChambre, updateChambre, deleteChambre } from '../services/chambre';
import type { Pavillon } from '../types/pavillon';
import { getPavillons } from '../services/pavillon';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Chambres() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<Chambre>();
  const [currentChambre, setCurrentChambre] = useState<Chambre>();
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });

  const { data: chambresData, isLoading } = useQuery({
    queryKey: ['chambres'],
    queryFn: () => getChambres(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { data: pavilionsData } = useQuery({
    queryKey: ['pavilions'],
    queryFn: () => getPavillons(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { mutate: createChambreMutation } = useMutation({
    mutationFn: createChambre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
      messageApi.success('Chambre ajoutée avec succès');
    },
    onError: () => {
      messageApi.error("Erreur lors de l'ajout de la chambre");
    },
  });

  const { mutate: updateChambreMutation } = useMutation({
    mutationFn: updateChambre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
      messageApi.success('Chambre mise à jour avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour de la chambre');
    },
  });

  const { mutate: deleteChambreMutation } = useMutation({
    mutationFn: deleteChambre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
      messageApi.success('Chambre supprimée avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression de la chambre');
    },
  });

  const stats = {
    total: chambresData?.length || 0,
    totalPlaces: chambresData?.reduce((acc, c) => acc + (c.lits?.length || 0), 0) || 0,
    totalPavillons: [
      ...new Set(chambresData?.map((c) => (typeof c.pavillonId === 'string' ? c.pavillonId : c.pavillonId?._id))),
    ].length || 0,
  };

  const columns = [
    {
      title: 'Chambre',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Chambre, b: Chambre) => a.nom.localeCompare(b.nom),
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
              flexShrink: 0,
            }}
          >
            <KeyOutlined />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.lits?.length || 0} lit(s)
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Pavillon',
      dataIndex: 'pavillonId',
      key: 'pavillonId',
      render: (id: string) => {
        const pavillon = pavilionsData?.find((p) => p._id === id);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: pavillon?.type === 'HOMME' ? '#eff6ff' : '#fdf2f8',
                color: pavillon?.type === 'HOMME' ? '#2563eb' : '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
              }}
            >
              <BuildOutlined />
            </div>
            <Text style={{ fontWeight: 500, color: '#334155' }}>{pavillon?.nom || '-'}</Text>
          </div>
        );
      },
      sorter: (a: Chambre, b: Chambre) => {
        const nomA = typeof a.pavillonId === 'string' ? '' : a.pavillonId.nom;
        const nomB = typeof b.pavillonId === 'string' ? '' : b.pavillonId.nom;
        return nomA.localeCompare(nomB);
      },
    },
    {
      title: 'Capacité',
      dataIndex: 'places',
      key: 'places',
      sorter: (a: Chambre, b: Chambre) => (a.lits?.length || 0) - (b.lits?.length || 0),
      render: (_: string, record: Chambre) => (
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
      width: 220,
      render: (_: unknown, record: Chambre) => (
        <Space size="small">
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

  const filteredChambres = chambresData?.filter((chambre) => {
    const pavilionNom =
      typeof chambre.pavillonId === 'string'
        ? pavilionsData?.find((p) => p._id === chambre.pavillonId)?.nom?.toLowerCase() || ''
        : chambre.pavillonId.nom.toLowerCase();

    return (
      chambre.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      pavilionNom.includes(searchText.toLowerCase())
    );
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentChambre(undefined);
    form.resetFields();
  };

  const handleEdit = (chambre: Chambre) => {
    setCurrentChambre(chambre);
    setIsEditing(true);
    form.setFieldsValue({
      nom: chambre.nom,
      pavillonId: typeof chambre.pavillonId === 'string' ? chambre.pavillonId : chambre.pavillonId._id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (chambreId: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette chambre ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          deleteChambreMutation(chambreId);
        } catch {
          messageApi.error('Erreur lors de la suppression de la chambre');
        }
      },
    });
  };

  const onFinish = () => {
    form.validateFields().then((values) => {
      if (isEditing && currentChambre) {
        updateChambreMutation({ ...values, _id: currentChambre._id });
      } else {
        createChambreMutation({ ...values, anneeUniversitaireId: activeAnnee?._id });
      }
      handleCancel();
    });
  };

  return (
    <div className="page-shell">
      {contextHolder}

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <KeyOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Chambres
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {stats.total}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <AppstoreOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Places (Lits)
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#2563eb' }}>
                  {stats.totalPlaces}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <BuildOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pavillons dotés
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#10b981' }}>
                  {stats.totalPavillons}
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
              Liste des Chambres
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Gérez les chambres des différents pavillons universitaires
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher une chambre..."
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
                setCurrentChambre(undefined);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Nouvelle Chambre
            </Button>
          </Space>
        </div>

        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredChambres && filteredChambres.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredChambres}
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
              description={searchText ? 'Aucune chambre trouvée' : 'Aucune chambre enregistrée'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? 'Modifier la chambre' : 'Nouvelle chambre'}
        open={isModalOpen}
        onCancel={handleCancel}
        width={480}
        centered
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleCancel}>Annuler</Button>
            <Button type="primary" onClick={onFinish}>
              {isEditing ? 'Mettre à jour' : 'Créer la chambre'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nom"
            label="Numéro / Nom de chambre"
            rules={[{ required: true, message: 'Veuillez saisir le numéro de la chambre' }]}
          >
            <Input
              placeholder="Ex: Chambre A101"
              prefix={<KeyOutlined style={{ color: '#94a3b8' }} />}
            />
          </Form.Item>
          <Form.Item
            name="pavillonId"
            label="Pavillon de rattachement"
            rules={[{ required: true, message: 'Veuillez sélectionner un pavillon' }]}
          >
            <Select placeholder="Sélectionner un pavillon">
              {pavilionsData?.map((pavillon: Pavillon) => (
                <Option key={pavillon._id} value={pavillon._id}>
                  <Space>
                    <BuildOutlined style={{ color: pavillon.type === 'HOMME' ? '#2563eb' : '#db2777' }} />
                    {pavillon.nom} ({pavillon.type})
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
