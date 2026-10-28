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
  Empty,
} from 'antd';
import {
  DollarOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  SaveOutlined,
  FilterOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { Payement, CreatePayement, UpdatePayement, Mois } from '../types/payement';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayementsByAnneeUniversitaireId, createPayement, updatePayement, deletePayement } from '../services/payement';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
import { getDossierByAnneeUniversitaireId } from '../services/dossier';
import type { Dossier } from '../types/dossier';
import type { TableProps } from 'antd';
import { openPaymentReceiptPDF } from '../utils/pdfGenerator';
import { exportToCsv } from '../utils/exportCsv';

const { Title, Text } = Typography;

const moisOptions = [
  { label: 'Janvier', value: 'JANVIER' },
  { label: 'Février', value: 'FEVRIER' },
  { label: 'Mars', value: 'MARS' },
  { label: 'Avril', value: 'AVRIL' },
  { label: 'Mai', value: 'MAI' },
  { label: 'Juin', value: 'JUIN' },
  { label: 'Juillet', value: 'JUILLET' },
  { label: 'Août', value: 'AOUT' },
  { label: 'Septembre', value: 'SEPTEMBRE' },
  { label: 'Octobre', value: 'OCTOBRE' },
  { label: 'Novembre', value: 'NOVEMBRE' },
  { label: 'Décembre', value: 'DECEMBRE' },
];

export default function PaymentsGlobal() {
  const [searchText, setSearchText] = useState('');
  const [filterMois, setFilterMois] = useState<string | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<CreatePayement>();
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: anneeUniversitaireActive } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: () => getAnneeUniversitaireActive(),
  });

  const { data: payments = [], isLoading: loading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => getPayementsByAnneeUniversitaireId(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });

  const { data: dossiers = [] } = useQuery({
    queryKey: ['dossiers', anneeUniversitaireActive?._id],
    queryFn: () => getDossierByAnneeUniversitaireId(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });

  const { mutate: createPaymentMutation, isPending: creating } = useMutation({
    mutationFn: createPayement,
    onSuccess: () => {
      messageApi.success('Paiement créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      handleCloseModal();
    },
    onError: () => {
      messageApi.error('Erreur lors de la création du paiement');
    },
  });

  const { mutate: updatePaymentMutation, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayement }) => updatePayement(id, data),
    onSuccess: () => {
      messageApi.success('Paiement mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      handleCloseModal();
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du paiement');
    },
  });

  const { mutate: deletePaymentMutation } = useMutation({
    mutationFn: deletePayement,
    onSuccess: () => {
      messageApi.success('Paiement supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du paiement');
    },
  });

  const handleOpenModal = (payment?: Payement) => {
    if (payment) {
      setCurrentPayment(payment);
      setIsEditing(true);
      form.setFieldsValue({
        dossierId: typeof payment.dossierId === 'string' ? payment.dossierId : payment.dossierId._id,
        montant: payment.montant,
        mois: payment.mois,
        numero_facture: payment.numero_facture,
      });
    } else {
      setCurrentPayment(null);
      setIsEditing(false);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPayment(null);
    setIsEditing(false);
    form.resetFields();
  };

  const handleSubmit = (values: CreatePayement) => {
    if (isEditing && currentPayment) {
      updatePaymentMutation({ id: currentPayment._id!, data: values });
    } else {
      createPaymentMutation({
        ...values,
        anneeUniversitaireId: anneeUniversitaireActive?._id,
      });
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce paiement ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => deletePaymentMutation(id),
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

  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + (p.montant || 0), 0);
  const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

  const filteredPayments = payments.filter((payment) => {
    const dossier = payment.dossierId as Dossier;
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      payment.numero_facture?.toLowerCase().includes(searchLower) ||
      dossier?.selectionId?.inscription?.nom?.toLowerCase().includes(searchLower) ||
      dossier?.selectionId?.inscription?.prenom?.toLowerCase().includes(searchLower) ||
      dossier?.selectionId?.inscription?.ncs?.toLowerCase().includes(searchLower);

    const matchesMois = !filterMois || payment.mois === filterMois;

    return matchesSearch && matchesMois;
  });

  const handleExportCsv = () => {
    exportToCsv(`paiements-${anneeUniversitaireActive?.nom || 'session'}.csv`, filteredPayments, [
      { header: 'N° Facture', accessor: (p) => p.numero_facture },
      {
        header: 'Étudiant',
        accessor: (p) => {
          const d = p.dossierId as Dossier;
          return `${d?.selectionId?.inscription?.prenom || ''} ${d?.selectionId?.inscription?.nom || ''}`.trim();
        },
      },
      { header: 'NCS', accessor: (p) => (p.dossierId as Dossier)?.selectionId?.inscription?.ncs || '' },
      { header: 'Mois', accessor: (p) => p.mois },
      { header: 'Montant (FCFA)', accessor: (p) => p.montant },
    ]);
  };

  const columns: TableProps<Payement>['columns'] = [
    {
      title: 'N° Facture',
      dataIndex: 'numero_facture',
      key: 'numero_facture',
      ...getColumnSearchProps('numero_facture'),
      render: (text) => (
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
            }}
          >
            <FileTextOutlined />
          </div>
          <Text strong className="tabular-nums" style={{ color: '#0f172a' }}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'Étudiant',
      key: 'etudiant',
      render: (_, record) => {
        const dossier = record.dossierId as Dossier;
        return (
          <Space>
            <UserOutlined style={{ color: '#64748b' }} />
            <Text strong style={{ color: '#0f172a' }}>
              {dossier?.selectionId?.inscription?.prenom} {dossier?.selectionId?.inscription?.nom}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'NCS',
      key: 'ncs',
      render: (_, record) => {
        const dossier = record.dossierId as Dossier;
        return <Tag color="blue">{dossier?.selectionId?.inscription?.ncs}</Tag>;
      },
    },
    {
      title: 'Mois',
      dataIndex: 'mois',
      key: 'mois',
      ...getColumnSelectProps('mois', moisOptions),
      render: (mois: Mois) => <Tag color="purple">{mois}</Tag>,
    },
    {
      title: 'Montant',
      dataIndex: 'montant',
      key: 'montant',
      sorter: (a, b) => a.montant - b.montant,
      render: (montant: number) => (
        <Text strong className="tabular-nums" style={{ color: '#059669' }}>
          {montant?.toLocaleString()} FCFA
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Imprimer la quittance PDF">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() =>
                openPaymentReceiptPDF(record, record.dossierId as Dossier, anneeUniversitaireActive?.nom)
              }
              style={{ color: '#2563eb', background: '#eff6ff', borderRadius: 8 }}
            />
          </Tooltip>
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
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <CheckCircleOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Quittances
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {totalPayments}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <DollarOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recettes Totales
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#059669' }}>
                  {totalAmount.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>FCFA</span>
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <ClockCircleOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Moyenne par Paiement
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#7c3aed' }}>
                  {Math.round(averagePayment).toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>FCFA</span>
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
              Journal des Paiements
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Suivi global des encaissements de loyers et édition de quittances PDF
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher par nom, NCS, N° facture..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filtrer par mois"
              style={{ width: 160 }}
              allowClear
              value={filterMois}
              onChange={setFilterMois}
              options={moisOptions}
            />
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv} disabled={filteredPayments.length === 0}>
              Exporter CSV
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
              Nouveau Paiement
            </Button>
          </Space>
        </div>

        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredPayments.length > 0 ? (
            <Table<Payement>
              columns={columns}
              dataSource={filteredPayments}
              rowKey="_id"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} paiements`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description="Aucun paiement enregistré"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? 'Modifier le Paiement' : 'Nouveau Paiement'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={540}
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
                name="mois"
                label="Mois"
                rules={[{ required: true, message: 'Veuillez sélectionner un mois' }]}
              >
                <Select placeholder="Sélectionner un mois" options={moisOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="montant"
                label="Montant (FCFA)"
                rules={[{ required: true, message: 'Veuillez saisir le montant' }]}
              >
                <Input type="number" placeholder="Ex: 15000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="numero_facture"
            label="Numéro de Facture"
            rules={[{ required: true, message: 'Veuillez saisir le numéro de facture' }]}
          >
            <Input placeholder="Ex: FAC-2025-001" />
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
