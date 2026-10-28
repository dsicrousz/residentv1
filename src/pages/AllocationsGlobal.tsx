/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Row,
  Col,
  Card,
  Tag,
  DatePicker,
  Empty,
} from 'antd';
import {
  ToolOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  SaveOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InboxOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { AllocationMateriel, CreateAllocationMateriel, UpdateAllocationMateriel } from '../types/allocation_materiel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAllocationMateriel,
  updateAllocationMateriel,
  deleteAllocationMateriel,
  getAllocationAnneeUniversitaireById,
} from '../services/allocation';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
import { getDossierByAnneeUniversitaireId } from '../services/dossier';
import type { Dossier } from '../types/dossier';
import type { Equipement } from '../types/equipement';
import { getEquipements } from '../services/equipement';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { exportToCsv } from '../utils/exportCsv';

const { Title, Text } = Typography;

const constatationOptions = [
  { label: 'Neuf', value: 'NEUF' },
  { label: 'Bon état', value: 'BON_ETAT' },
  { label: 'Usagé', value: 'USAGE' },
  { label: 'Détérioré', value: 'DETERIORE' },
];

export default function AllocationsGlobal() {
  const [searchText, setSearchText] = useState('');
  const [filterConstatation, setFilterConstatation] = useState<string | null>(null);
  const [currentAllocation, setCurrentAllocation] = useState<AllocationMateriel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<CreateAllocationMateriel>();
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: anneeUniversitaireActive } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: () => getAnneeUniversitaireActive(),
  });

  const { data: allocations = [], isLoading: loading } = useQuery({
    queryKey: ['allocations', anneeUniversitaireActive?._id],
    queryFn: () => getAllocationAnneeUniversitaireById(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });

  const { data: dossiers = [] } = useQuery({
    queryKey: ['dossiers', anneeUniversitaireActive?._id],
    queryFn: () => getDossierByAnneeUniversitaireId(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });

  const { data: equipements } = useQuery({
    queryKey: ['equipements'],
    queryFn: () => getEquipements(),
  });

  const { mutate: createAllocationMutation, isPending: creating } = useMutation({
    mutationFn: createAllocationMateriel,
    onSuccess: () => {
      messageApi.success('Allocation créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      handleCloseModal();
    },
    onError: () => {
      messageApi.error("Erreur lors de la création de l'allocation");
    },
  });

  const { mutate: updateAllocationMutation, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAllocationMateriel }) => updateAllocationMateriel(id, data),
    onSuccess: () => {
      messageApi.success('Allocation mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      handleCloseModal();
    },
    onError: () => {
      messageApi.error("Erreur lors de la mise à jour de l'allocation");
    },
  });

  const { mutate: deleteAllocationMutation } = useMutation({
    mutationFn: deleteAllocationMateriel,
    onSuccess: () => {
      messageApi.success('Allocation supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
    },
    onError: () => {
      messageApi.error("Erreur lors de la suppression de l'allocation");
    },
  });

  const handleOpenModal = (allocation?: AllocationMateriel) => {
    if (allocation) {
      setCurrentAllocation(allocation);
      setIsEditing(true);
      form.setFieldsValue({
        dossierId: typeof allocation.dossierId === 'string' ? allocation.dossierId : allocation.dossierId._id,
        equipementId:
          typeof allocation.equipementId === 'string'
            ? allocation.equipementId
            : (allocation.equipementId as any)._id,
        nombre: allocation.nombre,
        constatation: allocation.constatation,
        description: allocation.description,
        date: dayjs(allocation.date) as any,
      });
    } else {
      setCurrentAllocation(null);
      setIsEditing(false);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAllocation(null);
    setIsEditing(false);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      anneeUniversitaireId: anneeUniversitaireActive?._id,
      date: values.date ? values.date.toDate() : new Date(),
    };

    if (isEditing && currentAllocation) {
      updateAllocationMutation({ id: currentAllocation._id!, data });
    } else {
      createAllocationMutation(data);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette allocation ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => deleteAllocationMutation(id),
    });
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Rechercher ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
            Rechercher
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Réinitialiser
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#2563eb' : undefined }} />,
    onFilter: (value: any, record: any) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : false,
  });

  const getColumnSelectProps = (dataIndex: string, options: { label: string; value: string }[]) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Select
          mode="multiple"
          style={{ width: 200, marginBottom: 8 }}
          placeholder={`Filtrer par ${dataIndex}`}
          value={selectedKeys}
          onChange={(value) => setSelectedKeys(value)}
          options={options}
        />
        <Space>
          <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
            OK
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Réinitialiser
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <FilterOutlined style={{ color: filtered ? '#2563eb' : undefined }} />,
    onFilter: (value: any, record: any) => record[dataIndex] === value,
  });

  const totalAllocations = allocations.length;
  const totalNeuf = allocations.filter((a) => a.constatation === 'NEUF').length;
  const totalDeteriore = allocations.filter((a) => a.constatation === 'DETERIORE').length;
  const totalItems = allocations.reduce((sum, a) => sum + (a.nombre || 0), 0);

  const getConstatationColor = (constatation: string) => {
    switch (constatation) {
      case 'NEUF':
        return 'success';
      case 'BON_ETAT':
        return 'processing';
      case 'USAGE':
        return 'warning';
      case 'DETERIORE':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredAllocations = allocations.filter((allocation) => {
    const dossier = allocation.dossierId as Dossier;
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      dossier?.selectionId?.inscription?.nom?.toLowerCase().includes(searchLower) ||
      dossier?.selectionId?.inscription?.prenom?.toLowerCase().includes(searchLower) ||
      dossier?.selectionId?.inscription?.ncs?.toLowerCase().includes(searchLower);

    const matchesConstatation = !filterConstatation || allocation.constatation === filterConstatation;

    return matchesSearch && matchesConstatation;
  });

  const handleExportCsv = () => {
    exportToCsv(`allocations-${anneeUniversitaireActive?.nom || 'session'}.csv`, filteredAllocations, [
      { header: 'Date', accessor: (a) => dayjs(a.date).format('DD/MM/YYYY') },
      {
        header: 'Étudiant',
        accessor: (a) => {
          const d = a.dossierId as Dossier;
          return `${d?.selectionId?.inscription?.prenom || ''} ${d?.selectionId?.inscription?.nom || ''}`.trim();
        },
      },
      { header: 'NCS', accessor: (a) => (a.dossierId as Dossier)?.selectionId?.inscription?.ncs || '' },
      { header: 'Équipement', accessor: (a) => (a.equipementId as any)?.nom || '' },
      { header: 'Quantité', accessor: (a) => a.nombre },
      { header: 'État', accessor: (a) => a.constatation },
      { header: 'Description', accessor: (a) => a.description || '' },
    ]);
  };

  const columns: TableProps<AllocationMateriel>['columns'] = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <Text className="tabular-nums" style={{ color: '#475569' }}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Étudiant',
      dataIndex: ['dossierId', 'selectionId', 'inscription'],
      key: 'etudiant',
      render: (inscription: any) => (
        <Space>
          <UserOutlined style={{ color: '#64748b' }} />
          <Text strong style={{ color: '#0f172a' }}>
            {inscription?.prenom} {inscription?.nom}
          </Text>
        </Space>
      ),
    },
    {
      title: 'NCS',
      dataIndex: ['dossierId', 'selectionId', 'inscription', 'ncs'],
      key: 'ncs',
      render: (ncs: string) => <Tag color="blue">{ncs}</Tag>,
    },
    {
      title: 'Équipement',
      dataIndex: ['equipementId', 'nom'],
      key: 'equipementId',
      ...getColumnSearchProps('equipementId'),
      render: (equipementNom: string) => (
        <Space>
          <ToolOutlined style={{ color: '#7c3aed' }} />
          <Text strong style={{ color: '#334155' }}>
            {equipementNom}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Quantité',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre - b.nombre,
      render: (nombre: number) => (
        <Tag color="purple" className="tabular-nums" style={{ fontWeight: 600 }}>
          {nombre}
        </Tag>
      ),
    },
    {
      title: 'État constaté',
      dataIndex: 'constatation',
      key: 'constatation',
      ...getColumnSelectProps('constatation', constatationOptions),
      render: (constatation: string) => <Tag color={getConstatationColor(constatation)}>{constatation}</Tag>,
    },
    {
      title: 'Observations',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <Text type="secondary">{text || '-'}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
              style={{ color: '#d97706', background: '#fffbeb', borderRadius: 8 }}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id!)}
              danger
              style={{ background: '#fff1f2', borderRadius: 8 }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-shell">
      {contextHolder}

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <InboxOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Allocations
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {totalAllocations}
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
                  État Neuf
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#10b981' }}>
                  {totalNeuf}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#fff1f2', color: '#e11d48' }}>
                <WarningOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Matériel Détérioré
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#e11d48' }}>
                  {totalDeteriore}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="kpi-card stat-card-interactive card-enter stagger-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <ToolOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Unités Distribuées
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#7c3aed' }}>
                  {totalItems}
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
              Allocations de Matériels
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Suivi des équipements remis aux résidents et état des lieux
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher par nom, NCS..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 230 }}
              allowClear
            />
            <Select
              placeholder="Filtrer par état"
              style={{ width: 160 }}
              allowClear
              value={filterConstatation}
              onChange={setFilterConstatation}
              options={constatationOptions}
            />
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv} disabled={filteredAllocations.length === 0}>
              Exporter CSV
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
              Nouvelle Allocation
            </Button>
          </Space>
        </div>

        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredAllocations.length > 0 ? (
            <Table<AllocationMateriel>
              columns={columns}
              dataSource={filteredAllocations}
              rowKey="_id"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} allocations`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description="Aucune allocation enregistrée"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? "Modifier l'Allocation" : 'Nouvelle Allocation'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="dossierId"
            label="Dossier (Étudiant)"
            rules={[{ required: true, message: 'Veuillez sélectionner un dossier' }]}
          >
            <Select
              showSearch
              placeholder="Sélectionner un dossier"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={dossiers.map((d: Dossier) => ({
                value: d._id,
                label: `${d.selectionId?.inscription?.prenom} ${d.selectionId?.inscription?.nom} - ${d.selectionId?.inscription?.ncs}`,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipementId"
                label="Équipement"
                rules={[{ required: true, message: 'Veuillez sélectionner un équipement' }]}
              >
                <Select
                  showSearch
                  placeholder="Sélectionner un équipement"
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={equipements?.map((e: Equipement) => ({
                    value: e._id,
                    label: e.nom,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nombre"
                label="Quantité"
                rules={[{ required: true, message: 'Veuillez saisir la quantité' }]}
              >
                <Input type="number" min={1} placeholder="Ex: 1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date d'allocation"
                rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="constatation"
                label="État"
                rules={[{ required: true, message: 'Veuillez sélectionner un état' }]}
              >
                <Select placeholder="Sélectionner un état" options={constatationOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description (optionnel)">
            <Input.TextArea rows={3} placeholder="Description ou remarques..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleCloseModal}>Annuler</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={creating || updating}>
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
