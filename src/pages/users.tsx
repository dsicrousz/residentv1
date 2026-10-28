import { useState } from 'react';
import {
  Typography,
  Button,
  Table,
  Space,
  Input,
  Modal,
  Form,
  Select,
  message,
  Spin,
  Card,
  Row,
  Col,
  Tooltip,
  Empty,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  KeyOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { User, CreateUser, UpdateUser } from '../types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../services/user';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const { Title, Text } = Typography;
const { Option } = Select;

const defaultUser: CreateUser = {
  prenom: '',
  nom: '',
  email: '',
  password: '',
};

export default function Users() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const authUser = useAuthUser() as { id?: string } | null;
  const id = authUser?.id;

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      messageApi.success('Utilisateur ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCancel();
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'utilisateur", error);
      messageApi.error("Erreur lors de la création de l'utilisateur");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUser }) => updateUser(id, data),
    onSuccess: () => {
      messageApi.success('Utilisateur mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCancel();
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de l'utilisateur", error);
      messageApi.error("Erreur lors de la mise à jour de l'utilisateur");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      messageApi.success('Utilisateur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de l'utilisateur", error);
      messageApi.error("Erreur lors de la suppression de l'utilisateur");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { password: string } }) =>
      updateUser(id, { password: data.password }),
    onSuccess: () => {
      messageApi.success('Mot de passe réinitialisé avec succès');
      setIsResetPasswordModalOpen(false);
      resetPasswordForm.resetFields();
    },
    onError: (error) => {
      console.error('Erreur lors de la réinitialisation du mot de passe', error);
      messageApi.error('Erreur lors de la réinitialisation du mot de passe');
    },
  });

  const visibleUsers = Array.isArray(users) ? users.filter((u) => u._id !== id) : [];
  const totalAdmins = visibleUsers.filter((u) => u.role?.includes('admin')).length;
  const totalActifs = visibleUsers.filter((u) => u.isActif).length;

  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'prenom',
      key: 'prenom',
      sorter: (a: User, b: User) => a.prenom.localeCompare(b.prenom),
      render: (_: string, record: User) => {
        const initials = `${record.prenom?.[0] || ''}${record.nom?.[0] || ''}`.toUpperCase() || 'U';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <Text strong style={{ color: '#0f172a', display: 'block', fontSize: 14 }}>
                {record.prenom} {record.nom}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'Utilisateur', value: 'user' },
      ],
      onFilter: (value: React.Key | boolean, record: User) => {
        if (typeof value === 'string' && record.role) {
          return record.role.includes(value);
        }
        return false;
      },
      render: (role: string[] | undefined) => {
        const r = role?.[0] || 'user';
        const config: Record<string, { bg: string; color: string; label: string }> = {
          admin: { bg: '#eff6ff', color: '#2563eb', label: 'Administrateur' },
          manager: { bg: '#f5f3ff', color: '#7c3aed', label: 'Gestionnaire' },
          user: { bg: '#f1f5f9', color: '#475569', label: 'Utilisateur' },
        };
        const style = config[r] || config.user;
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: style.bg,
              color: style.color,
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            <SafetyCertificateOutlined />
            {style.label}
          </span>
        );
      },
    },
    {
      title: 'Statut',
      dataIndex: 'isActif',
      key: 'isActif',
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value: React.Key | boolean, record: User) => {
        return record.isActif === (value === true || value === 'true');
      },
      render: (isActif: boolean) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: isActif ? '#ecfdf5' : '#fff1f2',
            color: isActif ? '#059669' : '#e11d48',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isActif ? '#10b981' : '#f43f5e',
            }}
          />
          {isActif ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title="Modifier le profil">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{
                color: '#2563eb',
                background: '#eff6ff',
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              Modifier
            </Button>
          </Tooltip>
          <Tooltip title="Réinitialiser le mot de passe">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => showResetPasswordModal(record)}
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

  const filteredUsers = visibleUsers.filter(
    (user: User) =>
      user.prenom.toLowerCase().includes(searchText.toLowerCase()) ||
      user.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentUser(null);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    form.setFieldsValue({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role && user.role.length > 0 ? user.role[0] : 'user',
      isActif: user.isActif ? 'active' : 'inactive',
    });
    setIsModalOpen(true);
  };

  const showResetPasswordModal = (user: User) => {
    setCurrentUser(user);
    setIsResetPasswordModalOpen(true);
    resetPasswordForm.resetFields();
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        deleteUserMutation.mutate(userId);
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditing && currentUser && currentUser._id) {
        const updateData: UpdateUser = {
          prenom: values.prenom,
          nom: values.nom,
          email: values.email,
          role: [values.role],
          isActif: values.isActif === 'active',
        };
        updateUserMutation.mutate({ id: currentUser._id, data: updateData });
      } else {
        const newUser: CreateUser = {
          prenom: values.prenom,
          nom: values.nom,
          email: values.email,
          password: values.password,
        };
        createUserMutation.mutate(newUser);
      }
    });
  };

  const handleResetPassword = () => {
    resetPasswordForm.validateFields().then((values) => {
      if (currentUser && currentUser._id) {
        resetPasswordMutation.mutate({
          id: currentUser._id,
          data: { password: values.password },
        });
      }
    });
  };

  return (
    <div className="page-shell">
      {contextHolder}

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <TeamOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Collaborateurs
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {visibleUsers.length}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <SafetyCertificateOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Administrateurs
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#7c3aed' }}>
                  {totalAdmins}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <CheckCircleOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Comptes Actifs
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#10b981' }}>
                  {totalActifs}
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
              Comptes & Permissions
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Gérez les accès des agents et administrateurs de la plateforme
            </Text>
          </div>
          <Space size="middle" wrap>
            <Input
              placeholder="Rechercher par nom ou email..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={handleSearchChange}
              style={{ width: 280 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Nouvel utilisateur
            </Button>
          </Space>
        </div>

        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30'],
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} utilisateurs`,
                style: { padding: '16px 24px', margin: 0 },
              }}
            />
          ) : (
            <Empty
              description="Aucun utilisateur trouvé"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          )}
        </div>
      </Card>

      {/* Modal d'ajout/modification d'utilisateur */}
      <Modal
        title={isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={isEditing ? 'Mettre à jour' : 'Ajouter'}
        cancelText="Annuler"
        centered
        confirmLoading={createUserMutation.isPending || updateUserMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={defaultUser}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Prénom"
                name="prenom"
                rules={[{ required: true, message: 'Veuillez saisir un prénom' }]}
              >
                <Input placeholder="Prénom" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nom"
                name="nom"
                rules={[{ required: true, message: 'Veuillez saisir un nom' }]}
              >
                <Input placeholder="Nom" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email professionnel"
            name="email"
            rules={[
              { required: true, message: 'Veuillez saisir un email' },
              { type: 'email', message: 'Email invalide' },
            ]}
          >
            <Input placeholder="email@crousz.sn" />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              label="Mot de passe initial"
              name="password"
              rules={[{ required: true, message: 'Veuillez saisir un mot de passe' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Mot de passe" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Rôle"
                name="role"
                rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
              >
                <Select placeholder="Sélectionner un rôle">
                  <Option value="admin">Administrateur</Option>
                  <Option value="manager">Gestionnaire</Option>
                  <Option value="user">Utilisateur</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Statut"
                name="isActif"
                rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
              >
                <Select placeholder="Sélectionner un statut">
                  <Option value="active">Actif</Option>
                  <Option value="inactive">Inactif</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal de réinitialisation de mot de passe */}
      <Modal
        title="Réinitialiser le mot de passe"
        open={isResetPasswordModalOpen}
        onOk={handleResetPassword}
        onCancel={() => {
          setIsResetPasswordModalOpen(false);
          resetPasswordForm.resetFields();
        }}
        okText="Réinitialiser"
        cancelText="Annuler"
        centered
        confirmLoading={resetPasswordMutation.isPending}
      >
        <Form form={resetPasswordForm} layout="vertical">
          <Form.Item
            label="Nouveau mot de passe"
            name="password"
            rules={[
              { required: true, message: 'Veuillez saisir un nouveau mot de passe' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Nouveau mot de passe" />
          </Form.Item>

          <Form.Item
            label="Confirmer le mot de passe"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Veuillez confirmer le mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les deux mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Confirmer le mot de passe" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
