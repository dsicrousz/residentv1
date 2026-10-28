/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import type { Results } from "../types/annee_universitaire";
import { useParams, useNavigate, Link } from "react-router";
import { getAnneeUniversitaireResults } from "../services/anneeUniversitaire";
import {
  Spin,
  Splitter,
  type TableProps,
  Space,
  Table,
  Card,
  Typography,
  Progress,
  Row,
  Col,
  Button,
  Tag,
  Empty,
} from "antd";
import {
  UserOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
  PercentageOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useState, type Key } from "react";
import './SelectionPedagogique.css';

const { Title, Text } = Typography;

interface Formation {
  key: Key;
  nom: string;
  percent: number;
  nb_lit: number;
  nb_lit_g: number;
  nb_lit_f: number;
  homme: number;
  femme: number;
}

interface Departement {
  key: Key;
  nom: string;
  title: React.ReactNode;
  disabled: boolean;
  percent: number;
  nb_lit: number;
  total: number;
  formations: any[];
}

export default function SelectionPedagogique() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentDepartement, setCurrentDepartement] = useState<Departement | null>(null);
  const { data: results, isLoading: loadingResults } = useQuery<Results>({
    queryKey: ['results', id],
    queryFn: () => getAnneeUniversitaireResults(id!),
    enabled: !!id,
  });

  const columns: TableProps<Formation>['columns'] = [
    {
      title: 'Formation',
      dataIndex: 'nom',
      key: 'nom',
      render: (text) => (
        <Space>
          <ApartmentOutlined style={{ color: '#2563eb' }} />
          <Text strong style={{ color: '#0f172a' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Poids (%)',
      dataIndex: 'percent',
      key: 'percent',
      width: 140,
      render: (value) => (
        <Progress
          percent={Number(value)}
          size="small"
          strokeColor="#2563eb"
          status={value > 80 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: 'Quota Lits',
      key: 'nb_lit',
      dataIndex: 'nb_lit',
      render: (value) => (
        <Tag color="blue" className="tabular-nums" style={{ fontWeight: 600 }}>
          {value} lits
        </Tag>
      ),
    },
    {
      title: 'Lits H / F',
      key: 'nb_lit_hf',
      render: (_, record) => (
        <Space size={4}>
          <Tag color="geekblue" className="tabular-nums">
            <ManOutlined /> {record.nb_lit_g}
          </Tag>
          <Tag color="magenta" className="tabular-nums">
            <WomanOutlined /> {record.nb_lit_f}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Inscrits H / F',
      key: 'inscrits_hf',
      render: (_, record) => (
        <Space size={8} className="tabular-nums">
          <Text style={{ fontSize: 13, color: '#334155' }}>
            H: <strong>{record.homme}</strong>
          </Text>
          <Text style={{ fontSize: 13, color: '#334155' }}>
            F: <strong>{record.femme}</strong>
          </Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 130,
      render: (_, record) => (
        <Link to={`${record.key}`}>
          <Button type="primary" size="small" icon={<RightOutlined />} iconPosition="end">
            Codifier
          </Button>
        </Link>
      ),
    },
  ];

  const columnsDepartement: TableProps<Departement>['columns'] = [
    {
      title: 'Département & Quotas',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <>{text}</>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_, record) => {
        const isSelected = currentDepartement?.key === record.key;
        return (
          <Button
            type={isSelected ? 'primary' : 'default'}
            size="small"
            onClick={() => setCurrentDepartement(record)}
            icon={<CheckCircleOutlined />}
            disabled={record.disabled}
          >
            {isSelected ? 'Affiché' : 'Voir formations'}
          </Button>
        );
      },
    },
  ];

  const buildFormations = (departement: Departement): Formation[] => {
    return (
      departement.formations.map((formation: any) => ({
        key: formation._id,
        nom: formation.nom,
        percent: formation.percent,
        nb_lit: formation.nb_lit,
        nb_lit_g: formation.nb_lit_g,
        nb_lit_f: formation.nb_lit_f,
        homme: formation.homme,
        femme: formation.femme,
      })) || []
    );
  };

  const buildTitle = (departement: any) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Text strong style={{ color: '#0f172a', fontSize: 14 }}>
          {departement.departement.nom}
        </Text>
        <Space size={6} wrap>
          <Tag color="green" icon={<UserOutlined />} className="tabular-nums">
            Inscrits : {departement.total}
          </Tag>
          <Tag color="blue" icon={<PercentageOutlined />} className="tabular-nums">
            Part : {departement.percent}%
          </Tag>
          <Tag color="orange" icon={<HomeOutlined />} className="tabular-nums">
            Lits : {departement.nb_lit}
          </Tag>
        </Space>
      </div>
    );
  };

  const buildDepartements = (res: Results): Departement[] => {
    return res.totalParDepartement.map((departement: any) => ({
      nom: departement.departement.nom,
      title: buildTitle(departement),
      key: departement._id,
      percent: departement.percent,
      nb_lit: departement.nb_lit,
      total: departement.total,
      disabled: departement.formations.length === 0,
      formations: departement.formations,
    }));
  };

  return (
    <div className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/dashboard/annee_universitaire/${id}`)}>
          Retour à la session
        </Button>
        <Space size={8} wrap>
          <Tag color="green" icon={<UserOutlined />}>Inscrits pédagogiques</Tag>
          <Tag color="blue" icon={<PercentageOutlined />}>Poids du département (%)</Tag>
          <Tag color="orange" icon={<HomeOutlined />}>Quota de lits alloués</Tag>
        </Space>
      </div>

      <div className="page-hero" style={{ padding: '22px 28px', marginBottom: 20 }}>
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
              color: '#60a5fa',
            }}
          >
            <ApartmentOutlined />
          </div>
          <div>
            <Title level={3} style={{ color: '#ffffff', margin: 0 }}>
              Sélection Pédagogique par Département
            </Title>
            <Text style={{ color: '#cbd5e1', fontSize: 13 }}>
              Sélectionnez un département à gauche pour consulter ses formations et procéder à la codification des étudiants
            </Text>
          </div>
        </div>
      </div>

      {loadingResults ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Splitter
          style={{
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 14,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            minHeight: 540,
          }}
        >
          <Splitter.Panel defaultSize="45%" min="32%" max="65%">
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <Title level={5} style={{ margin: 0 }}>
                  Départements ({results?.totalParDepartement?.length || 0})
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cliquez sur un département pour afficher ses formations
                </Text>
              </div>
              <Table<Departement>
                columns={columnsDepartement}
                dataSource={buildDepartements(results!)}
                pagination={false}
                size="middle"
                scroll={{ x: 'max-content' }}
                rowKey="key"
                rowClassName={(record) =>
                  record.disabled
                    ? 'disabled-row'
                    : currentDepartement?.key === record.key
                    ? 'selected-dept-row'
                    : ''
                }
              />
            </div>
          </Splitter.Panel>

          <Splitter.Panel>
            <div style={{ padding: 20 }}>
              {currentDepartement ? (
                <div key={String(currentDepartement.key)} className="page-enter">
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5} style={{ margin: 0, color: '#0f172a' }}>
                      {currentDepartement.nom}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Synthèse et liste des formations rattachées
                    </Text>
                  </div>

                  <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
                    <Col xs={24} sm={8}>
                      <div style={{ padding: 14, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: '#065f46', textTransform: 'uppercase' }}>
                          Étudiants Inscrits
                        </Text>
                        <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                          <UserOutlined style={{ marginRight: 6 }} />
                          {currentDepartement.total}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ padding: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', textTransform: 'uppercase' }}>
                          Lits Attribués
                        </Text>
                        <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
                          <HomeOutlined style={{ marginRight: 6 }} />
                          {currentDepartement.nb_lit}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ padding: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: 600, color: '#92400e', textTransform: 'uppercase' }}>
                          Quote-part
                        </Text>
                        <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#d97706', marginTop: 2 }}>
                          <PercentageOutlined style={{ marginRight: 6 }} />
                          {currentDepartement.percent}%
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Card
                    size="small"
                    title={
                      <Space>
                        <ApartmentOutlined style={{ color: '#2563eb' }} />
                        <span>Formations du département</span>
                      </Space>
                    }
                    styles={{ body: { padding: 0 } }}
                  >
                    <Table<Formation>
                      columns={columns}
                      dataSource={buildFormations(currentDepartement)}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total : ${total} formations`,
                        style: { padding: '12px 16px', margin: 0 },
                      }}
                      size="middle"
                      scroll={{ x: 'max-content' }}
                      rowKey="key"
                    />
                  </Card>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420 }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Space direction="vertical" size={2}>
                        <Text strong style={{ color: '#334155' }}>
                          Aucun département sélectionné
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Cliquez sur « Voir formations » dans la liste de gauche pour afficher les quotas
                        </Text>
                      </Space>
                    }
                  />
                </div>
              )}
            </div>
          </Splitter.Panel>
        </Splitter>
      )}
    </div>
  );
}
