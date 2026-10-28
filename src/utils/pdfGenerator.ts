import type { Dossier } from "../types/dossier";
import type { Payement } from "../types/payement";
import type { AllocationMateriel } from "../types/allocation_materiel";
import type { Equipement } from "../types/equipement";

interface ChambreInfo {
  nom: string;
  pavillon: string;
  campus: string;
}

interface PdfTableNode {
  table: {
    body: unknown[][];
    widths: Array<string | number>;
  };
}

export interface SelectionGroup {
  _id: string;
  nom: string;
}

export interface SelectionEntry {
  _id: string;
  formation?: string;
  campus?: string;
  inscription: {
    nom: string;
    prenom: string;
    ncs: string;
    genre: string;
  };
}

function formatDate(date: Date, withTime = false): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  if (withTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}

function formatDateLong(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  return `${day} ${months[date.getMonth()]} ${year}`;
}

async function loadPdfResources() {
  const [{ default: pdfMake }, { font }, { drapeau }, { logo }] = await Promise.all([
    import("pdfmake"),
    import("../vfs_fonts"),
    import("../drapeau"),
    import("../logo"),
  ]);
  pdfMake.vfs = font;
  return { pdfMake, drapeau, logo };
}

function buildOfficialHeader(drapeau: string, logo: string, subtitleRight: string, referenceText?: string) {
  return {
    columns: [
      {
        width: 'auto',
        stack: [
          { text: "RÉPUBLIQUE DU SÉNÉGAL", fontSize: 11, bold: true, alignment: "center", color: "#000066" },
          { text: "Un Peuple, Un But, Une Foi", fontSize: 8, margin: [0, 2], alignment: "center", italics: true },
          { image: drapeau, width: 42, alignment: "center", margin: [0, 4] },
          {
            canvas: [{ type: 'line', x1: 0, y1: 4, x2: 150, y2: 4, lineWidth: 1, lineColor: '#000066' }],
            margin: [0, 4, 0, 4],
          },
          {
            text: "MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR, DE LA RECHERCHE ET DE L'INNOVATION",
            fontSize: 8,
            bold: true,
            margin: [0, 3],
            alignment: "center",
            color: "#000066",
          },
          {
            text: "CENTRE RÉGIONAL DES ŒUVRES UNIVERSITAIRES SOCIALES DE ZIGUINCHOR",
            fontSize: 8,
            bold: true,
            margin: [0, 2],
            alignment: "center",
            color: "#000066",
          },
          {
            text: "DIVISION DES CITÉS UNIVERSITAIRES",
            fontSize: 8,
            bold: true,
            margin: [0, 2],
            alignment: "center",
            color: "#000066",
          },
        ],
      },
      { width: '*', text: '' },
      {
        width: 'auto',
        stack: [
          { image: logo, width: 80, alignment: "center" },
          { text: "DR / CROUSZ", fontSize: 14, bold: true, alignment: "center", margin: [0, 6, 0, 2], color: '#000066' },
          { text: subtitleRight, fontSize: 9, bold: true, alignment: "center" },
          ...(referenceText
            ? [{ text: referenceText, fontSize: 8, color: '#666666', alignment: 'right', margin: [0, 6, 0, 0] }]
            : []),
        ],
      },
    ],
  };
}

/**
 * Génère et ouvre le PDF officiel d'un dossier résident
 */
export const openDossierPDF = async (
  dossier: Dossier,
  payments: Payement[],
  allocations: AllocationMateriel[]
) => {
  const { pdfMake, drapeau, logo } = await loadPdfResources();

  const chambreInfo: ChambreInfo =
    typeof dossier.chambreId === 'string'
      ? { nom: 'Non spécifié', pavillon: 'Non spécifié', campus: 'Non spécifié' }
      : {
          nom: dossier.chambreId?.nom || 'Non spécifié',
          pavillon: (dossier.chambreId?.pavillonId as { nom?: string })?.nom || 'Non spécifié',
          campus: (dossier.chambreId?.pavillonId as { campusId?: { nom: string } })?.campusId?.nom || 'Non spécifié',
        };

  const anneeUniv =
    typeof dossier.anneeUniversitaireId === 'string'
      ? dossier.anneeUniversitaireId
      : dossier.anneeUniversitaireId?.nom || 'Non spécifié';

  const borderedLayout = {
    hLineWidth: (i: number, node: PdfTableNode) => (i === 0 || i === node.table.body.length ? 2 : 1),
    vLineWidth: (i: number, node: PdfTableNode) => (i === 0 || i === node.table.widths.length ? 2 : 1),
    hLineColor: (i: number, node: PdfTableNode) => (i === 0 || i === node.table.body.length ? '#003366' : '#DDDDDD'),
    vLineColor: (i: number, node: PdfTableNode) => (i === 0 || i === node.table.widths.length ? '#003366' : '#DDDDDD'),
  };

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 80, 40, 60] as [number, number, number, number],
    header: (currentPage: number, pageCount: number) => ({
      columns: [{ text: `Page ${currentPage} / ${pageCount}`, alignment: 'right', style: 'watermark' }],
      margin: [40, 20],
    }),
    footer: {
      columns: [
        {
          text: 'Centre Régional des Œuvres Universitaires Sociales de Ziguinchor - DR/CROUSZ',
          alignment: 'left',
          style: 'footer',
        },
      ],
      margin: [40, 20],
    },
    watermark: { text: 'DOCUMENT OFFICIEL CROUS/Z', color: '#eeeeee', opacity: 0.5, bold: true, italics: false },
    styles: {
      title: {
        bold: true,
        alignment: 'center',
        fontSize: 17,
        margin: [0, 0, 0, 14],
        color: '#003366',
        decoration: 'underline',
        decorationStyle: 'double',
        decorationColor: '#003366',
      },
      header: {
        bold: true,
        fontSize: 13,
        margin: [0, 14, 0, 8],
        color: '#003366',
        fillColor: '#f0f5ff',
        padding: [5, 3, 5, 3],
      },
      subheader: {
        fontSize: 11,
        bold: true,
        margin: [0, 8, 0, 4],
        color: '#003366',
      },
      normal: { fontSize: 10 },
      signature: {
        alignment: 'right',
        margin: [0, 10, 0, 10],
        fontSize: 10,
        bold: true,
        color: '#003366',
      },
      watermark: { fontSize: 8, color: '#888888', bold: false },
      footer: { italics: true, fontSize: 8, color: '#666666' },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: '#ffffff',
        fillColor: '#003366',
        alignment: 'center',
        margin: [0, 3, 0, 3],
      },
      stamp: { fontSize: 10, alignment: 'center', color: '#003366', bold: true },
    },
    defaultStyle: { font: 'Roboto' },
    content: [
      buildOfficialHeader(
        drapeau,
        logo,
        'Gestion des Résidents',
        `Réf: ${dossier.numero || 'N/A'}-${new Date().getFullYear()}`
      ),
      {
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#000066' }],
        margin: [0, 8, 0, 8],
      },
      { text: 'FICHE DE DOSSIER RÉSIDENT', style: 'title', margin: [0, 8, 0, 14] },
      { text: `Année Universitaire : ${anneeUniv}`, style: 'stamp', margin: [0, 0, 0, 16] },
      {
        stack: [
          { text: 'INFORMATIONS ADMINISTRATIVES', style: 'header', margin: [0, 5, 0, 8] },
          {
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: 515,
                h: 20,
                r: 0,
                lineWidth: 1,
                lineColor: '#003366',
                fillColor: '#EBF1FA',
              },
            ],
          },
          {
            text: `N° ENREGISTREMENT : ${dossier.numero || 'NON ATTRIBUÉ'}`,
            fontSize: 10,
            bold: true,
            alignment: 'center',
            margin: [0, -15, 0, 10],
            color: '#003366',
          },
        ],
      },
      {
        stack: [
          { text: 'INFORMATIONS FINANCIÈRES', style: 'header', margin: [0, 10, 0, 5] },
          {
            table: {
              widths: ['40%', '25%', '35%'],
              body: [
                [
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'Montant (FCFA)', style: 'tableHeader' },
                  { text: 'Observations', style: 'tableHeader' },
                ],
                [
                  { text: 'Caution versée', alignment: 'left', margin: [5, 2, 0, 2] },
                  { text: `${(dossier.caution || 0).toLocaleString()}`, alignment: 'center', bold: true },
                  { text: 'Payable une fois', alignment: 'center', italics: true },
                ],
                [
                  { text: 'Loyer mensuel', alignment: 'left', margin: [5, 2, 0, 2] },
                  { text: `${(dossier.taux_loyer_mensuelle || 0).toLocaleString()}`, alignment: 'center', bold: true },
                  { text: 'Payable mensuellement', alignment: 'center', italics: true },
                ],
                [
                  { text: 'Total cumulé encaissé', alignment: 'left', margin: [5, 2, 0, 2], bold: true },
                  {
                    text: `${(
                      payments.reduce((acc, p) => acc + (p.montant || 0), 0) + (dossier.caution || 0)
                    ).toLocaleString()}`,
                    alignment: 'center',
                    bold: true,
                    fillColor: '#F0F5FF',
                  },
                  { text: 'Caution + Loyers réglés', alignment: 'center' },
                ],
              ],
            },
            layout: borderedLayout,
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        stack: [
          { text: "FICHE D'IDENTIFICATION DE L'ÉTUDIANT", style: 'header', margin: [0, 10, 0, 5] },
          {
            columns: [
              {
                width: '30%',
                stack: [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 110,
                        h: 120,
                        lineWidth: 1,
                        lineColor: '#003366',
                        dash: { length: 5 },
                      },
                    ],
                    alignment: 'center',
                  },
                  { text: "Photo d'identité", alignment: 'center', fontSize: 8, margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: '70%',
                stack: [
                  {
                    table: {
                      widths: ['30%', '70%'],
                      body: [
                        [
                          { text: 'NOM', style: 'tableHeader' },
                          {
                            text: dossier.selectionId?.inscription?.nom || 'NON RENSEIGNÉ',
                            bold: true,
                            margin: [5, 2, 0, 2],
                          },
                        ],
                        [
                          { text: 'PRÉNOM', style: 'tableHeader' },
                          {
                            text: dossier.selectionId?.inscription?.prenom || 'NON RENSEIGNÉ',
                            bold: true,
                            margin: [5, 2, 0, 2],
                          },
                        ],
                        [
                          { text: 'CNI', style: 'tableHeader' },
                          {
                            text: dossier.selectionId?.inscription?.cni || 'NON RENSEIGNÉ',
                            bold: true,
                            margin: [5, 2, 0, 2],
                          },
                        ],
                        [
                          { text: 'NCS', style: 'tableHeader' },
                          {
                            text: dossier.selectionId?.inscription?.ncs || 'NON RENSEIGNÉ',
                            bold: true,
                            margin: [5, 2, 0, 2],
                          },
                        ],
                      ],
                    },
                    layout: borderedLayout,
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 16],
          },
        ],
      },
      {
        stack: [
          { text: 'AFFECTATION DE LOGEMENT', style: 'header', margin: [0, 8, 0, 8] },
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  { text: 'CAMPUS', style: 'tableHeader' },
                  { text: 'PAVILLON', style: 'tableHeader' },
                  { text: 'CHAMBRE', style: 'tableHeader' },
                  { text: "DATE D'ATTRIBUTION", style: 'tableHeader' },
                ],
                [
                  { text: chambreInfo.campus, alignment: 'center', bold: true },
                  { text: chambreInfo.pavillon, alignment: 'center', bold: true },
                  { text: chambreInfo.nom, alignment: 'center', bold: true },
                  {
                    text: dossier.createdAt ? formatDate(new Date(dossier.createdAt)) : 'N/A',
                    alignment: 'center',
                  },
                ],
              ],
            },
            layout: borderedLayout,
          },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        stack: [
          { text: 'SITUATION DES PAIEMENTS', style: 'header', margin: [0, 5, 0, 8] },
          payments.length > 0
            ? {
                table: {
                  widths: ['25%', '35%', '40%'],
                  headerRows: 1,
                  body: [
                    [
                      { text: 'Mois', style: 'tableHeader' },
                      { text: 'N° Facture / Quittance', style: 'tableHeader' },
                      { text: 'Montant réglé', style: 'tableHeader' },
                    ],
                    ...payments.map((payment) => [
                      { text: payment.mois, alignment: 'center', fontSize: 9 },
                      { text: payment.numero_facture || 'N/A', alignment: 'center', fontSize: 9 },
                      { text: `${payment.montant.toLocaleString()} FCFA`, alignment: 'right', bold: true, fontSize: 9 },
                    ]),
                  ],
                },
                layout: borderedLayout,
              }
            : {
                text: 'Aucun paiement enregistré',
                style: 'normal',
                alignment: 'center',
                italics: true,
                margin: [0, 8],
                color: '#666666',
              },
        ],
        margin: [0, 0, 0, 16],
      },
      {
        stack: [
          { text: 'ALLOCATIONS DE MATÉRIEL', style: 'header', margin: [0, 5, 0, 8] },
          allocations.length > 0
            ? {
                table: {
                  widths: ['10%', '35%', '35%', '20%'],
                  headerRows: 1,
                  body: [
                    [
                      { text: 'N°', style: 'tableHeader' },
                      { text: 'Article', style: 'tableHeader' },
                      { text: 'Constat', style: 'tableHeader' },
                      { text: "Date d'allocation", style: 'tableHeader' },
                    ],
                    ...allocations.map((allocation, index) => [
                      { text: String(index + 1), alignment: 'center', fontSize: 9 },
                      {
                        text: (allocation.equipementId as unknown as Equipement)?.nom || 'Non spécifié',
                        alignment: 'left',
                        margin: [5, 2, 0, 2],
                        fontSize: 9,
                      },
                      { text: allocation.constatation || 'Non spécifié', color: '#006633', bold: true, fontSize: 9 },
                      { text: formatDate(new Date(allocation.date)), alignment: 'center', fontSize: 9 },
                    ]),
                  ],
                },
                layout: borderedLayout,
              }
            : {
                text: 'Aucune allocation matérielle enregistrée',
                style: 'normal',
                alignment: 'center',
                italics: true,
                margin: [0, 8],
                color: '#666666',
              },
        ],
      },
      {
        columns: [
          { width: '60%', text: '' },
          {
            width: '40%',
            stack: [
              { text: `Fait à Ziguinchor, le ${formatDateLong(new Date())}`, style: 'signature', margin: [0, 24, 0, 10] },
              { text: 'Le Chef de la Division des Cités', style: 'signature' },
            ],
          },
        ],
      },
    ],
  };

  pdfMake.createPdf(docDefinition).open({}, window);
};

// Alias retro-compatible
export const generateDossierPDF = openDossierPDF;

/**
 * Génère et ouvre une Quittance / Reçu officiel de paiement de loyer PDF
 */
export const openPaymentReceiptPDF = async (
  payment: Payement,
  dossier?: Dossier,
  anneeNom?: string
) => {
  const { pdfMake, drapeau, logo } = await loadPdfResources();
  const targetDossier = dossier || (payment.dossierId as Dossier);
  const insc = targetDossier?.selectionId?.inscription;
  const sessionLabel =
    anneeNom ||
    (typeof targetDossier?.anneeUniversitaireId === 'object'
      ? targetDossier?.anneeUniversitaireId?.nom
      : '') ||
    'Session active';

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50] as [number, number, number, number],
    watermark: { text: 'QUITTANCE CROUS/Z', color: '#f1f5f9', opacity: 0.5, bold: true },
    styles: {
      title: {
        bold: true,
        alignment: 'center',
        fontSize: 16,
        color: '#003366',
        margin: [0, 12, 0, 4],
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#ffffff',
        fillColor: '#003366',
        alignment: 'center',
        margin: [0, 4, 0, 4],
      },
    },
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    content: [
      buildOfficialHeader(
        drapeau,
        logo,
        sessionLabel,
        `Quittance N° ${payment.numero_facture || 'N/A'}`
      ),
      {
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1.5, lineColor: '#003366' }],
        margin: [0, 10, 0, 10],
      },
      { text: 'QUITTANCE DE PAIEMENT DE LOYER UNIVERSITAIRE', style: 'title' },
      {
        text: `Émise le ${formatDate(new Date(), true)}`,
        alignment: 'center',
        fontSize: 9,
        color: '#64748b',
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          widths: ['32%', '68%'],
          body: [
            [
              { text: 'N° QUITTANCE / FACTURE', style: 'tableHeader' },
              { text: payment.numero_facture || 'N/A', bold: true, margin: [8, 4, 0, 4] },
            ],
            [
              { text: 'RÉSIDENT (ÉTUDIANT)', style: 'tableHeader' },
              {
                text: insc ? `${insc.prenom} ${insc.nom}` : 'Non spécifié',
                bold: true,
                margin: [8, 4, 0, 4],
              },
            ],
            [
              { text: 'IDENTIFIANT NCS', style: 'tableHeader' },
              { text: insc?.ncs || 'N/A', margin: [8, 4, 0, 4] },
            ],
            [
              { text: 'DOSSIER N°', style: 'tableHeader' },
              { text: targetDossier?.numero || 'N/A', margin: [8, 4, 0, 4] },
            ],
            [
              { text: 'MOIS CONCERNÉ', style: 'tableHeader' },
              { text: payment.mois, bold: true, color: '#1d4ed8', margin: [8, 4, 0, 4] },
            ],
            [
              { text: 'MONTANT ENCAISSÉ', style: 'tableHeader' },
              {
                text: `${(payment.montant || 0).toLocaleString()} FCFA`,
                bold: true,
                fontSize: 13,
                color: '#059669',
                margin: [8, 6, 0, 6],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 24],
      },
      {
        text: "Pour valoir ce que de droit. Conservez précieusement cette quittance comme justificatif officiel de règlement auprès de la Division des Cités Universitaires.",
        fontSize: 9,
        italics: true,
        color: '#475569',
        margin: [0, 0, 0, 30],
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Signature du Résident', bold: true, alignment: 'center' },
              { text: '(Précédée de la mention Lu et Approuvé)', fontSize: 8, italics: true, alignment: 'center', margin: [0, 2, 0, 40] },
            ],
          },
          {
            width: '50%',
            stack: [
              { text: `Fait à Ziguinchor, le ${formatDateLong(new Date())}`, bold: true, alignment: 'center' },
              { text: 'Le Régisseur / Chef de Division', fontSize: 9, alignment: 'center', margin: [0, 4, 0, 40] },
            ],
          },
        ],
      },
    ],
  };

  pdfMake.createPdf(docDefinition).open({}, window);
};

/**
 * Génère et ouvre les listes officielles de sélection (Pédagogique ou Sociale)
 */
export const openSelectionListPDF = async (options: {
  title: string;
  groupPrefix: string;
  bannerColor: string;
  anneeNom: string;
  groups: SelectionGroup[];
  selectionnees: SelectionEntry[];
  matchKey?: 'formation' | 'campus';
}) => {
  const { pdfMake, drapeau, logo } = await loadPdfResources();
  const { title, groupPrefix, bannerColor, anneeNom, groups, selectionnees } = options;

  const content: unknown[] = [];
  const sortedGroups = [...(groups || [])].sort((a, b) => a.nom.localeCompare(b.nom));

  sortedGroups.forEach((group, groupIdx) => {
    const groupSelections = selectionnees
      .filter((sel) => sel.formation === group._id || sel.campus === group._id)
      .sort((a, b) => a.inscription.genre.localeCompare(b.inscription.genre));

    content.push([
      buildOfficialHeader(drapeau, logo, anneeNom),
      {
        margin: [0, 10],
        fillColor: bannerColor,
        alignment: 'center',
        layout: 'noBorders',
        table: {
          widths: ['100%'],
          body: [[{ text: title, fontSize: 15, bold: true, color: 'white', margin: [0, 4] }]],
        },
      },
      { text: `${groupPrefix} : ${group.nom}`, fontSize: 11, bold: true, margin: [0, 4] },
      {
        margin: [4, 4, 4, 4],
        alignment: 'justify',
        ...(groupIdx < sortedGroups.length - 1 ? { pageBreak: 'after' } : {}),
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? bannerColor : null),
        },
        table: {
          widths: ['8%', '20%', '15%', '17%', '40%'],
          body: [
            [
              { text: 'N°', style: 'entete' },
              { text: 'NCE / NCS', style: 'entete' },
              { text: 'CIVILITÉ', style: 'entete' },
              { text: 'NOM', style: 'entete' },
              { text: 'PRÉNOM', style: 'entete' },
            ],
            ...groupSelections.map((sel, i) => {
              const bg = sel.inscription.genre === 'F' ? '#e4f7e6' : null;
              const civilite =
                sel.inscription.genre === 'F' ? 'Mme' : sel.inscription.genre === 'H' ? 'M. ' : 'Melle';
              return [
                { text: `${i + 1}`, style: 'info', fillColor: bg },
                { text: `${sel.inscription.ncs}`, style: 'info', fillColor: bg },
                { text: civilite, style: 'info', fillColor: bg },
                { text: `${sel.inscription.nom}`, style: 'info', fillColor: bg },
                { text: `${sel.inscription.prenom}`, style: 'info', fillColor: bg },
              ];
            }),
          ],
        },
      },
    ]);
  });

  const docDefinition = {
    footer: {
      text: 'CENTRE RÉGIONAL DES ŒUVRES UNIVERSITAIRES SOCIALES DE ZIGUINCHOR',
      fontSize: 8,
      bold: true,
      alignment: 'center',
    },
    styles: {
      entete: {
        bold: true,
        alignment: 'center',
        fontSize: 9,
        color: 'white',
      },
      info: {
        fontSize: 9,
        margin: [0, 2],
      },
    },
    content,
  };

  pdfMake.createPdf(docDefinition).open();
};
