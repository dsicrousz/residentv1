import { Form, Input, Button, message, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  CheckCircleFilled,
  TeamOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import type { LoginUser } from "../types/user";
import { useMutation } from "@tanstack/react-query";
import { login } from "../services/user";
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useEffect } from 'react';
import useAuth from 'react-auth-kit/hooks/useIsAuthenticated';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [form] = Form.useForm();
  const isAuth = useAuth();

  useEffect(() => {
    if (isAuth) {
      navigate('/dashboard');
    }
  }, [isAuth, navigate]);

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data) {
        message.success("Connexion réussie");
        signIn({
          auth: {
            token: data.token,
            type: 'localstorage',
          },
          userState: {
            id: data.id,
          },
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 250);
      } else {
        message.error("Échec de connexion");
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      message.error("Identifiants incorrects ou serveur indisponible");
    },
  });

  const handleSubmit = (values: LoginUser) => {
    loginMutation(values);
  };

  const features = [
    {
      icon: <BankOutlined />,
      title: "Patrimoine & Hébergement",
      desc: "Pilotage centralisé des campus, pavillons, chambres et capacités en temps réel.",
    },
    {
      icon: <ApartmentOutlined />,
      title: "Codification Pédagogique & Sociale",
      desc: "Répartition équitable des quotas et sélection assistée par formation.",
    },
    {
      icon: <TeamOutlined />,
      title: "Suivi Résidents & Finances",
      desc: "Gestion des dossiers, loyers mensuels, cautions et allocations matérielles.",
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Ambient Mesh Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '640px',
          height: '640px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '48px',
          zIndex: 1,
        }}
      >
        {/* Left Institutional Showcase Panel (Hidden on small screens via CSS) */}
        <div className="hidden lg:flex flex-col justify-between flex-1 max-w-xl text-white py-8 pr-6 page-enter">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                marginBottom: '28px',
              }}
            >
              <img
                src="/img/drapeau.png"
                alt="Drapeau du Sénégal"
                style={{ width: 22, height: 15, borderRadius: 2, objectFit: 'cover' }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: '#e2e8f0' }}>
                RÉPUBLIQUE DU SÉNÉGAL • MESRI
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 30px rgba(37, 99, 235, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/img/logo.png"
                  alt="Logo CROUSZ"
                  style={{ width: 46, height: 46, objectFit: 'contain' }}
                />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                  }}
                >
                  DR / CROUSZ
                </h1>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 15, fontWeight: 500 }}>
                  Centre Régional des Œuvres Universitaires Sociales de Ziguinchor
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.65,
                color: '#cbd5e1',
                marginBottom: 36,
              }}
            >
              Plateforme numérique unifiée pour la gestion des cités universitaires, des sessions de codification, des dossiers résidents et du suivi budgétaire.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className={`card-enter stagger-${idx + 2}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: 'rgba(30, 41, 59, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(37, 99, 235, 0.2)',
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#f8fafc', marginBottom: 3 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#64748b',
              fontSize: 12,
            }}
          >
            <span>Division des Cités Universitaires</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
              <CheckCircleFilled style={{ color: '#10b981' }} /> Système opérationnel
            </span>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div
          className="page-enter stagger-1"
          style={{
            width: '100%',
            maxWidth: '440px',
            margin: '0 auto',
          }}
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
              }}
            >
              <img src="/img/logo.png" alt="Logo" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            </div>
            <Title level={3} style={{ color: '#ffffff', margin: 0 }}>
              DR/CROUSZ
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>
              Gestion des Résidences Universitaires
            </Text>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: '40px 36px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: '#eff6ff',
                  color: '#2563eb',
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                <SafetyCertificateOutlined /> Portail Administrateur
              </div>
              <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
                Bon retour
              </Title>
              <Text style={{ color: '#64748b', fontSize: 14, display: 'block', marginTop: 4 }}>
                Identifiez-vous pour accéder à votre espace de gestion
              </Text>
            </div>

            <Form
              name="login"
              form={form}
              initialValues={{ remember: true }}
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                label={<span style={{ fontWeight: 500, color: '#334155', fontSize: 13 }}>Adresse email</span>}
                name="username"
                rules={[{ required: true, message: "Veuillez saisir votre adresse email" }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94a3b8', marginRight: 4 }} />}
                  placeholder="admin@crousz.sn"
                  autoComplete="username"
                  style={{
                    height: 46,
                    borderRadius: 10,
                    fontSize: 14,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: '#334155', fontSize: 13 }}>Mot de passe</span>}
                name="password"
                rules={[{ required: true, message: "Veuillez saisir votre mot de passe" }]}
                style={{ marginBottom: 12 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: 4 }} />}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    height: 46,
                    borderRadius: 10,
                    fontSize: 14,
                  }}
                />
              </Form.Item>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 24,
                }}
              >
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: '#2563eb', fontWeight: 500, fontSize: 13 }}
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isPending}
                  icon={!isPending ? <LoginOutlined /> : undefined}
                  style={{
                    height: 48,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.32)',
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  {isPending ? "Authentification..." : "Se connecter à l'espace"}
                </Button>
              </Form.Item>
            </Form>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingTop: 20,
                marginTop: 24,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <SafetyCertificateOutlined style={{ color: '#10b981', fontSize: 15 }} />
              <Text style={{ fontSize: 12, color: '#64748b' }}>
                Connexion chiffrée et protégée • Accès réservé au personnel autorisé
              </Text>
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 20,
              color: '#64748b',
              fontSize: 12,
            }}
          >
            © {new Date().getFullYear()} DR/CROUSZ — Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  );
}
