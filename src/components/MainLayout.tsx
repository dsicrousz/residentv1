import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Typography,
  Dropdown,
  Badge,
  Breadcrumb,
  Input,
  Spin,
  Modal,
  Tag,
  Descriptions,
  Empty,
} from 'antd';
import type { MenuProps } from 'antd';
import { Link, useLocation, Route, Routes, useNavigate } from 'react-router';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  HomeOutlined,
  FileOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  ToolOutlined,
  KeyOutlined,
  DollarOutlined,
  AppstoreOutlined,
  BuildOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { FaBed } from 'react-icons/fa6';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
import { getUser } from '../services/user';
import { getDossierByAnneeUniversitaireId } from '../services/dossier';
import { useQuery } from '@tanstack/react-query';

const Dossiers = lazy(() => import('../pages/dossiers'));
const Chambres = lazy(() => import('../pages/chambres'));
const AnneeUniversitaire = lazy(() => import('../pages/annee_universitaire'));
const Users = lazy(() => import('../pages/users'));
const Campuses = lazy(() => import('../pages/campuses'));
const CampusDetail = lazy(() => import('../pages/campusDetail'));
const Pavilions = lazy(() => import('../pages/pavilions'));
const PavillonDetail = lazy(() => import('../pages/pavillonDetail'));
const ChambreDetail = lazy(() => import('../pages/chambreDetail'));
const Dashboard = lazy(() => import('../pages/dashboard'));
const DossierDetail = lazy(() => import('../pages/dossierDetail'));
const Equipements = lazy(() => import('../pages/equipements'));
const AnneeUniversitaireDetail = lazy(() => import('../pages/annee_universitaireDetail'));
const ImpressionDoc = lazy(() => import('../pages/ImpressionDoc'));
const SelectionPedagogique = lazy(() => import('../pages/SelectionPedagogique'));
const SelectionSociale = lazy(() => import('../pages/SelectionSociale'));
const InscritPedagogique = lazy(() => import('../pages/InscritPedagogique'));
const Lits = lazy(() => import('../pages/lit'));
const LitDetail = lazy(() => import('../pages/litDetail'));
const PaymentsGlobal = lazy(() => import('../pages/PaymentsGlobal'));
const AllocationsGlobal = lazy(() => import('../pages/AllocationsGlobal'));

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const QUICK_NAV_ITEMS = [
  { title: 'Tableau de bord général', category: 'Navigation', path: '/dashboard', icon: <DashboardOutlined /> },
  { title: 'Sessions de Codification', category: 'Navigation', path: '/dashboard/annee_universitaire', icon: <CalendarOutlined /> },
  { title: 'Gestion des Campus', category: 'Patrimoine', path: '/dashboard/campuses', icon: <BankOutlined /> },
  { title: 'Gestion des Pavillons', category: 'Patrimoine', path: '/dashboard/pavilions', icon: <BuildOutlined /> },
  { title: 'Gestion des Chambres', category: 'Patrimoine', path: '/dashboard/chambres', icon: <KeyOutlined /> },
  { title: 'Gestion des Lits', category: 'Patrimoine', path: '/dashboard/lits', icon: <FaBed /> },
  { title: 'Dossiers des Résidents', category: 'Gestion', path: '/dashboard/dossiers', icon: <FileOutlined /> },
  { title: 'Suivi des Paiements & Loyers', category: 'Finance', path: '/dashboard/payments', icon: <DollarOutlined /> },
  { title: 'Allocations de Matériel', category: 'Gestion', path: '/dashboard/allocations', icon: <AppstoreOutlined /> },
  { title: 'Catalogue des Équipements', category: 'Gestion', path: '/dashboard/equipements', icon: <ToolOutlined /> },
  { title: 'Utilisateurs & Permissions', category: 'Administration', path: '/dashboard/users', icon: <TeamOutlined /> },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Tableau de bord');
  const [breadcrumbs, setBreadcrumbs] = useState<{ title: string; path: string }[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const authUser = useAuthUser() as { id?: string } | null;

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });

  const { data: connectedUser } = useQuery({
    queryKey: ['connectedUser', authUser?.id],
    queryFn: () => getUser(authUser!.id!),
    enabled: !!authUser?.id,
  });

  const { data: searchDossiers = [] } = useQuery({
    queryKey: ['dossiers', activeAnnee?._id],
    queryFn: () => getDossierByAnneeUniversitaireId(activeAnnee?._id || ''),
    enabled: !!activeAnnee?._id && commandOpen,
  });

  // Keyboard shortcut Ctrl+K / Cmd+K for Command Palette (No animation on keyboard toggle per Emil Kowalski rules)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAdmin = !connectedUser?.role || connectedUser.role.length === 0 || connectedUser.role.includes('admin');
  const userDisplayName = connectedUser
    ? `${connectedUser.prenom} ${connectedUser.nom}`
    : 'Administrateur';
  const userRoleLabel = connectedUser?.role?.[0]
    ? connectedUser.role[0].toUpperCase()
    : 'DR/CROUSZ';

  const commandResults = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    const pages = QUICK_NAV_ITEMS.filter(
      (item) =>
        (!q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)) &&
        (isAdmin || item.path !== '/dashboard/users')
    );

    const matchingDossiers = q
      ? searchDossiers
          .filter((d) => {
            const insc = typeof d.selectionId === 'object' ? d.selectionId?.inscription : undefined;
            const fullName = `${insc?.prenom || ''} ${insc?.nom || ''}`.toLowerCase();
            return (
              d.numero?.toLowerCase().includes(q) ||
              fullName.includes(q) ||
              insc?.ncs?.toLowerCase().includes(q)
            );
          })
          .slice(0, 6)
          .map((d) => {
            const insc = typeof d.selectionId === 'object' ? d.selectionId?.inscription : undefined;
            return {
              title: `Dossier ${d.numero} — ${insc?.prenom || ''} ${insc?.nom || ''} (${insc?.ncs || ''})`,
              category: 'Dossier Résident',
              path: `/dashboard/dossierDetail/${d._id}`,
              icon: <UserOutlined />,
            };
          })
      : [];

    return [...matchingDossiers, ...pages];
  }, [commandQuery, searchDossiers, isAdmin]);

  const getSelectedMenuKey = () => {
    const p = location.pathname;
    if (p.includes('/campus')) return '/dashboard/campuses';
    if (p.includes('/pavillon') || p.includes('/pavilions')) return '/dashboard/pavilions';
    if (p.includes('/chambre')) return '/dashboard/chambres';
    if (p.includes('/lit')) return '/dashboard/lits';
    if (p.includes('/dossier')) return '/dashboard/dossiers';
    if (p.includes('/annee_universitaire')) return '/dashboard/annee_universitaire';
    if (p.includes('/equipements')) return '/dashboard/equipements';
    if (p.includes('/payments')) return '/dashboard/payments';
    if (p.includes('/allocations')) return '/dashboard/allocations';
    if (p.includes('/users')) return '/dashboard/users';
    return '/dashboard';
  };

  useEffect(() => {
    const path = location.pathname.split('/').filter(Boolean);
    const currentPage = path[path.length - 1];

    let title = 'Tableau de bord';
    const crumbs = [{ title: 'Accueil', path: '/dashboard' }];

    if (location.pathname.includes('campusDetail')) {
      title = 'Détails du Campus';
      crumbs.push({ title: 'Campus', path: '/dashboard/campuses' });
      crumbs.push({ title: 'Fiche Campus', path: location.pathname });
    } else if (location.pathname.includes('pavillonDetail')) {
      title = 'Détails du Pavillon';
      crumbs.push({ title: 'Pavillons', path: '/dashboard/pavilions' });
      crumbs.push({ title: 'Fiche Pavillon', path: location.pathname });
    } else if (location.pathname.includes('chambreDetail')) {
      title = 'Détails de la Chambre';
      crumbs.push({ title: 'Chambres', path: '/dashboard/chambres' });
      crumbs.push({ title: 'Fiche Chambre', path: location.pathname });
    } else if (location.pathname.includes('litDetail')) {
      title = 'Détails du Lit';
      crumbs.push({ title: 'Lits', path: '/dashboard/lits' });
      crumbs.push({ title: 'Fiche Lit', path: location.pathname });
    } else if (location.pathname.includes('dossierDetail')) {
      title = 'Dossier Résident';
      crumbs.push({ title: 'Dossiers', path: '/dashboard/dossiers' });
      crumbs.push({ title: 'Consultation', path: location.pathname });
    } else if (location.pathname.includes('selection-pedagogique')) {
      title = 'Sélection Pédagogique';
      crumbs.push({ title: 'Sessions', path: '/dashboard/annee_universitaire' });
      crumbs.push({ title: 'Sélection Pédagogique', path: location.pathname });
    } else if (location.pathname.includes('selection-sociale')) {
      title = 'Sélection Sociale';
      crumbs.push({ title: 'Sessions', path: '/dashboard/annee_universitaire' });
      crumbs.push({ title: 'Sélection Sociale', path: location.pathname });
    } else if (location.pathname.includes('impression-doc')) {
      title = 'Impression des Fiches';
      crumbs.push({ title: 'Sessions', path: '/dashboard/annee_universitaire' });
      crumbs.push({ title: 'Impressions PDF', path: location.pathname });
    } else {
      switch (currentPage) {
        case 'users':
          title = 'Gestion des Utilisateurs';
          crumbs.push({ title: 'Utilisateurs', path: '/dashboard/users' });
          break;
        case 'campuses':
          title = 'Gestion des Campus';
          crumbs.push({ title: 'Campus', path: '/dashboard/campuses' });
          break;
        case 'pavilions':
          title = 'Gestion des Pavillons';
          crumbs.push({ title: 'Pavillons', path: '/dashboard/pavilions' });
          break;
        case 'chambres':
          title = 'Gestion des Chambres';
          crumbs.push({ title: 'Chambres', path: '/dashboard/chambres' });
          break;
        case 'lits':
          title = 'Gestion des Lits';
          crumbs.push({ title: 'Lits', path: '/dashboard/lits' });
          break;
        case 'dossiers':
          title = 'Dossiers des Résidents';
          crumbs.push({ title: 'Dossiers', path: '/dashboard/dossiers' });
          break;
        case 'annee_universitaire':
          title = 'Sessions de Codification';
          crumbs.push({ title: 'Sessions', path: '/dashboard/annee_universitaire' });
          break;
        case 'equipements':
          title = 'Catalogue des Équipements';
          crumbs.push({ title: 'Équipements', path: '/dashboard/equipements' });
          break;
        case 'payments':
          title = 'Suivi des Paiements';
          crumbs.push({ title: 'Paiements', path: '/dashboard/payments' });
          break;
        case 'allocations':
          title = 'Allocations de Matériel';
          crumbs.push({ title: 'Allocations', path: '/dashboard/allocations' });
          break;
        default:
          if (location.pathname.startsWith('/dashboard/annee_universitaire/')) {
            title = 'Pilotage de la Session';
            crumbs.push({ title: 'Sessions', path: '/dashboard/annee_universitaire' });
            crumbs.push({ title: 'Détails', path: location.pathname });
          }
          break;
      }
    }

    setPageTitle(title);
    setBreadcrumbs(crumbs);
  }, [location]);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon Profil',
    },
    ...(isAdmin
      ? [
          {
            key: 'users',
            icon: <SettingOutlined />,
            label: 'Gestion des accès',
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Déconnexion',
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      signOut();
      navigate('/');
    } else if (key === 'profile') {
      setProfileOpen(true);
    } else if (key === 'users') {
      navigate('/dashboard/users');
    }
  };

  const notificationItems: MenuProps['items'] = [
    {
      key: 'notif1',
      label: (
        <div style={{ padding: '4px 0' }} onClick={() => navigate('/dashboard/dossiers')}>
          <div style={{ fontWeight: 500, fontSize: 13 }}>Consulter les dossiers résidents</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Session {activeAnnee?.nom || 'active'}</div>
        </div>
      ),
      icon: <FileOutlined style={{ color: '#2563eb' }} />,
    },
    {
      key: 'notif2',
      label: (
        <div style={{ padding: '4px 0' }} onClick={() => navigate('/dashboard/chambres')}>
          <div style={{ fontWeight: 500, fontSize: 13 }}>Capacités & Chambres</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Vérifier la disponibilité</div>
        </div>
      ),
      icon: <HomeOutlined style={{ color: '#f59e0b' }} />,
    },
    {
      key: 'notif3',
      label: (
        <div style={{ padding: '4px 0' }} onClick={() => navigate('/dashboard/payments')}>
          <div style={{ fontWeight: 500, fontSize: 13 }}>Journal des paiements</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Quittances et loyers</div>
        </div>
      ),
      icon: <DollarOutlined style={{ color: '#10b981' }} />,
    },
  ];

  const groupLabelStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '8px 8px 4px',
    display: 'block',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={264}
        collapsedWidth={80}
        style={{
          background: '#0f172a',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          zIndex: 20,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          transition:
            'width 220ms var(--ease-drawer), min-width 220ms var(--ease-drawer), max-width 220ms var(--ease-drawer)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '20px 0' : '20px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              flexShrink: 0,
            }}
          >
            <Avatar shape="square" size={28} src="/img/logo.png" style={{ background: 'transparent' }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div
                style={{
                  color: '#f8fafc',
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  fontFamily: 'var(--font-display)',
                }}
              >
                DR / CROUSZ
              </div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                Résidences Universitaires
              </div>
            </div>
          )}
        </div>

        {/* Active Academic Year Pill */}
        {activeAnnee?.nom && (
          <div
            style={{
              margin: collapsed ? '14px 12px' : '16px 16px 8px',
              padding: collapsed ? '10px 0' : '10px 14px',
              background: 'rgba(37, 99, 235, 0.12)',
              borderRadius: 10,
              border: '1px solid rgba(59, 130, 246, 0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {!collapsed && (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Session Active
                  </div>
                  <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>
                    {activeAnnee.nom}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && <CalendarOutlined style={{ color: '#60a5fa', fontSize: 15 }} />}
          </div>
        )}

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[getSelectedMenuKey()]}
          theme="dark"
          className="custom-sidebar-menu"
          style={{
            background: 'transparent',
            borderRight: 0,
            padding: '8px 12px 24px',
          }}
          items={[
            {
              key: 'main',
              type: 'group',
              label: !collapsed ? <span style={groupLabelStyle}>Pilotage</span> : null,
              children: [
                {
                  key: '/dashboard',
                  icon: <DashboardOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard">Tableau de bord</Link>,
                },
                {
                  key: '/dashboard/annee_universitaire',
                  icon: <CalendarOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/annee_universitaire">Sessions & Codification</Link>,
                },
              ],
            },
            {
              key: 'infrastructure',
              type: 'group',
              label: !collapsed ? <span style={{ ...groupLabelStyle, marginTop: 12 }}>Patrimoine</span> : null,
              children: [
                {
                  key: '/dashboard/campuses',
                  icon: <BankOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/campuses">Campus</Link>,
                },
                {
                  key: '/dashboard/pavilions',
                  icon: <BuildOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/pavilions">Pavillons</Link>,
                },
                {
                  key: '/dashboard/chambres',
                  icon: <KeyOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/chambres">Chambres</Link>,
                },
                {
                  key: '/dashboard/lits',
                  icon: (
                    <span style={{ fontSize: 15, display: 'inline-flex', alignItems: 'center' }}>
                      <FaBed />
                    </span>
                  ),
                  label: <Link to="/dashboard/lits">Lits</Link>,
                },
              ],
            },
            {
              key: 'gestion',
              type: 'group',
              label: !collapsed ? <span style={{ ...groupLabelStyle, marginTop: 12 }}>Résidents & Biens</span> : null,
              children: [
                {
                  key: '/dashboard/dossiers',
                  icon: <FileOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/dossiers">Dossiers Résidents</Link>,
                },
                {
                  key: '/dashboard/payments',
                  icon: <DollarOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/payments">Paiements & Loyers</Link>,
                },
                {
                  key: '/dashboard/allocations',
                  icon: <AppstoreOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/allocations">Allocations Matériel</Link>,
                },
                {
                  key: '/dashboard/equipements',
                  icon: <ToolOutlined style={{ fontSize: 17 }} />,
                  label: <Link to="/dashboard/equipements">Catalogue Équipements</Link>,
                },
              ],
            },
            ...(isAdmin
              ? [
                  {
                    key: 'administration',
                    type: 'group' as const,
                    label: !collapsed ? (
                      <span style={{ ...groupLabelStyle, marginTop: 12 }}>Administration</span>
                    ) : null,
                    children: [
                      {
                        key: '/dashboard/users',
                        icon: <TeamOutlined style={{ fontSize: 17 }} />,
                        label: <Link to="/dashboard/users">Utilisateurs & Accès</Link>,
                      },
                    ],
                  },
                ]
              : []),
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 28px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 15,
            height: 68,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 16,
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#f1f5f9',
                color: '#334155',
              }}
            />

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {pageTitle}
              </div>
              <Breadcrumb
                items={breadcrumbs.map((crumb, idx) => ({
                  title:
                    idx === breadcrumbs.length - 1 ? (
                      <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{crumb.title}</span>
                    ) : (
                      <Link to={crumb.path} style={{ color: '#94a3b8', fontSize: 12 }}>
                        {crumb.title}
                      </Link>
                    ),
                }))}
                style={{ marginTop: 2 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Quick Command Palette Trigger (Ctrl + K) */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="pressable"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                height: 38,
                padding: '0 12px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <SearchOutlined style={{ color: '#94a3b8' }} />
              <span className="hidden sm:inline">Rechercher un dossier, une page...</span>
              <kbd
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 5,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                }}
              >
                Ctrl K
              </kbd>
            </button>

            <Dropdown menu={{ items: notificationItems }} placement="bottomRight" arrow trigger={['click']}>
              <Badge count={3} size="small" offset={[-4, 4]} color="#2563eb">
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 16, color: '#475569' }} />}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                />
              </Badge>
            </Dropdown>

            <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <div
                className="pressable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 12px 4px 5px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  gap: 9,
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  }}
                  size={30}
                />
                <div style={{ lineHeight: 1.15 }}>
                  <Text strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>
                    {userDisplayName}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>{userRoleLabel}</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            padding: 0,
            margin: 0,
            minHeight: 'calc(100vh - 68px)',
            background: 'var(--bg-app)',
            overflowX: 'hidden',
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 'calc(100vh - 140px)',
                  gap: 12,
                }}
              >
                <Spin size="large" />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Chargement de l'interface...
                </Text>
              </div>
            }
          >
            <div key={location.pathname} className="page-enter">
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="campuses" element={<Campuses />} />
                <Route path="campusDetail/:id" element={<CampusDetail />} />
                <Route path="pavilions" element={<Pavilions />} />
                <Route path="pavillonDetail/:id" element={<PavillonDetail />} />
                <Route path="dossiers" element={<Dossiers />} />
                <Route path="dossierDetail/:id" element={<DossierDetail />} />
                <Route path="chambres" element={<Chambres />} />
                <Route path="lits" element={<Lits />} />
                <Route path="litDetail/:id" element={<LitDetail />} />
                <Route path="chambreDetail/:id" element={<ChambreDetail />} />
                <Route path="annee_universitaire" element={<AnneeUniversitaire />} />
                <Route path="annee_universitaire/:id" element={<AnneeUniversitaireDetail />} />
                <Route path="equipements" element={<Equipements />} />
                <Route path="annee_universitaire/:id/impression-doc" element={<ImpressionDoc />} />
                <Route path="annee_universitaire/:id/selection-pedagogique" element={<SelectionPedagogique />} />
                <Route path="annee_universitaire/:id/selection-pedagogique/:idfor" element={<InscritPedagogique />} />
                <Route path="annee_universitaire/:id/selection-sociale" element={<SelectionSociale />} />
                <Route path="payments" element={<PaymentsGlobal />} />
                <Route path="allocations" element={<AllocationsGlobal />} />
              </Routes>
            </div>
          </Suspense>
        </Content>
      </Layout>

      {/* Instant Command Palette Modal (No animation on keyboard shortcut per Emil Kowalski rules) */}
      <Modal
        open={commandOpen}
        onCancel={() => {
          setCommandOpen(false);
          setCommandQuery('');
        }}
        footer={null}
        closable={false}
        width={580}
        transitionName=""
        maskTransitionName=""
        styles={{
          body: { padding: 0 },
          content: { padding: 16, borderRadius: 16 },
        }}
      >
        <Input
          autoFocus
          size="large"
          prefix={<SearchOutlined style={{ color: '#2563eb', marginRight: 6 }} />}
          placeholder="Rechercher une page, un étudiant (nom, NCS) ou un N° de dossier..."
          value={commandQuery}
          onChange={(e) => setCommandQuery(e.target.value)}
          allowClear
          style={{ marginBottom: 12 }}
        />

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {commandResults.length > 0 ? (
            commandResults.map((item, idx) => (
              <div
                key={`${item.path}-${idx}`}
                onClick={() => {
                  navigate(item.path);
                  setCommandOpen(false);
                  setCommandQuery('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.category}</div>
                  </div>
                </div>
                <ArrowRightOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
              </div>
            ))
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Aucun résultat trouvé"
              style={{ margin: '24px 0' }}
            />
          )}
        </div>
      </Modal>

      {/* User Profile Modal */}
      <Modal
        title="Mon Profil Utilisateur"
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        centered
        footer={[
          <Button key="close" type="primary" onClick={() => setProfileOpen(false)}>
            Fermer
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Avatar
            size={60}
            icon={<UserOutlined />}
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
          />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{userDisplayName}</div>
            <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ marginTop: 4 }}>
              {userRoleLabel}
            </Tag>
          </div>
        </div>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Prénom">{connectedUser?.prenom || 'Admin'}</Descriptions.Item>
          <Descriptions.Item label="Nom">{connectedUser?.nom || 'CROUSZ'}</Descriptions.Item>
          <Descriptions.Item label="Email">{connectedUser?.email || 'admin@crousz.sn'}</Descriptions.Item>
          <Descriptions.Item label="Statut">
            <Tag color="success">Compte Actif</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </Layout>
  );
}
