import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getSelectionsPedagogiqueBySession, getSelectionsSocialeBySession } from "../services/selection";
import { getAnneeUniversitaireActive } from "../services/anneeUniversitaire";
import { openSelectionListPDF, type SelectionGroup, type SelectionEntry } from "../utils/pdfGenerator";
import { Card, Button, Space, Typography, Row, Col, Tag, Spin } from 'antd';
import {
  PrinterOutlined,
  FileTextOutlined,
  TeamOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text, Paragraph } = Typography;

export default function ImpressionDoc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingPed, setLoadingPed] = useState(false);
  const [loadingSoc, setLoadingSoc] = useState(false);

  const { data: selectionsPedagogique, isLoading: loadingPedagogique } = useQuery({
    queryKey: ['selectionPedagogique', id],
    queryFn: () => getSelectionsPedagogiqueBySession(id as string),
  });

  const { data: selectionsSociale, isLoading: loadingSociale } = useQuery({
    queryKey: ['selectionSociale', id],
    queryFn: () => getSelectionsSocialeBySession(id as string),
  });

  const { data: anneeUniversitaireActive } = useQuery({
    queryKey: ['anneeUniversitaire'],
    queryFn: () => getAnneeUniversitaireActive(),
  });

  const handlePrintPedagogique = async () => {
    if (!selectionsPedagogique) return;
    setLoadingPed(true);
    try {
      await openSelectionListPDF({
        title: 'CODIFICATION PÉDAGOGIQUE',
        groupPrefix: 'FORMATION',
        bannerColor: '#2563eb',
        anneeNom: anneeUniversitaireActive?.nom || '',
        groups: selectionsPedagogique.formations as SelectionGroup[],
        selectionnees: selectionsPedagogique.selectionnees as SelectionEntry[],
      });
    } finally {
      setLoadingPed(false);
    }
  };

  const handlePrintSociale = async () => {
    if (!selectionsSociale) return;
    setLoadingSoc(true);
    try {
      await openSelectionListPDF({
        title: 'CODIFICATION SOCIALE',
        groupPrefix: 'FORMATION',
        bannerColor: '#10b981',
        anneeNom: anneeUniversitaireActive?.nom || '',
        groups: selectionsSociale.formations as SelectionGroup[],
        selectionnees: selectionsSociale.selectionnees as SelectionEntry[],
      });
    } finally {
      setLoadingSoc(false);
    }
  };

  const isDataLoading = loadingPedagogique || loadingSociale;

  if (isDataLoading) {
    return (
      <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalPedagogique = selectionsPedagogique?.selectionnees?.length || 0;
  const totalSociale = selectionsSociale?.selectionnees?.length || 0;
  const totalFormations = selectionsPedagogique?.formations?.length || 0;

  return (
    <div className="page-shell">
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Retour à la session
        </Button>
      </div>

      <div className="page-hero">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: '#60a5fa',
                  flexShrink: 0,
                }}
              >
                <FileTextOutlined />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                  Éditions Officielles PDF
                </div>
                <Title level={2} style={{ color: '#ffffff', margin: '2px 0 4px' }}>
                  Impression des Listes de Sélection
                </Title>
                <Text style={{ color: '#cbd5e1', fontSize: 14 }}>
                  Session active : <strong>{anneeUniversitaireActive?.nom || 'N/A'}</strong>
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Summary KPI Row */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <BookOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sélectionnés Pédagogique
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#0f172a' }}>
                  {totalPedagogique}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <BookOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Formations Couvertes
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#7c3aed' }}>
                  {totalFormations}
                </Title>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="kpi-card stat-card-interactive card-enter stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <TeamOutlined />
              </div>
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sélectionnés Sociale
                </Text>
                <Title level={2} className="tabular-nums" style={{ margin: '2px 0 0', color: '#059669' }}>
                  {totalSociale}
                </Title>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Section Sélection Pédagogique */}
      <Card
        className="card-enter stagger-2"
        style={{ marginBottom: 20, borderLeft: '4px solid #2563eb' }}
      >
        <Row gutter={[20, 20]} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={6}>
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                <BookOutlined style={{ color: '#2563eb', marginRight: 8 }} />
                Liste de Codification Pédagogique
              </Title>
              <Paragraph style={{ margin: 0, color: '#64748b' }}>
                Génère le document PDF officiel regroupant les étudiants retenus par formation académique.
              </Paragraph>
              <Space style={{ marginTop: 4 }}>
                <Tag color="blue">{totalPedagogique} étudiants retenus</Tag>
                <Tag color="purple">{totalFormations} formations</Tag>
              </Space>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={handlePrintPedagogique}
              loading={loadingPed}
              disabled={!selectionsPedagogique || totalPedagogique === 0}
            >
              Imprimer la liste pédagogique
            </Button>
          </Col>
        </Row>

        {selectionsPedagogique?.formations && selectionsPedagogique.formations.length > 0 && (
          <div style={{ marginTop: 18, padding: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>
              Formations incluses :
            </Text>
            <Space wrap size={[6, 6]}>
              {selectionsPedagogique.formations.map((formation: SelectionGroup) => (
                <Tag key={formation._id} color="blue">
                  {formation.nom} (
                  {
                    selectionsPedagogique.selectionnees.filter(
                      (s: SelectionEntry) => s.formation === formation._id
                    ).length
                  }
                  )
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* Section Sélection Sociale */}
      <Card
        className="card-enter stagger-3"
        style={{ marginBottom: 20, borderLeft: '4px solid #10b981' }}
      >
        <Row gutter={[20, 20]} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={6}>
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                <TeamOutlined style={{ color: '#10b981', marginRight: 8 }} />
                Liste de Codification Sociale
              </Title>
              <Paragraph style={{ margin: 0, color: '#64748b' }}>
                Génère le document PDF officiel des étudiants sélectionnés sur critères sociaux.
              </Paragraph>
              <Space style={{ marginTop: 4 }}>
                <Tag color="green">{totalSociale} étudiants retenus</Tag>
              </Space>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={handlePrintSociale}
              loading={loadingSoc}
              disabled={!selectionsSociale || totalSociale === 0}
              style={{ background: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
            >
              Imprimer la liste sociale
            </Button>
          </Col>
        </Row>

        {selectionsSociale?.formations && selectionsSociale.formations.length > 0 && (
          <div style={{ marginTop: 18, padding: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>
              Répartition incluse :
            </Text>
            <Space wrap size={[6, 6]}>
              {selectionsSociale.formations.map((camp: SelectionGroup) => (
                <Tag key={camp._id} color="green">
                  {camp.nom} (
                  {
                    selectionsSociale.selectionnees.filter(
                      (s: SelectionEntry) => s.campus === camp._id || s.formation === camp._id
                    ).length
                  }
                  )
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* Note informative */}
      <div
        className="card-enter stagger-4"
        style={{
          padding: '16px 20px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <InfoCircleOutlined style={{ color: '#2563eb', fontSize: 18, marginTop: 2 }} />
        <div>
          <Text strong style={{ color: '#1e3a8a', display: 'block', marginBottom: 4 }}>
            Informations sur le format d'impression
          </Text>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#1e40af', fontSize: 13 }}>
            <li>Les documents sont générés automatiquement au format PDF officiel avec saut de page par formation.</li>
            <li>Les étudiantes (genre F) sont mises en évidence pour faciliter le contrôle visuel des quotas.</li>
            <li>Les listes sont triées par civilité puis par ordre alphabétique.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
