/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Space,
  Button,
  Tabs,
  Form,
  InputNumber,
  Divider,
  Progress,
  message,
  Descriptions,
  Select,
  Table,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  FaBed,
  FaFemale,
  FaMale,
  FaChalkboardTeacher,
  FaPrint,
  FaArrowRight,
  FaHandHoldingHeart,
} from 'react-icons/fa';
import {
  getAnneeUniversitaireById,
  getStatsByAnneeUniversitaireId,
  getAnneeUniversitaireResults,
} from '../services/anneeUniversitaire';
import {
  getAnneeParamsByAnneeUniversitaireId,
  createAnneeParams,
  updateAnneeParams,
} from '../services/annee_params';
import type { AnneeUniversitaire, Results } from '../types/annee_universitaire';
import type { AnneeParams, SessionEtudiant } from '../types/annee_params';
import { getSessionsEtudiant } from '../services/session_etudiant';
import type { Statistiques } from '../types/statistiques';

const { Title, Text } = Typography;
type AnneeParamsWithId = AnneeParams & { _id?: string };

export default function AnneeUniversitaireDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<AnneeParams>();
  const watchedValues = Form.useWatch([], form);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: annee, isLoading: loadingAnnee } = useQuery<AnneeUniversitaire>({
    queryKey: ['annee', id],
    queryFn: () => (id ? getAnneeUniversitaireById(id) : Promise.reject('ID manquant')),
    enabled: !!id,
  });

  const { data: pedagogique_sessions, isLoading: loadingPedagogique_sessions } = useQuery<SessionEtudiant[]>({
    queryKey: ['pedagogique_sessions', id],
    queryFn: () => getSessionsEtudiant(),
    enabled: !!id,
  });

  const { data: results, isLoading: loadingResults } = useQuery<Results>({
    queryKey: ['results', id],
    queryFn: () => getAnneeUniversitaireResults(id!),
    enabled: !!id,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['anneeStats', id],
    queryFn: () => (id ? getStatsByAnneeUniversitaireId(id) : Promise.reject('ID manquant')),
    enabled: !!id,
  });

  const { data: params, isLoading: loadingParams } = useQuery<AnneeParamsWithId>({
    queryKey: ['anneeParams', id],
    queryFn: () => (id ? getAnneeParamsByAnneeUniversitaireId(id) : Promise.reject('ID manquant')),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (payload: AnneeParams) => createAnneeParams(payload),
    onSuccess: () => {
      messageApi.success('Paramètres créés avec succès');
      queryClient.invalidateQueries({ queryKey: ['anneeParams', id] });
      queryClient.invalidateQueries({ queryKey: ['results', id] });
    },
    onError: () => messageApi.error('Erreur lors de la création des paramètres'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ _id, payload }: { _id: string; payload: AnneeParams }) => updateAnneeParams(_id, payload),
    onSuccess: () => {
      messageApi.success('Paramètres mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['anneeParams', id] });
      queryClient.invalidateQueries({ queryKey: ['results', id] });
    },
    onError: () => messageApi.error('Erreur lors de la mise à jour des paramètres'),
  });

  const sum = (nums: number[]) => nums.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const clamp = (v?: number) => (typeof v === 'number' && v >= 0 ? v : 0);

  const globalSplitPercent = () => {
    const values = watchedValues || form.getFieldsValue();
    return clamp(values.pedagogique) + clamp(values.social);
  };

  const pedagogiqueSplitPercent = () => {
    const values = watchedValues || form.getFieldsValue();
    const s = sum([
      clamp(values.licence1),
      clamp(values.licence2),
      clamp(values.licence3),
      clamp(values.master1),
      clamp(values.master2),
    ]);
    return Math.min(100, Math.max(0, s));
  };

  const socialSplitPercent = () => {
    const values = watchedValues || form.getFieldsValue();
    const s = sum([
      clamp(values.amicale),
      clamp(values.interne),
      clamp(values.autre),
      clamp(values.etranger),
      clamp(values.depot),
    ]);
    return Math.min(100, Math.max(0, s));
  };

  const getCalculs = (statsData?: Statistiques) => {
    if (!statsData?.total_places_par_pavillon) {
      return {
        pavillons: [],
        totalPlaces: 0,
        totalOccupiedPlaces: 0,
        totalAvailablePlaces: 0,
        totalOccupiedPercentage: 0,
        totalAvailablePercentage: 0,
      };
    }
    const totalPlaces =
      statsData.total_places_par_pavillon.reduce(
        (acc: number, campus: any) =>
          acc + campus.pavillons.reduce((pavillonAcc: number, pavillon: any) => pavillonAcc + (pavillon.places || 0), 0),
        0
      ) || 0;
    const totalOccupiedPlaces =
      statsData.total_places_par_pavillon.reduce(
        (acc: number, campus: any) =>
          acc +
          campus.pavillons.reduce(
            (pavillonAcc: number, pavillon: any) => pavillonAcc + (pavillon.places_occupees || 0),
            0
          ),
        0
      ) || 0;
    const pavillons = statsData.total_places_par_pavillon
      .map((c: any) => ({
        pavillons: c.pavillons.map((p: any) => ({
          key: `${c.campus}-${p.pavillon}`,
          campus: c.campus,
          type: p.type,
          nom: p.pavillon,
          places_occupees: p.places_occupees || 0,
          places: p.places || 0,
        })),
      }))
      .flatMap((c) => c.pavillons);
    const totalAvailablePlaces = totalPlaces - totalOccupiedPlaces;
    const totalOccupiedPercentage = totalPlaces > 0 ? (totalOccupiedPlaces / totalPlaces) * 100 : 0;
    const totalAvailablePercentage = totalPlaces > 0 ? (totalAvailablePlaces / totalPlaces) * 100 : 0;
    return {
      pavillons,
      totalPlaces,
      totalOccupiedPlaces,
      totalAvailablePlaces,
      totalOccupiedPercentage,
      totalAvailablePercentage,
    };
  };

  const onFinish = (values: AnneeParams) => {
    if (!id) return;

    const totalGlobal = clamp(values.pedagogique) + clamp(values.social);
    if (totalGlobal !== 100) {
      messageApi.warning("La somme 'pédagogique + social' doit être égale à 100%.");
      return;
    }
    const pedSplit = sum([
      clamp(values.licence1),
      clamp(values.licence2),
      clamp(values.licence3),
      clamp(values.master1),
      clamp(values.master2),
    ]);
    if (pedSplit !== 100) {
      messageApi.warning('La répartition pédagogique (L1, L2, L3, M1, M2) doit totaliser 100%.');
      return;
    }
    const socSplit = sum([
      clamp(values.amicale),
      clamp(values.interne),
      clamp(values.autre),
      clamp(values.etranger),
      clamp(values.depot),
    ]);
    if (socSplit !== 100) {
      messageApi.warning('La répartition sociale (Amicale, Interne, Autre, Étranger, Dépôt) doit totaliser 100%.');
      return;
    }

    const payload: AnneeParams = {
      ...values,
      anneeUniversitaireId: id,
    };

    const existingId = params?._id;
    if (existingId) {
      updateMutation.mutate({ _id: existingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const initialValues: Partial<AnneeParams> = params
    ? { ...params }
    : {
        anneeUniversitaireId: id || '',
        pedagogique_session: '',
        pedagogique: 60,
        social: 40,
        licence1: 20,
        licence2: 20,
        licence3: 20,
        master1: 20,
        master2: 20,
        amicale: 20,
        interne: 20,
        autre: 20,
        etranger: 20,
        depot: 20,
      };

  const loading = loadingAnnee || loadingStats || loadingParams || loadingPedagogique_sessions || loadingResults;
  const calculsData = getCalculs(stats);

  return (
    <div className="page-shell">
      {contextHolder}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard/annee_universitaire')}>
          Retour aux sessions
        </Button>
      </div>

      {loading ? (
        <>
          <Form form={form} component={false} />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        </>
      ) : (
        <>
          {/* Hero Header */}
          <div className="page-hero">
            <Row justify="space-between" align="middle" gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.14)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      color: '#60a5fa',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarOutlined />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                      Pilotage de la Session
                    </div>
                    <Title level={2} style={{ color: '#ffffff', margin: '2px 0 8px' }}>
                      {annee?.nom}
                    </Title>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: annee?.isActif ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {annee?.isActif ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      {annee?.isActif ? 'Session Active' : 'Session Clôturée'}
                    </span>
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={12}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={8}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 600 }}>
                        Total Lits
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>
                        {calculsData.totalPlaces}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#93c5fd', textTransform: 'uppercase', fontWeight: 600 }}>
                        Quota Pédagogique
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>
                        {results?.calculs?.absoluPedagogique || 0}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600 }}>
                        Quota Social
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>
                        {results?.calculs?.absoluSociale || 0}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          {/* 3 Main Action Modules */}
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            {/* Module 1: Pédagogique */}
            <Col xs={24} lg={8}>
              <Card
                className="stat-card-interactive card-enter stagger-1"
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                styles={{ body: { display: 'flex', flexDirection: 'column', flex: 1, padding: 24 } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <FaChalkboardTeacher />
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        Sélection Pédagogique
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Attribution par département & formation
                      </Text>
                    </div>
                  </div>
                </div>

                <Row gutter={12} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                        Quota Total
                      </Text>
                      <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
                        {results?.calculs?.absoluPedagogique || 0} lits
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                        Répartition H / F
                      </Text>
                      <div className="tabular-nums" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontWeight: 700, fontSize: 15 }}>
                        <span style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FaMale /> {results?.calculs?.absoluPedGarcon || 0}
                        </span>
                        <span style={{ color: '#db2777', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FaFemale /> {results?.calculs?.absoluPedFille || 0}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Text type="secondary" style={{ fontSize: 13, marginBottom: 20, flex: 1 }}>
                  Pilotez les quotas de lits attribués par critères académiques pour chaque UFR, département et niveau d'étude.
                </Text>

                <Link to="selection-pedagogique">
                  <Button type="primary" block size="large" icon={<FaArrowRight />} iconPosition="end">
                    Ouvrir la sélection pédagogique
                  </Button>
                </Link>
              </Card>
            </Col>

            {/* Module 2: Sociale */}
            <Col xs={24} lg={8}>
              <Card
                className="stat-card-interactive card-enter stagger-2"
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                styles={{ body: { display: 'flex', flexDirection: 'column', flex: 1, padding: 24 } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                      <FaHandHoldingHeart />
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        Sélection Sociale
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Attribution sur critères sociaux
                      </Text>
                    </div>
                  </div>
                </div>

                <Row gutter={12} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                        Quota Total
                      </Text>
                      <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                        {results?.calculs?.absoluSociale || 0} lits
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                        Répartition H / F
                      </Text>
                      <div className="tabular-nums" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontWeight: 700, fontSize: 15 }}>
                        <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FaMale /> {results?.calculs?.absoluSocGarcon || 0}
                        </span>
                        <span style={{ color: '#db2777', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <FaFemale /> {results?.calculs?.absoluSocFille || 0}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Text type="secondary" style={{ fontSize: 13, marginBottom: 20, flex: 1 }}>
                  Gérez les allocations sociales (amicales, cas sociaux, étudiants internationaux et dépôts administratifs).
                </Text>

                <Link to="selection-sociale">
                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<FaArrowRight />}
                    iconPosition="end"
                    style={{ background: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                  >
                    Ouvrir la sélection sociale
                  </Button>
                </Link>
              </Card>
            </Col>

            {/* Module 3: Impressions */}
            <Col xs={24} lg={8}>
              <Card
                className="stat-card-interactive card-enter stagger-3"
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                styles={{ body: { display: 'flex', flexDirection: 'column', flex: 1, padding: 24 } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <FaPrint />
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        Impression des Fiches
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Listes officielles PDF par formation
                      </Text>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                    Documents officiels prêts à l'impression
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    En-tête République du Sénégal / MESRI / CROUSZ
                  </div>
                </div>

                <Text type="secondary" style={{ fontSize: 13, marginBottom: 20, flex: 1 }}>
                  Générez et téléchargez les listes officielles des étudiants codifiés (pédagogique et sociale) au format PDF.
                </Text>

                <Link to="impression-doc">
                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<FaArrowRight />}
                    iconPosition="end"
                    style={{ background: '#7c3aed', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
                  >
                    Accéder aux impressions
                  </Button>
                </Link>
              </Card>
            </Col>
          </Row>

          {/* Detailed Tabs: Pavilions & Parameters */}
          <Card className="card-enter stagger-3">
            <Tabs
              defaultActiveKey="pavilions"
              items={[
                {
                  key: 'pavilions',
                  label: (
                    <Space size={6}>
                      <BarChartOutlined />
                      <span>Capacité des Pavillons & Statistiques</span>
                    </Space>
                  ),
                  children: (
                    <Row gutter={[20, 20]}>
                      <Col xs={24} lg={15}>
                        <Table
                          dataSource={calculsData.pavillons}
                          rowKey="key"
                          pagination={false}
                          size="middle"
                          columns={[
                            {
                              title: 'Pavillon',
                              dataIndex: 'nom',
                              key: 'nom',
                              render: (text: string) => <Text strong>{text}</Text>,
                            },
                            {
                              title: 'Type',
                              dataIndex: 'type',
                              key: 'type',
                              render: (type: string) => (
                                <Tag color={type === 'GARCON' || type === 'HOMME' ? 'blue' : 'magenta'}>
                                  {type}
                                </Tag>
                              ),
                            },
                            {
                              title: 'Nombre de lits',
                              dataIndex: 'places',
                              key: 'places',
                              render: (places: number) => (
                                <Space>
                                  <FaBed style={{ color: '#64748b' }} />
                                  <span className="tabular-nums font-semibold">{places} lits</span>
                                </Space>
                              ),
                            },
                          ]}
                          summary={() => (
                            <Table.Summary.Row style={{ background: '#f8fafc', fontWeight: 700 }}>
                              <Table.Summary.Cell index={0} colSpan={2}>
                                Total capacité installée
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1}>
                                <span className="tabular-nums text-blue-600">
                                  {results?.calculs?.totalLits || calculsData.totalPlaces} lits
                                </span>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          )}
                        />
                      </Col>
                      <Col xs={24} lg={9}>
                        <Card size="small" title="Synthèse de la session" style={{ background: '#f8fafc' }}>
                          <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Total dossiers actifs">
                              <span className="tabular-nums font-semibold">{(stats?.dossiers || []).length}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Nombre de campus">
                              <span className="tabular-nums font-semibold">{(stats?.campus || []).length}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Pavillons actifs">
                              <span className="tabular-nums font-semibold">{calculsData.pavillons.length}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Lits occupés">
                              <span className="tabular-nums font-semibold">{calculsData.totalOccupiedPlaces}</span>
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'params',
                  label: (
                    <Space size={6}>
                      <SettingOutlined />
                      <span>Paramétrage des Quotas (%)</span>
                    </Space>
                  ),
                  children: (
                    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: 10,
                          marginBottom: 20,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <InfoCircleOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                        <Text style={{ color: '#1e40af', fontSize: 13 }}>
                          Définissez les clés de répartition entre la sélection pédagogique et sociale, ainsi que par niveau d'étude. Chaque groupe doit totaliser exactement 100%.
                        </Text>
                      </div>

                      <Row gutter={[20, 20]}>
                        <Col xs={24} md={12}>
                          <Card size="small" title="1. Répartition globale (Pédagogique + Social = 100%)">
                            <Form.Item name="pedagogique_session" label="Session pédagogique de référence">
                              <Select
                                placeholder="Sélectionner une session"
                                showSearch
                                filterOption={(input, option) =>
                                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={pedagogique_sessions?.map((session) => ({
                                  value: session._id,
                                  label: session.nom,
                                }))}
                              />
                            </Form.Item>
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item name="pedagogique" label="Quota Pédagogique (%)" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="social" label="Quota Social (%)" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Divider style={{ margin: '8px 0 12px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text type="secondary">Total cumulé</Text>
                              <Text strong className="tabular-nums" style={{ color: globalSplitPercent() === 100 ? '#059669' : '#e11d48' }}>
                                {globalSplitPercent()}%
                              </Text>
                            </div>
                            <Progress
                              percent={Math.min(100, globalSplitPercent())}
                              status={globalSplitPercent() === 100 ? 'success' : 'exception'}
                              showInfo={false}
                            />
                          </Card>
                        </Col>

                        <Col xs={24} md={12}>
                          <Card size="small" title="2. Répartition Pédagogique par cycle (Total = 100%)">
                            <Row gutter={12}>
                              <Col span={8}>
                                <Form.Item name="licence1" label="Licence 1" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name="licence2" label="Licence 2" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name="licence3" label="Licence 3" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="master1" label="Master 1" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="master2" label="Master 2" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Divider style={{ margin: '8px 0 12px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text type="secondary">Total cycles pédagogiques</Text>
                              <Text strong className="tabular-nums" style={{ color: pedagogiqueSplitPercent() === 100 ? '#059669' : '#e11d48' }}>
                                {pedagogiqueSplitPercent()}%
                              </Text>
                            </div>
                            <Progress
                              percent={pedagogiqueSplitPercent()}
                              status={pedagogiqueSplitPercent() === 100 ? 'success' : 'exception'}
                              showInfo={false}
                            />
                          </Card>
                        </Col>

                        <Col xs={24}>
                          <Card size="small" title="3. Répartition Sociale détaillée (Total = 100%)">
                            <Row gutter={16}>
                              <Col xs={24} sm={12} md={4}>
                                <Form.Item name="amicale" label="Amicale (%)" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} md={5}>
                                <Form.Item name="interne" label="Interne (%)" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} md={5}>
                                <Form.Item name="autre" label="Autre (%)" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} md={5}>
                                <Form.Item name="etranger" label="Étranger (%)" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12} md={5}>
                                <Form.Item name="depot" label="Dépôt (%)" rules={[{ required: true }]}>
                                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Divider style={{ margin: '8px 0 12px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text type="secondary">Total volets sociaux</Text>
                              <Text strong className="tabular-nums" style={{ color: socialSplitPercent() === 100 ? '#059669' : '#e11d48' }}>
                                {socialSplitPercent()}%
                              </Text>
                            </div>
                            <Progress
                              percent={socialSplitPercent()}
                              status={socialSplitPercent() === 100 ? 'success' : 'exception'}
                              showInfo={false}
                            />
                          </Card>
                        </Col>
                      </Row>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <Button onClick={() => form.resetFields()}>Réinitialiser</Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={createMutation.isPending || updateMutation.isPending}
                        >
                          Enregistrer les paramètres
                        </Button>
                      </div>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
