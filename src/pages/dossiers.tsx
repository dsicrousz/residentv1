import { useState } from 'react';
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
  Tooltip,
  Select,
  Switch,
  Row,
  Col,
  Tabs,
  Card,
  Tag,
  Empty,
} from 'antd';
import {
  FileOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PlusOutlined,
  SaveOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { FaBed } from 'react-icons/fa6';
import type { Dossier, CreateDossier, UpdateDossier } from '../types/dossier';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createDossier, updateDossier, deleteDossier, getDossierByAnneeUniversitaireId } from '../services/dossier';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
import type { Chambre } from '../types/chambre';
import { getChambres } from '../services/chambre';
import { useNavigate } from 'react-router';
import type { Lit } from '../types/lit';
import { getLitsByChambreId } from '../services/litService';
import { getSelectionsBySession } from '../services/selection';
import { exportToCsv } from '../utils/exportCsv';

const { Title, Text } = Typography;

export default function Dossiers() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('active');
  const [currentDossier, setCurrentDossier] = useState<Dossier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<CreateDossier>();
  const chambreId = Form.useWatch('chambreId', form);
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: anneeUniversitaireActive } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });

  const { data: dossiers = [], isLoading: loading } = useQuery({
    queryKey: ['dossiers', anneeUniversitaireActive?._id],
    queryFn: () => getDossierByAnneeUniversitaireId(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });

  const { data: selectionnes, isLoading: loadingSelectionnes } = useQuery({
    queryKey: ['selections', anneeUniversitaireActive?._id],
    queryFn: () => getSelectionsBySession(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });

  const { data: chambres = [] } = useQuery({
    queryKey: ['chambres'],
    queryFn: () => getChambres(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });

  const { data: lits = [] } = useQuery({
    queryKey: ['lits', chambreId],
    queryFn: () => getLitsByChambreId(chambreId as string),
    enabled: !!chambreId,
  });

  const lesNonSelectionnees = () =>
    selectionnes?.filter((selection) => !dossiers.some((dossier) => dossier.selectionId?._id === selection._id));

  const { mutate: createDossierMutation, isPending: creating } = useMutation({
    mutationFn: createDossier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      messageApi.success('Dossier créé avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error('Erreur lors de la création du dossier');
    },
  });

  const { mutate: updateDossierMutation, isPending: updating } = useMutation({
    mutationFn: updateDossier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      messageApi.success('Dossier mis à jour avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du dossier');
    },
  });

  const { mutate: deleteDossierMutation } = useMutation({
    mutationFn: deleteDossier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      messageApi.success('Dossier supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du dossier');
    },
  });

  const handleDetail = (id: string) => {
    navigate(`/dashboard/dossierDetail/${id}`);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentDossier(null);
    form.resetFields();
  };

  const showCreateModal = () => {
    setIsEditing(false);
    setCurrentDossier(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (dossier: Dossier) => {
    setCurrentDossier(dossier);
    setIsEditing(true);
    form.setFieldsValue({
      chambreId: typeof dossier.chambreId === 'string' ? dossier.chambreId : dossier.chambreId._id,
      selectionId: typeof dossier.selectionId === 'string' ? dossier.selectionId : dossier.selectionId._id,
      anneeUniversitaireId:
        typeof dossier.anneeUniversitaireId === 'string'
          ? dossier.anneeUniversitaireId
          : dossier.anneeUniversitaireId._id,
      active: dossier.active,
      caution: dossier.caution,
      taux_loyer_mensuelle: dossier.taux_loyer_mensuelle,
    });
    setIsModalOpen(true);
  };

  const onFinish = () => {
    form.validateFields().then((values) => {
      if (isEditing && currentDossier) {
        updateDossierMutation({ ...values, _id: currentDossier._id } as UpdateDossier);
      } else {
        const { selectionId, chambreId } = values;
        const hasDossier = dossiers.some((d) => d.selectionId._id === selectionId);
        if (hasDossier) {
          messageApi.warning(
            'Cet étudiant possède déjà un dossier pour cette année ' + anneeUniversitaireActive?.nom
          );
          return;
        }
        const chambre = chambres.find((c) => c._id === chambreId);
        const getNbDossierByChambre = dossiers.filter((d) => (d.chambreId as Chambre)._id === chambreId);
        if (chambre?.places && getNbDossierByChambre.length >= chambre.places) {
          messageApi.warning('Cette chambre est pleine');
          return;
        }

        createDossierMutation({ ...values, anneeUniversitaireId: anneeUniversitaireActive?._id } as CreateDossier);
      }
    });
  };

  const columns = [
    {
      title: 'N° Dossier',
      dataIndex: 'numero',
      key: 'numero',
      sorter: (a: Dossier, b: Dossier) => a.numero.localeCompare(b.numero),
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            <FileOutlined />
          </div>
          <Text strong className="tabular-nums" style={{ color: '#0f172a' }}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'Résident (Étudiant)',
      key: 'etudiantId',
      render: (_: unknown, record: Dossier) => {
        if (typeof record.selectionId === 'string') {
          return <Text>{record.selectionId}</Text>;
        }
        const insc = record.selectionId?.inscription;
        return (
          <div>
            <Text strong style={{ color: '#0f172a', display: 'block' }}>
              {insc?.prenom} {insc?.nom}
            </Text>
            <Tag color="blue" style={{ marginTop: 2, fontSize: 11 }}>
              NCS: {insc?.ncs}
            </Tag>
          </div>
        );
      },
      sorter: (a: Dossier, b: Dossier) => {
        const etudiantA = typeof a.selectionId === 'string' ? a.selectionId : a.selectionId?.inscription.ncs;
        const etudiantB = typeof b.selectionId === 'string' ? b.selectionId : b.selectionId?.inscription.ncs;
        return `${etudiantA}`.localeCompare(`${etudiantB}`);
      },
    },
    {
      title: 'Hébergement',
      key: 'chambreId',
      render: (_: unknown, record: Dossier) => (
        <Space size={6} wrap>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 6,
              background: '#f5f3ff',
              color: '#7c3aed',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <HomeOutlined />
            {typeof record.chambreId === 'string' ? record.chambreId : record.chambreId?.nom || '-'}
          </span>
          {record.litId && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 6,
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <FaBed />
              {typeof record.litId === 'string' ? record.litId : record.litId?.numero || '-'}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Session',
      dataIndex: 'anneeUniversitaireId',
      key: 'anneeUniversitaireId',
      render: (_: unknown, record: Dossier) => (
        <Space size={6}>
          <CalendarOutlined style={{ color: '#64748b' }} />
          <Text style={{ color: '#475569', fontSize: 13 }}>
            {typeof record.anneeUniversitaireId === 'string'
              ? record.anneeUniversitaireId
              : record.anneeUniversitaireId?.nom}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Créé le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text type="secondary" className="tabular-nums" style={{ fontSize: 13 }}>
          {date ? new Date(date).toLocaleDateString('fr-FR') : '-'}
        </Text>
      ),
      sorter: (a: Dossier, b: Dossier) => {
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Dossier) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record._id || '')}
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Ouvrir
          </Button>
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              style={{
                background: '#fffbeb',
                color: '#d97706',
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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce dossier ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        deleteDossierMutation(id);
      },
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesStatus = activeTab === 'active' ? dossier.active === true : dossier.active === false;

    const matchesSearch =
      dossier.numero.toLowerCase().includes(searchText) ||
      (typeof dossier.anneeUniversitaireId === 'string'
        ? dossier.anneeUniversitaireId
        : dossier.anneeUniversitaireId.nom
      )
        .toLowerCase()
        .includes(searchText) ||
      (typeof dossier.selectionId === 'string'
        ? dossier.selectionId
        : `${dossier.selectionId?.inscription?.nom} ${dossier.selectionId?.inscription?.prenom} ${dossier.selectionId?.inscription?.ncs}`
      )
        .toLowerCase()
        .includes(searchText);

    return matchesStatus && matchesSearch;
  });

  const activeDossiersCount = dossiers.filter((dossier) => dossier.active === true).length;
  const inactiveDossiersCount = dossiers.filter((dossier) => dossier.active === false).length;
  const nonLogesCount = lesNonSelectionnees()?.length || 0;

  return (
    <div className="page-shell">
      {contextHolder}

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FileOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Dossiers
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {dossiers.length}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <CheckCircleOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Dossiers Actifs
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#10b981' }}>
                  {activeDossiersCount}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f1f5f9', color: '#64748b' }}>
                <CloseCircleOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Dossiers Clôturés
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#64748b' }}>
                  {inactiveDossiersCount}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                <TeamOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sélectionnés en attente
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#f59e0b' }}>
                  {nonLogesCount}
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
              Dossiers d'Hébergement
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Attribuez les chambres et lits aux étudiants sélectionnés
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher par N° dossier, nom, NCS..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              onChange={handleSearchChange}
              style={{ width: 260 }}
              allowClear
            />
            <Button
              icon={<DownloadOutlined />}
              disabled={filteredDossiers.length === 0}
              onClick={() =>
                exportToCsv(`dossiers-${activeTab}-${anneeUniversitaireActive?.nom || 'session'}.csv`, filteredDossiers, [
                  { header: 'N° Dossier', accessor: (d) => d.numero },
                  {
                    header: 'Étudiant',
                    accessor: (d) =>
                      typeof d.selectionId === 'object'
                        ? `${d.selectionId?.inscription?.prenom || ''} ${d.selectionId?.inscription?.nom || ''}`.trim()
                        : '',
                  },
                  {
                    header: 'NCS',
                    accessor: (d) =>
                      typeof d.selectionId === 'object' ? d.selectionId?.inscription?.ncs || '' : '',
                  },
                  {
                    header: 'Chambre',
                    accessor: (d) => (typeof d.chambreId === 'object' ? d.chambreId?.nom || '' : ''),
                  },
                  {
                    header: 'Statut',
                    accessor: (d) => (d.active ? 'Actif' : 'Inactif'),
                  },
                ])
              }
            >
              Exporter CSV
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
              Nouveau Dossier
            </Button>
          </Space>
        </div>

        <div style={{ padding: '0 24px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={[
              {
                key: 'active',
                label: (
                  <Space size={6}>
                    <CheckCircleOutlined />
                    <span>Dossiers Actifs ({activeDossiersCount})</span>
                  </Space>
                ),
              },
              {
                key: 'inactive',
                label: (
                  <Space size={6}>
                    <CloseCircleOutlined />
                    <span>Dossiers Inactifs ({inactiveDossiersCount})</span>
                  </Space>
                ),
              },
            ]}
          />
        </div>

        <div>
          {loading || loadingSelectionnes ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredDossiers.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredDossiers}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30'],
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} dossiers`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description="Aucun dossier correspondant"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={isEditing ? 'Modifier le dossier' : 'Créer un nouveau dossier'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ active: true }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Étudiant sélectionné"
                name="selectionId"
                rules={[{ required: true, message: 'Veuillez sélectionner un étudiant' }]}
              >
                <Select
                  showSearch
                  placeholder="Sélectionner un étudiant"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    !!option?.label && option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  options={lesNonSelectionnees()?.map((selection) => ({
                    value: selection._id,
                    label: `${selection.inscription.nom} ${selection.inscription.prenom} (${selection.inscription.ncs})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chambre"
                name="chambreId"
                rules={[{ required: true, message: 'Veuillez sélectionner une chambre' }]}
              >
                <Select
                  showSearch
                  placeholder="Sélectionner une chambre"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    !!option?.label && option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  options={chambres.map((chambre: Chambre) => ({
                    value: chambre._id,
                    label: `${chambre.nom} ${chambre.pavillon?.nom ? `- ${chambre.pavillon.nom}` : ''}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Lit"
                name="litId"
                rules={[{ required: true, message: 'Veuillez sélectionner un lit' }]}
              >
                <Select
                  showSearch
                  placeholder="Sélectionner un lit"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    !!option?.label && option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  options={lits.map((lit: Lit) => ({ value: lit._id, label: `${lit.numero}` }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Statut du dossier" name="active" valuePropName="checked">
                <Switch checkedChildren="Actif" unCheckedChildren="Inactif" defaultChecked />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleCancel}>Annuler</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={creating || updating}>
              {isEditing ? 'Mettre à jour' : 'Créer le dossier'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
