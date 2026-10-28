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
  Card,
  Row,
  Col,
  Select,
  Tooltip,
  Switch,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  KeyOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { FaBed } from 'react-icons/fa6';
import type { Lit } from '../types/lit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLits, createLit, updateLit, deleteLit } from '../services/litService';
import type { Chambre } from '../types/chambre';
import { getChambres } from '../services/chambre';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

const { Title, Text } = Typography;

export default function Lits() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<Lit>();
  const [currentLit, setCurrentLit] = useState<Lit>();
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });

  const { data: litsData, isLoading } = useQuery<Lit[]>({
    queryKey: ['lits', activeAnnee?._id],
    queryFn: () => getLits(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { data: chambresData } = useQuery<Chambre[]>({
    queryKey: ['chambres'],
    queryFn: () => getChambres(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { mutate: createLitMutation } = useMutation({
    mutationFn: createLit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lits', activeAnnee?._id] });
      messageApi.success('Lit ajouté avec succès');
    },
    onError: () => {
      messageApi.error("Erreur lors de l'ajout du lit");
    },
  });

  const { mutate: updateLitMutation } = useMutation({
    mutationFn: ({ id, lit }: { id: string; lit: Lit }) => updateLit(id, lit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lits', activeAnnee?._id] });
      messageApi.success('Lit mis à jour avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du lit');
    },
  });

  const { mutate: deleteLitMutation } = useMutation({
    mutationFn: deleteLit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lits', activeAnnee?._id] });
      messageApi.success('Lit supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du lit');
    },
  });

  const stats = {
    total: litsData?.length || 0,
    actifs: litsData?.filter((lit: Lit) => lit.actif !== false).length || 0,
    inactifs: (litsData?.length || 0) - (litsData?.filter((lit: Lit) => lit.actif !== false).length || 0),
  };

  const columns = [
    {
      title: 'Lit',
      dataIndex: 'numero',
      key: 'numero',
      sorter: (a: Lit, b: Lit) => a.numero.localeCompare(b.numero),
      render: (text: string, record: Lit) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: record.actif !== false ? '#eff6ff' : '#f1f5f9',
              color: record.actif !== false ? '#2563eb' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            <FaBed />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description || 'Aucune description'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Chambre',
      dataIndex: 'chambreId',
      key: 'chambreId',
      render: (chambreId: string) => {
        const chambre = chambresData?.find((c: Chambre) => c._id === chambreId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
              }}
            >
              <KeyOutlined />
            </div>
            <Text style={{ fontWeight: 500, color: '#334155' }}>{chambre?.nom || '-'}</Text>
          </div>
        );
      },
      sorter: (a: Lit, b: Lit) => {
        const chambreA = chambresData?.find((c: Chambre) => c._id === a.chambreId);
        const chambreB = chambresData?.find((c: Chambre) => c._id === b.chambreId);
        return (chambreA?.nom || '').localeCompare(chambreB?.nom || '');
      },
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      key: 'actif',
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value: boolean | React.Key, record: Lit) => (record.actif !== false) === value,
      render: (actif: boolean) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: actif !== false ? '#ecfdf5' : '#f1f5f9',
            color: actif !== false ? '#059669' : '#64748b',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {actif !== false ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          {actif !== false ? 'Actif' : 'Inactif'}
        </span>
      ),
      sorter: (a: Lit, b: Lit) => Number(a.actif) - Number(b.actif),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: Lit) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/litDetail/${record._id}`)}
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

  const filteredLits = litsData?.filter((lit: Lit) => {
    const chambre = chambresData?.find((c: Chambre) => c._id === lit.chambreId);
    const chambreNom = chambre?.nom || '';

    return (
      lit.numero.toLowerCase().includes(searchText.toLowerCase()) ||
      chambreNom.toLowerCase().includes(searchText.toLowerCase()) ||
      (lit.description || '').toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentLit(undefined);
    form.resetFields();
  };

  const handleEdit = (lit: Lit) => {
    setCurrentLit(lit);
    setIsEditing(true);
    form.setFieldsValue({
      numero: lit.numero,
      chambreId: lit.chambreId,
      description: lit.description,
      actif: lit.actif ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (litId: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce lit ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          deleteLitMutation(litId);
        } catch {
          messageApi.error('Erreur lors de la suppression du lit');
        }
      },
    });
  };

  const onFinish = () => {
    form.validateFields().then((values) => {
      if (isEditing && currentLit) {
        updateLitMutation({
          id: currentLit._id,
          lit: { ...values },
        });
      } else {
        createLitMutation({ ...values, anneeUniversitaireId: activeAnnee?._id });
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
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FaBed />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Lits
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
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <CheckCircleOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Lits Actifs
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#10b981' }}>
                  {stats.actifs}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f1f5f9', color: '#64748b' }}>
                <CloseCircleOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Lits Inactifs
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#64748b' }}>
                  {stats.inactifs}
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
              Liste des Lits
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Gérez les couchages individuels rattachés aux chambres
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher un lit..."
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
                setCurrentLit(undefined);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Nouveau Lit
            </Button>
          </Space>
        </div>

        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredLits && filteredLits.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredLits}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} lits`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description={searchText ? 'Aucun lit trouvé' : 'Aucun lit enregistré'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? 'Modifier le lit' : 'Nouveau lit'}
        open={isModalOpen}
        onCancel={handleCancel}
        width={480}
        centered
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
            <Button onClick={handleCancel}>Annuler</Button>
            <Button type="primary" onClick={onFinish}>
              {isEditing ? 'Mettre à jour' : 'Créer le lit'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" initialValues={{ actif: true }}>
          <Form.Item
            name="numero"
            label="Numéro du lit"
            rules={[{ required: true, message: 'Veuillez saisir le numéro du lit' }]}
          >
            <Input
              placeholder="Ex: Lit 1"
              prefix={<FaBed style={{ color: '#94a3b8' }} />}
            />
          </Form.Item>
          <Form.Item
            name="chambreId"
            label="Chambre"
            rules={[{ required: true, message: 'Veuillez sélectionner une chambre' }]}
          >
            <Select
              placeholder="Sélectionner une chambre"
              showSearch
              optionFilterProp="label"
              filterOption={(input: string, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={chambresData?.map((chambre: Chambre) => ({
                value: chambre._id,
                label: chambre.nom,
              }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description (optionnel)">
            <Input.TextArea placeholder="Ajoutez une description du lit..." rows={3} />
          </Form.Item>
          <Form.Item name="actif" label="Statut opérationnel" valuePropName="checked">
            <Switch
              checkedChildren={
                <>
                  <CheckCircleOutlined /> Actif
                </>
              }
              unCheckedChildren={
                <>
                  <CloseCircleOutlined /> Inactif
                </>
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
