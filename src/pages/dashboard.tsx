import { useState, useEffect } from 'react';
import {
  Typography,
  Row,
  Col,
  Select,
  Card,
  Progress,
  Table,
  Spin,
  Empty,
  Alert,
  Tabs,
  Tag,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getAnneeUniversitaires, getStatsByAnneeUniversitaireId } from '../services/anneeUniversitaire';
import {
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  PieChartOutlined,
  LineChartOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  KeyOutlined,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { FaBed } from 'react-icons/fa6';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import type { Etudiant } from '../types/etudiant';

const { Title, Text } = Typography;

interface ChambreParCampus {
  campus: string;
  chambres: number;
}

interface PavillonData {
  pavillon: string;
  chambres?: number;
  places?: number;
  places_occupees?: number;
}

interface PavillonDetail {
  _id: string;
  nom: string;
  campusId: string | { _id: string; nom: string };
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChambreDetail {
  _id: string;
  nom: string;
  pavillonId: PavillonDetail;
  places: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Campus {
  _id: string;
  nom: string;
  adresse: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  pavillons: PavillonDetail[];
}

interface Dossier {
  _id: string;
  chambreId: ChambreDetail;
  etudiant: Etudiant;
  etudiantId: string;
  selectionId: {
    _id: string;
    inscription: {
      prenom: string;
      nom: string;
      genre: string;
      ncs: string;
      avatar: string;
      is_codified: boolean;
      nationalite: string;
      _id: string;
      telephone: string;
      email: string;
      cni: string;
    };
  };
  anneeUniversitaireId: {
    _id: string;
    nom: string;
    isActif: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  active: boolean;
  caution: number;
  taux_loyer_mensuelle: number;
  createdAt: string;
  updatedAt: string;
  numero: string;
  __v: number;
}

interface CampusWithPavillons {
  campus: string;
  pavillons: { pavillon: string; chambres: number }[];
}

interface PlacesPavillonData {
  campus: string;
  pavillons: { pavillon: string; places: number; places_occupees: number }[];
}

interface StatsData {
  dossiers: Dossier[];
  campus: Campus[];
  chambre_par_campus: ChambreParCampus[];
  chambre_par_pavillon: CampusWithPavillons[];
  total_places_par_pavillon: PlacesPavillonData[];
}

const CHART_COLORS = ['#2563eb', '#10b981', '#7c3aed', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6'];

export default function Dashboard() {
  const { data: anneeUniversitaires = [], isLoading: loadingAnnees } = useQuery({
    queryKey: ['anneeUniversitaires'],
    queryFn: getAnneeUniversitaires,
  });

  const [selectedAnneeId, setSelectedAnneeId] = useState<string | null>(null);

  useEffect(() => {
    if (anneeUniversitaires.length > 0 && !selectedAnneeId) {
      const activeAnnee = anneeUniversitaires.find((annee) => annee.isActif);
      setSelectedAnneeId(activeAnnee?._id || anneeUniversitaires[0]._id);
    }
  }, [anneeUniversitaires, selectedAnneeId]);

  const { data: stats, isLoading: loadingStats, isError } = useQuery({
    queryKey: ['stats', selectedAnneeId],
    queryFn: async () => {
      const response = await getStatsByAnneeUniversitaireId(selectedAnneeId!);
      return response as unknown as StatsData;
    },
    enabled: !!selectedAnneeId,
  });

  const handleAnneeChange = (value: string) => {
    setSelectedAnneeId(value);
  };

  const getTotalChambres = () => {
    if (!stats?.chambre_par_campus) return 0;
    return stats.chambre_par_campus.reduce((acc: number, item: ChambreParCampus) => acc + item.chambres, 0);
  };

  const getTotalPlaces = () => {
    if (!stats?.total_places_par_pavillon) return 0;
    return stats.total_places_par_pavillon.reduce((acc: number, campus: PlacesPavillonData) => {
      return (
        acc +
        campus.pavillons.reduce((pavillonAcc: number, pavillon) => {
          return pavillonAcc + (pavillon.places || 0);
        }, 0)
      );
    }, 0);
  };

  const getTotalPlacesOccupees = () => {
    if (!stats?.total_places_par_pavillon) return 0;
    return stats.total_places_par_pavillon.reduce((acc: number, campus: PlacesPavillonData) => {
      return (
        acc +
        campus.pavillons.reduce((pavillonAcc: number, pavillon) => {
          return pavillonAcc + (pavillon.places_occupees || 0);
        }, 0)
      );
    }, 0);
  };

  const getOccupationRate = () => {
    const total = getTotalPlaces();
    const occupied = getTotalPlacesOccupees();
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  const hommesCount = stats?.dossiers?.reduce(
    (acc, dossier) => acc + (dossier.selectionId?.inscription?.genre === 'H' ? 1 : 0),
    0
  ) || 0;
  const femmesCount = stats?.dossiers?.reduce(
    (acc, dossier) => acc + (dossier.selectionId?.inscription?.genre === 'F' ? 1 : 0),
    0
  ) || 0;

  const chambreParCampusColumns = [
    {
      title: 'Campus',
      dataIndex: 'campus',
      key: 'campus',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            <BankOutlined />
          </div>
          <Text strong style={{ color: '#0f172a' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Nombre de chambres',
      dataIndex: 'chambres',
      key: 'chambres',
      render: (chambres: number) => (
        <Tag
          color={chambres > 0 ? 'blue' : 'default'}
          className="tabular-nums"
          style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 6 }}
        >
          {chambres} chambre(s)
        </Tag>
      ),
    },
    {
      title: 'Part du parc',
      key: 'percentage',
      render: (_: unknown, record: ChambreParCampus) => {
        const total = getTotalChambres();
        const percentage = total > 0 ? Math.round((record.chambres / total) * 100) : 0;
        return (
          <Progress
            percent={percentage}
            size="small"
            strokeColor="#2563eb"
            status={percentage > 0 ? 'normal' : 'exception'}
          />
        );
      },
    },
  ];

  const placesParPavillonColumns = [
    {
      title: 'Campus',
      dataIndex: 'campus',
      key: 'campus',
      render: (text: string) => <Text strong style={{ color: '#0f172a' }}>{text}</Text>,
    },
    {
      title: 'Pavillon',
      dataIndex: ['pavillon'],
      key: 'pavillon',
      render: (text: string) => (
        <Tag color="geekblue" style={{ fontWeight: 500 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Places totales',
      dataIndex: ['places'],
      key: 'places',
      render: (val: number) => <span className="tabular-nums font-medium">{val}</span>,
    },
    {
      title: 'Places occupées',
      dataIndex: ['places_occupees'],
      key: 'places_occupees',
      render: (val: number) => <span className="tabular-nums font-semibold text-blue-600">{val}</span>,
    },
    {
      title: "Taux d'occupation",
      key: 'occupation',
      render: (_: unknown, record: PavillonData) => {
        const rate =
          record.places && record.places > 0
            ? Math.round(((record.places_occupees || 0) / record.places) * 100)
            : 0;

        let strokeColor = '#10b981';
        if (rate >= 90) strokeColor = '#ef4444';
        else if (rate >= 70) strokeColor = '#f59e0b';

        return <Progress percent={rate} size="small" strokeColor={strokeColor} />;
      },
    },
  ];

  const getPlacesParPavillonData = () => {
    if (!stats?.total_places_par_pavillon) return [];
    return stats.total_places_par_pavillon.flatMap((campus: PlacesPavillonData) =>
      campus.pavillons.map((pavillon) => ({
        key: `${campus.campus}-${pavillon.pavillon}`,
        campus: campus.campus,
        pavillon: pavillon.pavillon,
        places: pavillon.places || 0,
        places_occupees: pavillon.places_occupees || 0,
      }))
    );
  };

  return (
    <div className="page-shell">
      {/* Hero Banner with Session Selector */}
      <div className="page-hero">
        <Row align="middle" justify="space-between" gutter={[24, 24]}>
          <Col xs={24} md={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: '#60a5fa',
                  flexShrink: 0,
                }}
              >
                <PieChartOutlined />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#93c5fd',
                    marginBottom: 4,
                  }}
                >
                  Vue d'ensemble & Analytique
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
                  Tableau de bord général
                </Title>
                <Text style={{ color: '#cbd5e1', fontSize: 14 }}>
                  Suivi en temps réel des capacités d'hébergement, dossiers et taux d'occupation
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={9} lg={7}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(8px)',
                borderRadius: 12,
                padding: '12px 16px',
              }}
            >
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                <CalendarOutlined style={{ marginRight: 6, color: '#60a5fa' }} />
                Session de codification
              </Text>
              <Select
                loading={loadingAnnees}
                style={{ width: '100%' }}
                placeholder="Sélectionner une année"
                onChange={handleAnneeChange}
                value={selectedAnneeId || undefined}
                options={anneeUniversitaires.map((annee) => ({
                  value: annee._id,
                  label: annee.isActif ? `${annee.nom} (Session active)` : annee.nom,
                }))}
              />
            </div>
          </Col>
        </Row>
      </div>

      {isError && (
        <Alert
          message="Erreur de chargement"
          description="Impossible de charger les statistiques de cette session. Veuillez réessayer plus tard."
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {loadingStats ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 0',
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
          }}
        >
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 14 }}>
            Calcul des indicateurs en cours...
          </Text>
        </div>
      ) : !stats ? (
        <Card>
          <Empty
            description="Aucune donnée disponible. Veuillez sélectionner une année universitaire."
            style={{ margin: '40px 0' }}
          />
        </Card>
      ) : (
        <>
          {/* Key Statistics Cards with Staggered Entrance */}
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <div className="kpi-card stat-card-interactive card-enter stagger-1">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Dossiers Résidents
                    </Text>
                    <div className="tabular-nums" style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1.1 }}>
                      {stats.dossiers?.length || 0}
                    </div>
                  </div>
                  <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <TeamOutlined />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#ecfdf5',
                      color: '#059669',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <RiseOutlined /> Actifs
                  </span>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Étudiants logés sur la session</Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="kpi-card stat-card-interactive card-enter stagger-2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Parc de Chambres
                    </Text>
                    <div className="tabular-nums" style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1.1 }}>
                      {getTotalChambres()}
                    </div>
                  </div>
                  <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <KeyOutlined />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <HomeOutlined /> {stats.campus?.length || 0} campus
                  </span>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Capacité enregistrée</Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="kpi-card stat-card-interactive card-enter stagger-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Lits Disponibles
                    </Text>
                    <div className="tabular-nums" style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1.1 }}>
                      {Math.max(0, getTotalPlaces() - getTotalPlacesOccupees())}
                      <span style={{ fontSize: 15, fontWeight: 500, color: '#94a3b8' }}> / {getTotalPlaces()}</span>
                    </div>
                  </div>
                  <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                    <FaBed />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {getTotalPlaces() - getTotalPlacesOccupees() > 0 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: '#ecfdf5',
                        color: '#059669',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <RiseOutlined /> Places libres
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: '#fff1f2',
                        color: '#e11d48',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <FallOutlined /> Complet
                    </span>
                  )}
                  <Text style={{ fontSize: 12, color: '#64748b' }}>
                    {getTotalPlacesOccupees()} lits occupés
                  </Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="kpi-card stat-card-interactive card-enter stagger-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Taux d'Occupation
                    </Text>
                    <div className="tabular-nums" style={{ fontSize: 32, fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1.1 }}>
                      {getOccupationRate()}
                      <span style={{ fontSize: 18, fontWeight: 600 }}>%</span>
                    </div>
                  </div>
                  <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                    <BankOutlined />
                  </div>
                </div>
                <Progress
                  percent={getOccupationRate()}
                  showInfo={false}
                  strokeColor={{
                    '0%': '#7c3aed',
                    '100%': getOccupationRate() > 90 ? '#ef4444' : '#2563eb',
                  }}
                  trailColor="#f1f5f9"
                  style={{ marginTop: 14, marginBottom: 0 }}
                />
              </div>
            </Col>
          </Row>

          {/* Charts Row 1 */}
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                className="card-enter stagger-2"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                      }}
                    >
                      <BankOutlined />
                    </div>
                    <span>Répartition des chambres par campus</span>
                  </div>
                }
              >
                <Tabs
                  defaultActiveKey="table"
                  items={[
                    {
                      key: 'table',
                      label: 'Vue Tableau',
                      children: (
                        <Table
                          dataSource={stats.chambre_par_campus}
                          columns={chambreParCampusColumns}
                          pagination={false}
                          rowKey="campus"
                          size="middle"
                        />
                      ),
                    },
                    {
                      key: 'chart',
                      label: 'Histogramme',
                      children: (
                        <div style={{ height: 300, marginTop: 12 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats.chambre_par_campus}
                              margin={{ top: 10, right: 24, left: 8, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="campus" tick={{ fill: '#64748b', fontSize: 12 }} />
                              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                              <Tooltip
                                formatter={(value) => [`${value} chambres`, 'Capacité']}
                                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(15,23,42,0.08)' }}
                              />
                              <Legend />
                              <Bar
                                dataKey="chambres"
                                name="Nombre de chambres"
                                fill="#2563eb"
                                radius={[6, 6, 0, 0]}
                                animationDuration={600}
                                animationEasing="ease-out"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ),
                    },
                    {
                      key: 'pie',
                      label: 'Camembert',
                      children: (
                        <div style={{ height: 300, marginTop: 12 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.chambre_par_campus}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="chambres"
                                nameKey="campus"
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                animationDuration={600}
                                animationEasing="ease-out"
                              >
                                {stats.chambre_par_campus?.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [`${value} chambres`, 'Nombre']}
                                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                className="card-enter stagger-3"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#f5f3ff',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                      }}
                    >
                      <PieChartOutlined />
                    </div>
                    <span>Occupation des places par pavillon</span>
                  </div>
                }
              >
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getPlacesParPavillonData()}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 12, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 'dataMax']} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis type="category" dataKey="pavillon" width={110} tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }} />
                      <Tooltip
                        formatter={(value, name) => [
                          value,
                          name === 'places' ? 'Places totales' : 'Places occupées',
                        ]}
                        labelFormatter={(label) => `Pavillon : ${label}`}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="places"
                        name="Places totales"
                        fill="#cbd5e1"
                        radius={[0, 4, 4, 0]}
                        animationDuration={600}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="places_occupees"
                        name="Places occupées"
                        fill="#7c3aed"
                        radius={[0, 4, 4, 0]}
                        animationDuration={600}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Gender Split & Pavillon Table Row */}
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={8}>
              <Card
                className="card-enter stagger-4"
                style={{ height: '100%' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#ecfdf5',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                      }}
                    >
                      <LineChartOutlined />
                    </div>
                    <span>Répartition par genre</span>
                  </div>
                }
              >
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Hommes', value: hommesCount },
                          { name: 'Femmes', value: femmesCount },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        animationDuration={600}
                        animationEasing="ease-out"
                      >
                        <Cell key="cell-0" fill="#2563eb" />
                        <Cell key="cell-1" fill="#ec4899" />
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} étudiants`, 'Effectif']}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Row gutter={12} style={{ marginTop: 12 }}>
                  <Col span={12}>
                    <div style={{ padding: '12px', borderRadius: 10, background: '#eff6ff', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>
                        <ManOutlined /> Hommes
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#1e3a8a', marginTop: 2 }}>
                        {hommesCount}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: '12px', borderRadius: 10, background: '#fdf2f8', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#db2777', fontWeight: 600 }}>
                        <WomanOutlined /> Femmes
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#831843', marginTop: 2 }}>
                        {femmesCount}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card
                className="card-enter stagger-5"
                style={{ height: '100%' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#fffbeb',
                        color: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                      }}
                    >
                      <HomeOutlined />
                    </div>
                    <span>Détail des capacités par pavillon</span>
                  </div>
                }
              >
                <Tabs
                  defaultActiveKey="table"
                  items={[
                    {
                      key: 'table',
                      label: 'Tableau détaillé',
                      children: (
                        <Table
                          dataSource={getPlacesParPavillonData()}
                          columns={placesParPavillonColumns}
                          pagination={{ pageSize: 5 }}
                          rowKey="key"
                          size="middle"
                        />
                      ),
                    },
                    {
                      key: 'chart',
                      label: 'Courbe de charge',
                      children: (
                        <div style={{ height: 320, marginTop: 12 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={getPlacesParPavillonData().map((item) => ({
                                ...item,
                                taux: item.places > 0 ? Math.round((item.places_occupees / item.places) * 100) : 0,
                              }))}
                              margin={{ top: 5, right: 24, left: 12, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="pavillon" tick={{ fill: '#64748b', fontSize: 12 }} />
                              <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#10b981"
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                              <Legend />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="places"
                                name="Places totales"
                                stroke="#2563eb"
                                strokeWidth={2}
                                activeDot={{ r: 6 }}
                                animationDuration={600}
                              />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="places_occupees"
                                name="Places occupées"
                                stroke="#7c3aed"
                                strokeWidth={2}
                                animationDuration={600}
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="taux"
                                name="Taux d'occupation (%)"
                                stroke="#10b981"
                                strokeWidth={2}
                                animationDuration={600}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
