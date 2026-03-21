'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertTriangle, Shield, Mail, MessageCircle, Phone, Clock } from "lucide-react";

export default function BannedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver logado, redirecionar para login
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  const contactMethods = [
    {
      method: "Email de Suporte",
      icon: Mail,
      availability: "Resposta em 2-6 horas",
      description: "Para questões sobre banimento e apelações",
      action: "support@rubrhythm.com",
      link: "mailto:support@rubrhythm.com"
    },
    {
      method: "Chat ao Vivo",
      icon: MessageCircle,
      availability: "24/7",
      description: "Fale diretamente com nossa equipe",
      action: "Iniciar Chat",
      link: "#chat"
    },
    {
      method: "Telefone de Emergência",
      icon: Phone,
      availability: "24/7 apenas emergências",
      description: "Para questões críticas de segurança",
      action: "+1 (XXX) XXX-XXXX",
      link: "tel:+1-XXX-XXX-XXXX"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mb-16">
        {/* Hero Section - Faixa Vermelha Grande */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-8 mb-8">
          <div className="text-center">
            <AlertTriangle className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">SUA CONTA FOI BANIDA</h1>
            <p className="text-2xl leading-relaxed max-w-4xl mx-auto">
              Sua conta foi suspensa devido a violações das nossas políticas de uso.
            </p>
          </div>
        </div>

        {/* Informações sobre o banimento */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg mb-6">
            <div className="flex items-start">
              <Shield className="h-8 w-8 text-red-600 mr-4 mt-1" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-red-800">Motivo do Banimento</h3>
                <p className="text-gray-700 mb-4 text-lg">
                  Sua conta foi suspensa por violação das nossas políticas de uso e termos de serviço. 
                  Isso pode incluir, mas não se limita a:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
                  <li>Comportamento inadequado ou abusivo</li>
                  <li>Violação das diretrizes da comunidade</li>
                  <li>Atividades suspeitas ou fraudulentas</li>
                  <li>Múltiplas denúncias de outros usuários</li>
                  <li>Uso indevido da plataforma</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-orange-800">O que fazer agora?</h3>
            <p className="text-gray-700 mb-4 text-lg">
              Se você acredita que este banimento foi um erro ou gostaria de apelar desta decisão, 
              entre em contato conosco através dos canais abaixo. Nossa equipe analisará seu caso.
            </p>
            <p className="text-gray-700 text-lg">
              <strong>Importante:</strong> Criar novas contas para contornar o banimento resultará 
              em suspensão permanente de todas as contas associadas.
            </p>
          </div>
        </div>

        {/* Métodos de Contato */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Entre em Contato Conosco</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow border">
                  <div className="text-center">
                    <IconComponent className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-3">{method.method}</h3>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {method.availability}
                    </p>
                    <a 
                      href={method.link}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors inline-block"
                    >
                      {method.action}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Políticas e Termos */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Políticas da Plataforma</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold mb-3 text-blue-800">Termos de Uso</h3>
              <p className="text-gray-700 mb-3">
                Todos os usuários devem seguir nossos termos de uso para manter um ambiente seguro e respeitoso.
              </p>
              <a href="/info/terms" className="text-blue-600 hover:text-blue-800 font-semibold">
                Ler Termos Completos →
              </a>
            </div>
            
            <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold mb-3 text-green-800">Diretrizes da Comunidade</h3>
              <p className="text-gray-700 mb-3">
                Nossas diretrizes garantem que todos os usuários tenham uma experiência positiva e segura.
              </p>
              <a href="/info/law-and-legal" className="text-green-600 hover:text-green-800 font-semibold">
                Ver Diretrizes →
              </a>
            </div>
          </div>
        </div>

        {/* Botão de Logout */}
        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-lg font-semibold"
          >
            Sair da Conta
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}