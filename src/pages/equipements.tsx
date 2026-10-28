import { useMemo, useState } from 'react';
import {
  Typography,
  Button,
  Table,
  Space,
  Input,
  Modal,
  Form,
  message,
  Tooltip,
  Card,
  Skeleton,
  Empty,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  ToolOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { Equipement } from '../types/equipement';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEquipements, createEquipement, updateEquipement, deleteEquipement } from '../services/equipement';

const { Title, Text, Paragraph } = Typography;

export default function Equipements() {
  const [searchText, setSearchText] = useState('');
  const [currentEquipement, setCurrentEquipement] = useState<Equipement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<Equipement>();
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: equipements = [], isLoading: loading } = useQuery({
    queryKey: ['equipements'],
    queryFn: () => getEquipements(),
  });

  const { mutate: createEquipementMutation, isPending: creating } = useMutation({
    mutationFn: createEquipement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipements'] });
      messageApi.success('Équipement créé avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error("Erreur lors de la création de l'équipement");
    },
  });

  const { mutate: updateEquipementMutation, isPending: updating } = useMutation({
    mutationFn: (params: { id: string; equipement: Equipement }) => {
      return updateEquipement(params.id, params.equipement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipements'] });
      messageApi.success('Équipement mis à jour avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error("Erreur lors de la mise à jour de l'équipement");
    },
  });

  const { mutate: deleteEquipementMutation } = useMutation({
    mutationFn: deleteEquipement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipements'] });
      messageApi.success('Équipement supprimé avec succès');
    },
    onError: () => {
      messageApi.error("Erreur lors de la suppression de l'équipement");
    },
  });

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEquipement(null);
    form.resetFields();
  };

  const showCreateModal = () => {
    setIsEditing(false);
    setCurrentEquipement(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (equipement: Equipement) => {
    setCurrentEquipement(equipement);
    setIsEditing(true);
    form.setFieldsValue({
      nom: equipement.nom,
      description: equipement.description,
    });
    setIsModalOpen(true);
  };

  const onFinish = (values: Equipement) => {
    if (isEditing && currentEquipement?._id) {
      updateEquipementMutation({ id: currentEquipement._id, equipement: values });
    } else {
      createEquipementMutation(values);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet équipement ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        deleteEquipementMutation(id);
      },
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredEquipements = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q || !Array.isArray(equipements)) return equipements;
    return equipements.filter((equipement: Equipement) => {
      const nom = equipement.nom?.toLowerCase() || '';
      const description = equipement.description?.toLowerCase() || '';
      return nom.includes(q) || description.includes(q);
    });
  }, [searchText, equipements]);

  const columns = [
    {
      title: 'Équipement',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Equipement, b: Equipement) => a.nom.localeCompare(b.nom),
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
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
            <ToolOutlined />
          </div>
          <Text strong style={{ color: '#0f172a', fontSize: 14 }}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Paragraph style={{ marginBottom: 0, color: '#475569' }} ellipsis={{ rows: 2 }}>
          {text || 'Aucune description renseignée'}
        </Paragraph>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Equipement) => (
        <Space size="small">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
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

  return (
    <div className="page-shell">
      {contextHolder}

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <InboxOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Références Matériel
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {Array.isArray(equipements) ? equipements.length : 0}
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
              Catalogue des Équipements
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Gérez les types de matériels pouvant être alloués aux résidents
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher un équipement..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              onChange={handleSearchChange}
              style={{ width: 280 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
              Ajouter un équipement
            </Button>
          </Space>
        </div>

        <div>
          {loading ? (
            <div style={{ padding: 24 }}>
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : filteredEquipements && filteredEquipements.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredEquipements}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30'],
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} équipements`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description={searchText ? 'Aucun équipement ne correspond à votre recherche' : 'Aucun équipement dans le catalogue'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      <Modal
        title={isEditing ? "Modifier l'équipement" : 'Nouvel équipement'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Nom de l'équipement"
            name="nom"
            rules={[{ required: true, message: "Veuillez entrer le nom de l'équipement" }]}
          >
            <Input placeholder="Ex: Matelas orthopédique, Clé chambre, Drap..." allowClear />
          </Form.Item>

          <Form.Item label="Description (optionnel)" name="description">
            <Input.TextArea rows={4} placeholder="Caractéristiques ou remarques sur l'équipement..." allowClear />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Button onClick={handleCancel}>Annuler</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={creating || updating}>
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
