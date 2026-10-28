import { useState } from 'react';
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
  Space,
  Switch,
  Empty,
  Select,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ImportOutlined,
  FolderOpenOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { AnneeUniversitaire, Importations } from '../types/annee_universitaire';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnneeUniversitaires,
  updateAnneeUniversitaire,
  deleteAnneeUniversitaire,
  createAnneeUniversitaire,
  Import,
} from '../services/anneeUniversitaire';
import { useNavigate } from 'react-router';

const { Title, Text } = Typography;

export default function AnneeUniversitairePage() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [form] = Form.useForm<AnneeUniversitaire>();
  const [importForm] = Form.useForm<Importations>();
  const [currentAnnee, setCurrentAnnee] = useState<AnneeUniversitaire | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: anneesData, isLoading: anneesLoading } = useQuery({
    queryKey: ['annees'],
    queryFn: () => getAnneeUniversitaires(),
  });

  const { mutate: updateAnneeUniversitaireMutation } = useMutation({
    mutationFn: updateAnneeUniversitaire,
    onSuccess: () => {
      messageApi.success('Année universitaire mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['annees'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnee'] });
    },
    onError: (e) => {
      console.error(e);
      messageApi.error("Erreur lors de la mise à jour de l'année universitaire");
    },
  });

  const { mutate: importAnneeUniversitaireMutation } = useMutation({
    mutationFn: Import,
    onSuccess: () => {
      messageApi.success('Année universitaire importée avec succès');
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      queryClient.invalidateQueries({ queryKey: ['pavilions'] });
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
    },
    onError: (e) => {
      console.error(e);
      messageApi.error("Erreur lors de l'importation de l'année universitaire");
    },
  });

  const { mutate: deleteAnneeUniversitaireMutation } = useMutation({
    mutationFn: deleteAnneeUniversitaire,
    onSuccess: () => {
      messageApi.success('Année universitaire supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['annees'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnee'] });
    },
    onError: () => {
      messageApi.error("Erreur lors de la suppression de l'année universitaire");
    },
  });

  const { mutate: createAnneeUniversitaireMutation } = useMutation({
    mutationFn: createAnneeUniversitaire,
    onSuccess: () => {
      messageApi.success('Année universitaire créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['annees'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnee'] });
    },
    onError: () => {
      messageApi.error("Erreur lors de la création de l'année universitaire");
    },
  });

  const activeAnnee = anneesData?.find((a) => a.isActif);

  const columns = [
    {
      title: 'Session de codification',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: AnneeUniversitaire, b: AnneeUniversitaire) => a.nom.localeCompare(b.nom),
      render: (text: string, record: AnneeUniversitaire) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: record.isActif ? '#ecfdf5' : '#eff6ff',
              color: record.isActif ? '#10b981' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              flexShrink: 0,
            }}
          >
            <CalendarOutlined />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, color: '#0f172a', display: 'block' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.isActif ? 'Session courante' : 'Session archivée / secondaire'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'isActif',
      key: 'active',
      render: (_: unknown, record: AnneeUniversitaire) =>
        record.isActif ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              background: '#ecfdf5',
              color: '#059669',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            <CheckCircleOutlined /> Session Active
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              background: '#f1f5f9',
              color: '#64748b',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Inactive
          </span>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_: unknown, record: AnneeUniversitaire) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<FolderOpenOutlined />}
            size="small"
            onClick={() => navigate(`/dashboard/annee_universitaire/${record._id}`)}
            style={{ borderRadius: 8, height: 34, padding: '0 14px' }}
          >
            Pilotage
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
          <Tooltip title={record.isActif ? 'Impossible de supprimer la session active' : 'Supprimer'}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
              disabled={record.isActif}
              style={{
                background: record.isActif ? undefined : '#fff1f2',
                borderRadius: 8,
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredAnnees = anneesData?.filter((annee) =>
    annee.nom.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setCurrentAnnee(null);
    setIsEditing(false);
  };

  const handleImportModalOpen = () => {
    setIsImportModalOpen(true);
    importForm.resetFields();
  };

  const handleImportModalCancel = () => {
    setIsImportModalOpen(false);
    importForm.resetFields();
  };

  const handleImportSubmit = () => {
    importForm
      .validateFields()
      .then((values) => {
        const { anneeFrom, anneeTo } = values;
        if (!anneeFrom || !anneeTo) {
          messageApi.error('Veuillez sélectionner une année source et une année destination');
          return;
        } else if (anneeFrom === anneeTo) {
          messageApi.error("L'année source et l'année destination doivent être différentes");
          return;
        }
        importAnneeUniversitaireMutation(values);
        setIsImportModalOpen(false);
        importForm.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleEdit = (annee: AnneeUniversitaire) => {
    setCurrentAnnee(annee);
    setIsEditing(true);
    form.setFieldsValue(annee);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (anneesData?.find((a) => a._id === id)?.isActif) {
      messageApi.error("Impossible de supprimer l'année universitaire active");
      return;
    }

    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette année universitaire ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        deleteAnneeUniversitaireMutation(id);
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditing && currentAnnee) {
        updateAnneeUniversitaireMutation({ ...values, _id: currentAnnee._id });
      } else {
        createAnneeUniversitaireMutation(values);
      }
      handleCancel();
    });
  };

  return (
    <div className="page-shell">
      {contextHolder}

      <div className="page-hero">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: '#60a5fa',
                  flexShrink: 0,
                }}
              >
                <CalendarOutlined />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                  Calendrier & Quotas
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: '2px 0 4px' }}>
                  Sessions de Codification
                </Title>
                <Text style={{ color: '#cbd5e1', fontSize: 14 }}>
                  Configurez les années académiques, importez le patrimoine et pilotez les sélections
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <Spin spinning={anneesLoading}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <CalendarOutlined />
                </div>
                <div>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Sessions
                  </Text>
                  <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                    {anneesData?.length || 0}
                  </Title>
                </div>
              </div>
            </Spin>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <Spin spinning={anneesLoading}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <CheckCircleOutlined />
                </div>
                <div>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Session Active
                  </Text>
                  <Title level={3} style={{ margin: '4px 0 0', color: '#059669' }}>
                    {activeAnnee ? activeAnnee.nom : 'Aucune'}
                  </Title>
                </div>
              </div>
            </Spin>
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
              Liste des Sessions
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Ouvrez une session pour paramétrer les quotas et lancer la codification
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher une session..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={handleSearchChange}
              style={{ width: 250 }}
              allowClear
            />
            <Button icon={<ImportOutlined />} onClick={handleImportModalOpen}>
              Importer le patrimoine
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEditing(false);
                setCurrentAnnee(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Nouvelle session
            </Button>
          </Space>
        </div>

        <div>
          {anneesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredAnnees && filteredAnnees.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredAnnees}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} sessions`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description="Aucune session de codification trouvée"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? 'Modifier la session' : 'Nouvelle session de codification'}
        open={isModalOpen}
        onCancel={handleCancel}
        width={480}
        centered
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleCancel}>Annuler</Button>
            <Button type="primary" onClick={handleSubmit}>
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nom de la session"
            name="nom"
            rules={[{ required: true, message: 'Veuillez saisir un nom pour la session' }]}
          >
            <Input
              placeholder="Ex: Session 2024-2025"
              prefix={<CalendarOutlined style={{ color: '#94a3b8' }} />}
            />
          </Form.Item>

          <Form.Item
            name="isActif"
            label="Définir comme session active"
            valuePropName="checked"
            tooltip="La session active sera utilisée par défaut dans toutes les fonctionnalités"
          >
            <Switch checkedChildren="Oui" unCheckedChildren="Non" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal d'importation */}
      <Modal
        title="Importer le patrimoine d'une session"
        open={isImportModalOpen}
        onCancel={handleImportModalCancel}
        width={500}
        centered
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleImportModalCancel}>Annuler</Button>
            <Button type="primary" onClick={handleImportSubmit}>
              Lancer l'importation
            </Button>
          </div>
        }
      >
        <Form form={importForm} layout="vertical">
          <Form.Item
            label="Session source (à copier)"
            name="anneeFrom"
            rules={[{ required: true, message: 'Veuillez sélectionner la session source' }]}
          >
            <Select
              placeholder="Sélectionnez la session source"
              options={anneesData?.map((annee) => ({
                value: annee._id,
                label: annee.nom,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Session destination"
            name="anneeTo"
            rules={[{ required: true, message: 'Veuillez sélectionner la session destination' }]}
          >
            <Select
              placeholder="Sélectionnez la session destination"
              options={anneesData?.map((annee) => ({
                value: annee._id,
                label: annee.nom,
              }))}
            />
          </Form.Item>

          <div
            style={{
              background: '#ecfdf5',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #a7f3d0',
            }}
          >
            <Text style={{ fontSize: 13, color: '#065f46', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CheckCircleOutlined style={{ marginTop: 3 }} />
              <span>
                L'importation copiera automatiquement toutes les structures (campus, pavillons, chambres et lits) de la session source vers la session destination.
              </span>
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
