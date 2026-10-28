import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { openDossierPDF, openPaymentReceiptPDF } from '../utils/pdfGenerator';
import {
  Typography,
  Card,
  Button,
  Space,
  Divider,
  Tag,
  Row,
  Col,
  Spin,
  Timeline,
  Avatar,
  message,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  InputNumber,
  Tabs,
  DatePicker,
  Descriptions,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PrinterOutlined,
  HistoryOutlined,
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  KeyOutlined,
  BuildOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { getDossierById, deleteDossier } from '../services/dossier';
import { getPayementsByDossierId, createPayement, updatePayement, deletePayement } from '../services/payement';
import {
  getAllocationDossierById,
  createAllocationMateriel,
  updateAllocationMateriel,
  deleteAllocationMateriel,
} from '../services/allocation';
import type { Pavillon } from '../types/pavillon';
import { Mois } from '../types/payement';
import type { Payement, CreatePayement, UpdatePayement } from '../types/payement';
import type {
  AllocationMateriel,
  CreateAllocationMateriel,
  UpdateAllocationMateriel,
} from '../types/allocation_materiel';
import dayjs from 'dayjs';
import { getEquipements } from '../services/equipement';
import type { Equipement } from '../types/equipement';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

interface PayementWithId extends Payement {
  _id?: string;
}

interface AllocationMaterielWithId extends AllocationMateriel {
  _id?: string;
}

const { Title, Text } = Typography;

const constatationOptions = [
  { label: 'Neuf', value: 'NEUF' },
  { label: 'Bon état', value: 'BON_ETAT' },
  { label: 'Usagé', value: 'USAGE' },
  { label: 'Détérioré', value: 'DETERIORE' },
];

export default function DossierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PayementWithId | null>(null);
  const [form] = Form.useForm();

  const [isAllocationModalVisible, setIsAllocationModalVisible] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<AllocationMaterielWithId | null>(null);
  const [allocationForm] = Form.useForm();

  const [isViewAllocationModalVisible, setIsViewAllocationModalVisible] = useState(false);
  const [viewingAllocation, setViewingAllocation] = useState<AllocationMaterielWithId | null>(null);

  const { data: dossier, isLoading } = useQuery({
    queryKey: ['dossier', id],
    queryFn: () => (id ? getDossierById(id) : Promise.reject('ID non fourni')),
    enabled: !!id,
  });

  const { data: anneeUniversitaireActive } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: () => getAnneeUniversitaireActive(),
  });

  const { data: equipements = [] } = useQuery({
    queryKey: ['equipements', id],
    queryFn: () => getEquipements(),
  });

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<PayementWithId[]>({
    queryKey: ['payments', id],
    queryFn: () => (id ? getPayementsByDossierId(id) : Promise.reject('ID non fourni')),
    enabled: !!id,
  });

  const { data: allocations = [], isLoading: isLoadingAllocations } = useQuery<AllocationMaterielWithId[]>({
    queryKey: ['allocations', id],
    queryFn: () => (id ? getAllocationDossierById(id) : Promise.reject('ID non fourni')),
    enabled: !!id,
  });

  const createPayementMutation = useMutation({
    mutationFn: (newPayement: CreatePayement) => createPayement(newPayement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      messageApi.success('Paiement enregistré avec succès');
      setIsPaymentModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      messageApi.error("Erreur lors de l'enregistrement du paiement");
    },
  });

  const updatePayementMutation = useMutation({
    mutationFn: ({ id, payment }: { id: string; payment: UpdatePayement }) => updatePayement(id, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      messageApi.success('Paiement mis à jour avec succès');
      setIsPaymentModalVisible(false);
      setEditingPayment(null);
      form.resetFields();
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du paiement');
    },
  });

  const deletePayementMutation = useMutation({
    mutationFn: (paymentId: string) => deletePayement(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      messageApi.success('Paiement supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du paiement');
    },
  });

  const createAllocationMutation = useMutation({
    mutationFn: (newAllocation: CreateAllocationMateriel) => createAllocationMateriel(newAllocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', id] });
      queryClient.invalidateQueries({ queryKey: ['allocationStats', id] });
      messageApi.success('Allocation enregistrée avec succès');
      setIsAllocationModalVisible(false);
      allocationForm.resetFields();
    },
    onError: () => {
      messageApi.error("Erreur lors de l'enregistrement de l'allocation");
    },
  });

  const updateAllocationMutation = useMutation({
    mutationFn: ({ id, allocation }: { id: string; allocation: UpdateAllocationMateriel }) =>
      updateAllocationMateriel(id, allocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', id] });
      queryClient.invalidateQueries({ queryKey: ['allocationStats', id] });
      messageApi.success('Allocation mise à jour avec succès');
      setIsAllocationModalVisible(false);
      setEditingAllocation(null);
      allocationForm.resetFields();
    },
    onError: () => {
      messageApi.error("Erreur lors de la mise à jour de l'allocation");
    },
  });

  const deleteAllocationMutation = useMutation({
    mutationFn: (allocationId: string) => deleteAllocationMateriel(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', id] });
      queryClient.invalidateQueries({ queryKey: ['allocationStats', id] });
      messageApi.success('Allocation supprimée avec succès');
    },
    onError: () => {
      messageApi.error("Erreur lors de la suppression de l'allocation");
    },
  });

  const handlePaymentSubmit = (values: CreatePayement) => {
    if (editingPayment && editingPayment._id) {
      updatePayementMutation.mutate({
        id: editingPayment._id as string,
        payment: {
          ...values,
          dossierId: id,
        },
      });
    } else {
      createPayementMutation.mutate({
        ...values,
        dossierId: id as string,
        anneeUniversitaireId: anneeUniversitaireActive?._id,
      });
    }
  };

  const handleEditPayment = (payment: PayementWithId) => {
    setEditingPayment(payment);
    form.setFieldsValue({
      montant: payment.montant,
      mois: payment.mois,
      numero_facture: payment.numero_facture,
    });
    setIsPaymentModalVisible(true);
  };

  const handleAllocationSubmit = (values: CreateAllocationMateriel) => {
    const { date, ...rest } = values;
    const allocationData = {
      ...rest,
      anneeUniversitaireId: anneeUniversitaireActive?._id,
      dossierId: id as string,
      date: dayjs(date).toDate(),
    };

    if (editingAllocation && editingAllocation._id) {
      updateAllocationMutation.mutate({
        id: editingAllocation._id,
        allocation: allocationData,
      });
    } else {
      createAllocationMutation.mutate(allocationData);
    }
  };

  const handleViewAllocation = (allocation: AllocationMaterielWithId) => {
    setViewingAllocation(allocation);
    setIsViewAllocationModalVisible(true);
  };

  const handleEditAllocation = (allocation: AllocationMaterielWithId) => {
    setEditingAllocation(allocation);
    allocationForm.setFieldsValue({
      equipementId: typeof allocation.equipementId === 'string' ? allocation.equipementId : (allocation.equipementId as Equipement)?._id,
      nombre: allocation.nombre,
      description: allocation.description,
      constatation: allocation.constatation,
      date: dayjs(allocation.date),
    });
    setIsAllocationModalVisible(true);
  };

  const handleDelete = () => {
    if (!id) return;
    Modal.confirm({
      title: 'Supprimer ce dossier ?',
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        deleteDossier(id)
          .then(() => {
            handleBack();
          })
          .catch(() => {
            messageApi.error('Erreur lors de la suppression du dossier');
          });
      },
    });
  };

  const handleBack = () => {
    navigate('/dashboard/dossiers');
  };

  const handlePrintDossier = () => {
    if (!dossier) {
      messageApi.error('Impossible de générer le PDF: données manquantes');
      return;
    }
    openDossierPDF(dossier, payments, allocations);
  };

  if (isLoading) {
    return (
      <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '65vh' }}>
        <Spin size="large" spinning={isLoading} />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="page-shell">
        <Card>
          <Empty description="Le dossier que vous recherchez n'existe pas ou a été supprimé." />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" onClick={handleBack}>
              Retour aux dossiers
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {contextHolder}

      {/* Top Navigation & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Retour aux dossiers
        </Button>
        <Space>
          <Button icon={<PrinterOutlined />} onClick={handlePrintDossier}>
            Imprimer la fiche PDF
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Supprimer
          </Button>
        </Space>
      </div>

      {/* Hero Header */}
      <div
        className="page-hero"
        style={{
          background: dossier.active
            ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
        }}
      >
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  color: '#60a5fa',
                  flexShrink: 0,
                }}
              >
                <FileOutlined />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                  Dossier d'hébergement
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: '2px 0 8px' }}>
                  Dossier {dossier.numero}
                </Title>
                <Space size={10} wrap>
                  <span
                    style={{
                      background: dossier.active ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {dossier.active ? <CheckCircleOutlined style={{ marginRight: 6 }} /> : <CloseCircleOutlined style={{ marginRight: 6 }} />}
                    {dossier.active ? 'Dossier Actif' : 'Dossier Clôturé'}
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.14)', padding: '4px 12px', borderRadius: 999, fontSize: 12 }}>
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    {typeof dossier.anneeUniversitaireId === 'string'
                      ? dossier.anneeUniversitaireId
                      : dossier.anneeUniversitaireId?.nom || 'N/A'}
                  </span>
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} md={9}>
            <Row gutter={12}>
              <Col span={12}>
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800 }}>
                    {dossier.caution?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>Caution (FCFA)</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800 }}>
                    {dossier.taux_loyer_mensuelle?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>Loyer / mois (FCFA)</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Étudiant Card */}
          <Card
            className="card-enter stagger-1"
            style={{ marginBottom: 24 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserOutlined />
                </div>
                <span>Informations du Résident</span>
              </div>
            }
          >
            {dossier.selectionId ? (
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={7} style={{ textAlign: 'center' }}>
                  <Avatar
                    size={92}
                    icon={<UserOutlined />}
                    src={`${import.meta.env.VITE_BACKURL_ETUDIANT}/${dossier.selectionId.inscription.avatar}`}
                    style={{
                      backgroundColor: '#2563eb',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                    }}
                  />
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ fontSize: 16, color: '#0f172a', display: 'block' }}>
                      {dossier.selectionId.inscription.prenom} {dossier.selectionId.inscription.nom}
                    </Text>
                    <Tag color="blue" style={{ marginTop: 6 }}>
                      NCS : {dossier.selectionId.inscription.ncs}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} md={17}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <PhoneOutlined style={{ marginRight: 6 }} />
                          Genre
                        </Text>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 4, fontSize: 15 }}>
                          {dossier.selectionId.inscription.genre === 'H' ? 'Homme' : 'Femme'}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <MailOutlined style={{ marginRight: 6 }} />
                          Nationalité
                        </Text>
                        <div style={{ fontWeight: 700, color: '#2563eb', marginTop: 4, fontSize: 15 }}>
                          {dossier.selectionId.inscription.nationalite || 'Non spécifié'}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            ) : (
              <Empty description="Informations de l'étudiant non disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* Hébergement Card */}
          <Card
            className="card-enter stagger-2"
            style={{ marginBottom: 24 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HomeOutlined />
                </div>
                <span>Affectation d'Hébergement</span>
              </div>
            }
          >
            {dossier.chambreId ? (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ padding: 18, background: '#f8fafc', borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#f5f3ff',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        margin: '0 auto 10px',
                      }}
                    >
                      <KeyOutlined />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Chambre
                    </Text>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {typeof dossier.chambreId === 'string' ? dossier.chambreId : dossier.chambreId.nom}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ padding: 18, background: '#f8fafc', borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#fffbeb',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        margin: '0 auto 10px',
                      }}
                    >
                      <BuildOutlined />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Pavillon
                    </Text>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {typeof dossier.chambreId === 'string'
                        ? '-'
                        : (dossier.chambreId.pavillonId as { nom?: string })?.nom || '-'}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ padding: 18, background: '#f8fafc', borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        margin: '0 auto 10px',
                      }}
                    >
                      <BankOutlined />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Campus
                    </Text>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {typeof dossier.chambreId === 'string'
                        ? '-'
                        : typeof (dossier.chambreId.pavillonId as { campusId?: string | { nom: string } })?.campusId ===
                          'string'
                        ? (dossier.chambreId.pavillonId as Pavillon)?.campusId?.nom || '-'
                        : (dossier.chambreId.pavillonId as { campusId?: { nom: string } })?.campusId?.nom || '-'}
                    </div>
                  </div>
                </Col>
              </Row>
            ) : (
              <Empty description="Informations de la chambre non disponibles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* Payments & Allocations Tabs */}
          <Card className="card-enter stagger-3">
            <Tabs
              defaultActiveKey="payments"
              items={[
                {
                  key: 'payments',
                  label: (
                    <Space size={6}>
                      <DollarOutlined />
                      <span>Paiements ({payments.length})</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setEditingPayment(null);
                            form.resetFields();
                            setIsPaymentModalVisible(true);
                          }}
                        >
                          Nouveau paiement
                        </Button>
                      </div>
                      <Spin spinning={isLoadingPayments}>
                        {payments.length > 0 ? (
                          <Table
                            dataSource={payments as PayementWithId[]}
                            rowKey="_id"
                            pagination={false}
                            size="middle"
                          >
                            <Table.Column
                              title="Mois"
                              dataIndex="mois"
                              key="mois"
                              render={(mois) => <Tag color="blue">{mois}</Tag>}
                            />
                            <Table.Column
                              title="Montant"
                              dataIndex="montant"
                              key="montant"
                              render={(montant) => (
                                <Text strong className="tabular-nums" style={{ color: '#059669' }}>
                                  {montant.toLocaleString()} FCFA
                                </Text>
                              )}
                            />
                            <Table.Column
                              title="N° Facture"
                              dataIndex="numero_facture"
                              key="numero_facture"
                              render={(num) => <Text code>{num}</Text>}
                            />
                            <Table.Column
                              title="Actions"
                              key="actions"
                              width={150}
                              render={(_, record: PayementWithId) => (
                                <Space>
                                  <Button
                                    type="text"
                                    title="Imprimer la quittance PDF"
                                    icon={<PrinterOutlined />}
                                    onClick={() => openPaymentReceiptPDF(record, dossier)}
                                    style={{ color: '#2563eb', background: '#eff6ff', borderRadius: 8 }}
                                  />
                                  <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditPayment(record)}
                                    style={{ color: '#d97706', background: '#fffbeb', borderRadius: 8 }}
                                  />
                                  <Popconfirm
                                    title="Supprimer ce paiement ?"
                                    onConfirm={() => deletePayementMutation.mutate(record._id as string)}
                                    okText="Oui"
                                    cancelText="Non"
                                    icon={<ExclamationCircleOutlined style={{ color: '#ef4444' }} />}
                                  >
                                    <Button
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                      style={{ background: '#fff1f2', borderRadius: 8 }}
                                    />
                                  </Popconfirm>
                                </Space>
                              )}
                            />
                          </Table>
                        ) : (
                          <Empty description="Aucun paiement enregistré" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                      </Spin>
                    </div>
                  ),
                },
                {
                  key: 'allocations',
                  label: (
                    <Space size={6}>
                      <ToolOutlined />
                      <span>Allocations matériel ({allocations.length})</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setEditingAllocation(null);
                            allocationForm.resetFields();
                            setIsAllocationModalVisible(true);
                          }}
                        >
                          Nouvelle allocation
                        </Button>
                      </div>
                      <Spin spinning={isLoadingAllocations}>
                        {allocations.length > 0 ? (
                          <Table
                            dataSource={allocations as AllocationMaterielWithId[]}
                            rowKey="_id"
                            size="middle"
                          >
                            <Table.Column
                              title="Date"
                              dataIndex="date"
                              key="date"
                              render={(date) => (
                                <Text type="secondary" className="tabular-nums">
                                  {new Date(date).toLocaleDateString('fr-FR')}
                                </Text>
                              )}
                            />
                            <Table.Column
                              title="Matériel"
                              dataIndex="equipementId"
                              key="equipementId"
                              render={(equipementId) => <Tag color="purple">{equipementId?.nom || '-'}</Tag>}
                            />
                            <Table.Column
                              title="Qté"
                              dataIndex="nombre"
                              key="nombre"
                              render={(nombre) => (
                                <Text strong className="tabular-nums" style={{ color: '#2563eb' }}>
                                  {nombre}
                                </Text>
                              )}
                            />
                            <Table.Column
                              title="Description"
                              dataIndex="description"
                              key="description"
                              ellipsis
                            />
                            <Table.Column
                              title="Actions"
                              key="actions"
                              width={150}
                              render={(_, record: AllocationMaterielWithId) => (
                                <Space>
                                  <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewAllocation(record)}
                                    style={{ color: '#2563eb', background: '#eff6ff', borderRadius: 8 }}
                                  />
                                  <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditAllocation(record)}
                                    style={{ color: '#d97706', background: '#fffbeb', borderRadius: 8 }}
                                  />
                                  <Popconfirm
                                    title="Supprimer cette allocation ?"
                                    onConfirm={() => deleteAllocationMutation.mutate(record._id as string)}
                                    okText="Oui"
                                    cancelText="Non"
                                    icon={<ExclamationCircleOutlined style={{ color: '#ef4444' }} />}
                                  >
                                    <Button
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                      style={{ background: '#fff1f2', borderRadius: 8 }}
                                    />
                                  </Popconfirm>
                                </Space>
                              )}
                            />
                          </Table>
                        ) : (
                          <Empty description="Aucune allocation enregistrée" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                      </Spin>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* Right Column - Financial & History Summary */}
        <Col xs={24} lg={8}>
          <Card
            className="card-enter stagger-2"
            style={{ marginBottom: 24 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DollarOutlined />
                </div>
                <span>Synthèse Financière</span>
              </div>
            }
          >
            <div style={{ padding: 18, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, marginBottom: 14 }}>
              <Text style={{ fontSize: 12, color: '#065f46', fontWeight: 600 }}>Caution versée</Text>
              <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                {(dossier.caution || 0).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500 }}>FCFA</span>
              </div>
            </div>

            <div style={{ padding: 18, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Loyer mensuel</Text>
              <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
                {(dossier.taux_loyer_mensuelle || 0).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500 }}>FCFA</span>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Row gutter={12}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Mensualités payées</Text>
                  <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {payments.length}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Total encaissé</Text>
                  <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: '#059669', marginTop: 2 }}>
                    {payments.reduce((acc, p) => acc + (p.montant || 0), 0).toLocaleString()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            className="card-enter stagger-3"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#fffbeb',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HistoryOutlined />
                </div>
                <span>Traçabilité du Dossier</span>
              </div>
            }
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong style={{ display: 'block', color: '#0f172a' }}>
                        Ouverture du dossier
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(dossier.createdAt as string).toLocaleDateString('fr-FR')}
                      </Text>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong style={{ display: 'block', color: '#0f172a' }}>
                        Attribution chambre
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {typeof dossier.chambreId === 'string' ? '-' : dossier.chambreId?.nom || '-'}
                      </Text>
                    </div>
                  ),
                },
                {
                  color: dossier.active ? 'green' : 'red',
                  children: (
                    <div>
                      <Text strong style={{ display: 'block', color: '#0f172a' }}>
                        Statut : {dossier.active ? 'Actif' : 'Inactif'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        MAJ : {dossier.updatedAt ? new Date(dossier.updatedAt as string).toLocaleDateString('fr-FR') : 'N/A'}
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal
        title={editingPayment ? 'Modifier le paiement' : 'Nouveau paiement'}
        open={isPaymentModalVisible}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          setEditingPayment(null);
          form.resetFields();
        }}
        centered
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePaymentSubmit}
          initialValues={{
            montant: dossier?.taux_loyer_mensuelle || 0,
          }}
        >
          <Form.Item
            name="montant"
            label="Montant (FCFA)"
            rules={[{ required: true, message: 'Veuillez saisir le montant' }]}
          >
            <Input type="number" suffix="FCFA" />
          </Form.Item>

          <Form.Item
            name="mois"
            label="Mois concerné"
            rules={[{ required: true, message: 'Veuillez sélectionner le mois' }]}
          >
            <Select placeholder="Sélectionner un mois">
              {Object.values(Mois).map((mois) => (
                <Select.Option key={mois} value={mois}>
                  {mois}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="numero_facture"
            label="Numéro de facture / quittance"
            rules={[{ required: true, message: 'Veuillez saisir le numéro de facture' }]}
          >
            <Input placeholder="Ex: FAC-2025-001" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Button
              onClick={() => {
                setIsPaymentModalVisible(false);
                setEditingPayment(null);
                form.resetFields();
              }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createPayementMutation.isPending || updatePayementMutation.isPending}
            >
              {editingPayment ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Allocation Modal */}
      <Modal
        title={editingAllocation ? "Modifier l'allocation" : 'Nouvelle allocation'}
        open={isAllocationModalVisible}
        onCancel={() => {
          setIsAllocationModalVisible(false);
          setEditingAllocation(null);
          allocationForm.resetFields();
        }}
        centered
        footer={null}
      >
        <Form
          form={allocationForm}
          layout="vertical"
          onFinish={handleAllocationSubmit}
          initialValues={{
            constatation: 'NEUF',
            nombre: 1,
          }}
        >
          <Form.Item
            name="equipementId"
            label="Matériel"
            rules={[{ required: true, message: 'Veuillez sélectionner un matériel' }]}
          >
            <Select showSearch placeholder="Sélectionner un matériel" optionFilterProp="children">
              {equipements?.map((equipement) => (
                <Select.Option key={equipement._id} value={equipement._id}>
                  {equipement.nom}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nombre"
                label="Quantité"
                rules={[{ required: true, message: 'Veuillez saisir la quantité' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date d'allocation"
                rules={[{ required: true, message: 'Veuillez sélectionner la date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="constatation"
            label="Constatation / État"
            rules={[{ required: true, message: "Veuillez sélectionner l'état" }]}
          >
            <Select options={constatationOptions} placeholder="Sélectionner l'état" />
          </Form.Item>

          <Form.Item name="description" label="Observations (optionnel)">
            <Input.TextArea rows={3} placeholder="Remarques éventuelles..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Button
              onClick={() => {
                setIsAllocationModalVisible(false);
                setEditingAllocation(null);
                allocationForm.resetFields();
              }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createAllocationMutation.isPending || updateAllocationMutation.isPending}
            >
              {editingAllocation ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Allocation Detail Modal */}
      <Modal
        title="Détail de l'allocation"
        open={isViewAllocationModalVisible}
        onCancel={() => {
          setIsViewAllocationModalVisible(false);
          setViewingAllocation(null);
        }}
        centered
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsViewAllocationModalVisible(false);
              setViewingAllocation(null);
            }}
          >
            Fermer
          </Button>,
        ]}
      >
        {viewingAllocation && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Équipement">
              {(viewingAllocation.equipementId as unknown as Equipement)?.nom || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Quantité">{viewingAllocation.nombre}</Descriptions.Item>
            <Descriptions.Item label="Date d'allocation">
              {dayjs(viewingAllocation.date).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {viewingAllocation.description || 'Aucune description'}
            </Descriptions.Item>
            <Descriptions.Item label="Constatation">
              <Tag color="blue">{viewingAllocation.constatation}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
