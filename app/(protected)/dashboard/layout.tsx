'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  username: string;
  fullName: string;
  funcao: string;
  isAdmin: boolean;
  nivelAcesso?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (!response.ok) {
        router.push('/');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e2228] flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-[#1e2228]">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#282c34] text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-[#282c34] shadow-lg transform transition-transform duration-300 z-40 lg:translate-x-0 overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            <span className="text-white">Fibra</span>{' '}
            <span 
              style={{
                background: 'linear-gradient(90deg, #ffffff 0%, #4CAF50 50%, #ffffff 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 3s ease infinite'
              }}
            >
              Control
            </span>
          </h1>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/dashboard/lista-pc"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard/lista-pc')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Lista de PC
            </Link>

            <Link
              href="/dashboard/gestao-ip"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard/gestao-ip')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Gestão de IP
            </Link>

            {(user.isAdmin || user.nivelAcesso === 'admin' || user.nivelAcesso === 'analista') && (
              <>
                <Link
                  href="/dashboard/emails"
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive('/dashboard/emails')
                      ? 'bg-[#4CAF50] text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </Link>

                <Link
                  href="/dashboard/senhas"
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive('/dashboard/senhas')
                      ? 'bg-[#4CAF50] text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Senhas
                </Link>
              </>
            )}

            <Link
              href="/dashboard/impressoras"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard/impressoras')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Impressoras
            </Link>

            <Link
              href="/dashboard/automacoes"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard/automacoes')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Automações
            </Link>

            <Link
              href="/dashboard/relogios-ponto"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard/relogios-ponto')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Relógio de Ponto
            </Link>

            <Link
              href="/dashboard/servidores"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard/servidores')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Servidores
            </Link>

            <Link
              href="/dashboard/conectividades"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive('/dashboard/conectividades')
                  ? 'bg-[#4CAF50] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              Conectividade
            </Link>

            {(user.isAdmin || user.nivelAcesso === 'admin') && (
              <div>
                <button
                  onClick={() => setShowConfigMenu(!showConfigMenu)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                    isActive('/dashboard/usuarios') || isActive('/dashboard/parametros')
                      ? 'bg-[#4CAF50] text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                  <svg
                    className={`w-5 h-5 ml-auto transition transform ${
                      showConfigMenu ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showConfigMenu && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      href="/dashboard/usuarios"
                      className={`flex items-center px-4 py-2 rounded-lg transition text-sm ${
                        isActive('/dashboard/usuarios')
                          ? 'bg-[#4CAF50]/20 text-[#4CAF50]'
                          : 'text-gray-400 hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        setShowConfigMenu(false);
                        setSidebarOpen(false);
                      }}
                    >
                      Usuários
                    </Link>
                    <Link
                      href="/dashboard/parametros"
                      className={`flex items-center px-4 py-2 rounded-lg transition text-sm ${
                        isActive('/dashboard/parametros')
                          ? 'bg-[#4CAF50]/20 text-[#4CAF50]'
                          : 'text-gray-400 hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        setShowConfigMenu(false);
                        setSidebarOpen(false);
                      }}
                    >
                      Parâmetros
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center mr-3">
                <span className="text-white font-semibold">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">{user.fullName}</p>
                <p className="text-gray-400 text-xs">{user.funcao}</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <Link
                  href="/dashboard/perfil"
                  className="block px-4 py-3 text-gray-300 hover:bg-gray-700 transition"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Editar Perfil
                  </div>
                </Link>
                <Link
                  href="/dashboard/trocar-senha"
                  className="block px-4 py-3 text-gray-300 hover:bg-gray-700 transition"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Trocar Senha
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 transition"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
        {children}
      </div>
    </div>
  );
}

