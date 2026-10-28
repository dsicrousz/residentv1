/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  Space,
  Spin,
  Table,
  type TableProps,
  Row,
  Col,
  Input,
  Select,
  Progress,
  Alert,
  Typography,
  Tag,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FaMale, FaFemale } from 'react-icons/fa';
import type { Inscrit, Results, Selection } from '../services/selection';
import { exportToCsv } from '../utils/exportCsv';
import 'mantine-flagpack/styles.css';
import {
  SNFlag,
  MLFlag,
  BFFlag,
  CGFlag,
  CIFlag,
  CMFlag,
  MAFlag,
  GWFlag,
  DZFlag,
  TNFlag,
  TGFlag,
  GMFlag,
} from 'mantine-flagpack';

const { Title, Text } = Typography;

export interface QuotaTargets {
  nbLitTotal: number;
  nbLitFilles: number;
  nbLitGarcons: number;
}

export interface CodificationWorkspaceProps {
  title: string;
  subtitleBadge: string;
  heroIcon: React.ReactNode;
  heroGradient?: string;
  backLabel: string;
  onBack: () => void;
  loading: boolean;
  selectionsData?: Results;
  filterFormationId?: string;
  quotaTargets: QuotaTargets;
  onSelectInscrit: (inscrit: Inscrit) => void;
  onRemoveSelection: (selectionId: string) => void;
  inscritsCardTitle?: string;
  selectionsCardTitle?: string;
}

const genreOptions = [
  { text: 'HOMME', value: 'H' },
  { text: 'FEMME', value: 'F' },
];

const nationaliteOptions = [
  { text: 'SENEGALAISE', value: 'SENEGALAISE' },
  { text: 'MALIENNE', value: 'MALIENNE' },
  { text: 'GAMBIENNE', value: 'GAMBIENNE' },
  { text: 'BENINOISE', value: 'BENINOISE' },
  { text: 'GUINEENNE', value: 'GUINEENNE' },
  { text: 'TOGOLAISE', value: 'TOGOLAISE' },
  { text: 'CAMEROUNAISE', value: 'CAMEROUNAISE' },
  { text: 'MAROCAINE', value: 'MAROCAINE' },
  { text: 'ALGERIENNE', value: 'ALGERIENNE' },
  { text: 'TUNISIENNE', value: 'TUNISIENNE' },
  { text: 'CONGOLAISE', value: 'CONGOLAISE' },
  { text: 'IVORIENNE', value: 'IVORIENNE' },
];

function renderFlag(nationalite: string) {
  switch (nationalite) {
    case 'SENEGALAISE':
      return <SNFlag size={34} />;
    case 'MALIENNE':
      return <MLFlag size={34} />;
    case 'GAMBIENNE':
      return <GMFlag size={34} />;
    case 'BENINOISE':
      return <BFFlag size={34} />;
    case 'GUINEENNE':
      return <GWFlag size={34} />;
    case 'TOGOLAISE':
      return <TGFlag size={34} />;
    case 'CAMEROUNAISE':
      return <CMFlag size={34} />;
    case 'MAROCAINE':
      return <MAFlag size={34} />;
    case 'ALGERIENNE':
      return <DZFlag size={34} />;
    case 'TUNISIENNE':
      return <TNFlag size={34} />;
    case 'CONGOLAISE':
      return <CGFlag size={34} />;
    case 'IVORIENNE':
      return <CIFlag size={34} />;
    default:
      return <Tag>{nationalite || '-'}</Tag>;
  }
}

function computeCodificationQuotas(
  inscrits: Inscrit[],
  selectionnees: Selection[],
  targets: QuotaTargets
) {
  const totalSelections = selectionnees.length;
  const totalFilles = selectionnees.filter((s) => s.genre === 'F').length;
  const totalGarcons = selectionnees.filter((s) => s.genre === 'H').length;
  const totalInscrits = inscrits.length;
  const totalInscritsFilles = inscrits.filter((i) => i.genre === 'F').length;
  const totalInscritsGarcons = inscrits.filter((i) => i.genre === 'H').length;

  const { nbLitTotal = 0, nbLitFilles = 0, nbLitGarcons = 0 } = targets;

  return {
    totalSelections,
    totalFilles,
    totalGarcons,
    totalInscrits,
    totalInscritsFilles,
    totalInscritsGarcons,
    nbLitTotal,
    nbLitFilles,
    nbLitGarcons,
    isTotalDepasse: totalSelections > nbLitTotal,
    isFillesDepasse: totalFilles > nbLitFilles,
    isGarconsDepasse: totalGarcons > nbLitGarcons,
    pourcentageTotal: nbLitTotal > 0 ? Math.round((totalSelections / nbLitTotal) * 100) : 0,
    pourcentageFilles: nbLitFilles > 0 ? Math.round((totalFilles / nbLitFilles) * 100) : 0,
    pourcentageGarcons: nbLitGarcons > 0 ? Math.round((totalGarcons / nbLitGarcons) * 100) : 0,
  };
}

export default function CodificationWorkspace({
  title,
  subtitleBadge,
  heroIcon,
  heroGradient,
  backLabel,
  onBack,
  loading,
  selectionsData,
  filterFormationId,
  quotaTargets,
  onSelectInscrit,
  onRemoveSelection,
  inscritsCardTitle = 'Candidats inscrits',
  selectionsCardTitle = 'Étudiants sélectionnés',
}: CodificationWorkspaceProps) {
  const normalizeInscrits = (rawDiff: any[] = []): Inscrit[] => {
    const filtered = filterFormationId
      ? rawDiff.filter((inscrit) => inscrit?.formation?._id === filterFormationId)
      : rawDiff;

    return filtered.map((inscrit) => ({
      _id: inscrit._id,
      nom: inscrit.etudiant.nom,
      prenom: inscrit.etudiant.prenom,
      genre: inscrit.etudiant.genre,
      ncs: inscrit.etudiant.ncs,
      avatar: inscrit.etudiant.avatar,
      is_codified: inscrit.is_codified,
      nationalite: inscrit.etudiant.nationalite,
      formation: inscrit.formation,
    }));
  };

  const normalizeSelections = (sel?: Results): Selection[] => {
    if (!sel?.selectionnees) return [];
    return sel.selectionnees.map((selection) => ({
      _id: selection._id,
      nom: selection.inscription.nom,
      prenom: selection.inscription.prenom,
      genre: selection.inscription.genre,
      inscription: selection.inscription,
      ncs: selection.inscription.ncs,
      avatar: selection.inscription.avatar,
      nationalite: selection.inscription.nationalite,
    }));
  };

  const inscritsList = normalizeInscrits(selectionsData?.diff);
  const selectionsList = normalizeSelections(selectionsData);
  const stats = selectionsData ? computeCodificationQuotas(inscritsList, selectionsList, quotaTargets) : null;

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

  const getColumnSelectProps = (dataIndex: string, options: { text: string; value: string }[]) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Select
          mode="multiple"
          style={{ width: 200, marginBottom: 8 }}
          placeholder={`Filtrer par ${dataIndex}`}
          value={selectedKeys}
          onChange={(value) => setSelectedKeys(value)}
          options={options.map((o) => ({ label: o.text, value: o.value }))}
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

  const columnsInscrits: TableProps<Inscrit>['columns'] = [
    {
      title: 'Étudiant',
      key: 'etudiant',
      ...getColumnSearchProps('nom'),
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            src={record.avatar ? `${import.meta.env.VITE_BACKURL_ETUDIANT}/${record.avatar}` : undefined}
            icon={<UserOutlined />}
            shape="square"
            size={40}
            style={{ borderRadius: 10, backgroundColor: '#2563eb', flexShrink: 0 }}
          />
          <div>
            <Text strong style={{ color: '#0f172a', display: 'block' }}>
              {record.prenom} {record.nom}
            </Text>
            <Tag color="blue" style={{ fontSize: 11, marginTop: 2 }}>
              {record.ncs}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      ...getColumnSelectProps('genre', genreOptions),
      render: (text) =>
        text === 'H' ? (
          <Tag color="blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <FaMale /> HOMME
          </Tag>
        ) : (
          <Tag color="magenta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <FaFemale /> FEMME
          </Tag>
        ),
    },
    {
      title: 'Nationalité',
      key: 'nationalite',
      dataIndex: 'nationalite',
      ...getColumnSelectProps('nationalite', nationaliteOptions),
      render: (text) => renderFlag(text),
    },
    {
      title: 'Action',
      key: 'action',
      width: 145,
      render: (_, record) => (
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => onSelectInscrit(record)}>
          Sélectionner
        </Button>
      ),
    },
  ];

  const columnsSelections: TableProps<Selection>['columns'] = [
    {
      title: 'Étudiant retenu',
      key: 'etudiant',
      ...getColumnSearchProps('nom'),
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            src={record.avatar ? `${import.meta.env.VITE_BACKURL_ETUDIANT}/${record.avatar}` : undefined}
            icon={<UserOutlined />}
            shape="square"
            size={40}
            style={{ borderRadius: 10, backgroundColor: '#10b981', flexShrink: 0 }}
          />
          <div>
            <Text strong style={{ color: '#0f172a', display: 'block' }}>
              {record.prenom} {record.nom}
            </Text>
            <Tag color="green" style={{ fontSize: 11, marginTop: 2 }}>
              {record.ncs}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      ...getColumnSelectProps('genre', genreOptions),
      render: (text) =>
        text === 'H' ? (
          <Tag color="blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <FaMale /> HOMME
          </Tag>
        ) : (
          <Tag color="magenta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <FaFemale /> FEMME
          </Tag>
        ),
    },
    {
      title: 'Nationalité',
      key: 'nationalite',
      dataIndex: 'nationalite',
      ...getColumnSelectProps('nationalite', nationaliteOptions),
      render: (text) => renderFlag(text),
    },
    {
      title: 'Action',
      key: 'action',
      width: 135,
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onRemoveSelection(record._id.toString())}
        >
          Retirer
        </Button>
      ),
    },
  ];

  const handleExportSelectionsCsv = () => {
    exportToCsv(`selections-${title.toLowerCase().replace(/\s+/g, '-')}.csv`, selectionsList, [
      { header: 'NCS', accessor: (r) => r.ncs },
      { header: 'Prénom', accessor: (r) => r.prenom },
      { header: 'Nom', accessor: (r) => r.nom },
      { header: 'Genre', accessor: (r) => (r.genre === 'H' ? 'Homme' : 'Femme') },
      { header: 'Nationalité', accessor: (r) => r.nationalite },
    ]);
  };

  return (
    <div className="page-shell">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          {backLabel}
        </Button>
        {selectionsList.length > 0 && (
          <Button icon={<DownloadOutlined />} onClick={handleExportSelectionsCsv}>
            Exporter la sélection (CSV)
          </Button>
        )}
      </div>

      <div
        className="page-hero"
        style={{
          padding: '22px 28px',
          marginBottom: 20,
          ...(heroGradient ? { background: heroGradient } : {}),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#ffffff',
            }}
          >
            {heroIcon}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.78)',
              }}
            >
              {subtitleBadge}
            </div>
            <Title level={3} style={{ color: '#ffffff', margin: 0 }}>
              {title}
            </Title>
          </div>
        </div>
      </div>

      <Spin size="large" spinning={loading}>
        {stats && (
          <>
            {stats.isTotalDepasse && (
              <Alert
                message="Capacité totale dépassée"
                description={`Le nombre total de sélections (${stats.totalSelections}) dépasse la capacité allouée (${stats.nbLitTotal})`}
                type="error"
                showIcon
                style={{ marginBottom: 16, borderRadius: 12 }}
              />
            )}
            {stats.isFillesDepasse && (
              <Alert
                message="Quota filles dépassé"
                description={`Le nombre de filles sélectionnées (${stats.totalFilles}) dépasse le quota (${stats.nbLitFilles})`}
                type="warning"
                showIcon
                style={{ marginBottom: 16, borderRadius: 12 }}
              />
            )}
            {stats.isGarconsDepasse && (
              <Alert
                message="Quota garçons dépassé"
                description={`Le nombre de garçons sélectionnés (${stats.totalGarcons}) dépasse le quota (${stats.nbLitGarcons})`}
                type="warning"
                showIcon
                style={{ marginBottom: 16, borderRadius: 12 }}
              />
            )}

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <div className="kpi-card stat-card-interactive card-enter stagger-1">
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Sélections
                  </Text>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: stats.isTotalDepasse ? '#e11d48' : '#059669',
                      marginTop: 4,
                    }}
                  >
                    {stats.totalSelections}{' '}
                    <span style={{ fontSize: 15, color: '#94a3b8', fontWeight: 500 }}>/ {stats.nbLitTotal}</span>
                  </div>
                  <Progress
                    percent={stats.pourcentageTotal}
                    status={stats.isTotalDepasse ? 'exception' : 'active'}
                    strokeColor={stats.isTotalDepasse ? '#e11d48' : '#10b981'}
                    showInfo={false}
                    style={{ marginTop: 8, marginBottom: 0 }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="kpi-card stat-card-interactive card-enter stagger-2">
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Quota Filles
                  </Text>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: stats.isFillesDepasse ? '#d97706' : '#db2777',
                      marginTop: 4,
                    }}
                  >
                    {stats.totalFilles}{' '}
                    <span style={{ fontSize: 15, color: '#94a3b8', fontWeight: 500 }}>/ {stats.nbLitFilles}</span>
                  </div>
                  <Progress
                    percent={stats.pourcentageFilles}
                    status={stats.isFillesDepasse ? 'exception' : 'active'}
                    strokeColor={stats.isFillesDepasse ? '#d97706' : '#db2777'}
                    showInfo={false}
                    style={{ marginTop: 8, marginBottom: 0 }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="kpi-card stat-card-interactive card-enter stagger-3">
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Quota Garçons
                  </Text>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: stats.isGarconsDepasse ? '#d97706' : '#2563eb',
                      marginTop: 4,
                    }}
                  >
                    {stats.totalGarcons}{' '}
                    <span style={{ fontSize: 15, color: '#94a3b8', fontWeight: 500 }}>/ {stats.nbLitGarcons}</span>
                  </div>
                  <Progress
                    percent={stats.pourcentageGarcons}
                    status={stats.isGarconsDepasse ? 'exception' : 'active'}
                    strokeColor={stats.isGarconsDepasse ? '#d97706' : '#2563eb'}
                    showInfo={false}
                    style={{ marginTop: 8, marginBottom: 0 }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="kpi-card stat-card-interactive card-enter stagger-4">
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Candidats Restants
                  </Text>
                  <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    {stats.totalInscrits}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, display: 'flex', gap: 12 }}>
                    <span>
                      Filles : <strong>{stats.totalInscritsFilles}</strong>
                    </span>
                    <span>
                      Garçons : <strong>{stats.totalInscritsGarcons}</strong>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        <Row gutter={[20, 20]}>
          <Col xs={24} xl={12}>
            <Card
              className="card-enter stagger-2"
              title={`${inscritsCardTitle} (${inscritsList.length})`}
              styles={{ body: { padding: 0 } }}
            >
              <Table<Inscrit>
                columns={columnsInscrits}
                dataSource={inscritsList}
                size="small"
                scroll={{ x: 'max-content' }}
                rowKey="_id"
                pagination={{ pageSize: 8, style: { padding: '12px 16px', margin: 0 } }}
              />
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card
              className="card-enter stagger-3"
              title={`${selectionsCardTitle} (${selectionsList.length})`}
              styles={{ body: { padding: 0 } }}
            >
              <Table<Selection>
                columns={columnsSelections}
                dataSource={selectionsList}
                size="small"
                scroll={{ x: 'max-content' }}
                rowKey="_id"
                pagination={{ pageSize: 8, style: { padding: '12px 16px', margin: 0 } }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
