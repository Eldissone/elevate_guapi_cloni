'use client';

import { useEffect, useState } from 'react';

interface User {
  fullName: string;
  username: string;
  funcao: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPCs: 0,
    totalIPs: 0,
    totalEmails: 0,
    totalSenhas: 0,
    totalImpressoras: 0,
    totalAutomacoes: 0,
    totalRelogios: 0,
    totalServidores: 0,
    totalConectividades: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (isManualRefresh = false) => {
    try {
      const [usersRes, pcsRes, ipsRes, emailsRes, senhasRes, impressorasRes, automacoesRes, relogiosRes, servidoresRes, conectividadesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/computadores?page=1'),
        fetch('/api/ips?page=1'),
        fetch('/api/emails?page=1'),
        fetch('/api/senhas?page=1'),
        fetch('/api/impressoras?page=1'),
        fetch('/api/automacoes?page=1'),
        fetch('/api/relogios-ponto?page=1'),
        fetch('/api/servidores?page=1'),
        fetch('/api/conectividades?page=1'),
      ]);

      const statsData = {
        totalUsers: usersRes.ok ? (await usersRes.json()).users.length : 0,
        totalPCs: pcsRes.ok ? (await pcsRes.json()).pagination.total : 0,
        totalIPs: ipsRes.ok ? (await ipsRes.json()).pagination.total : 0,
        totalEmails: emailsRes.ok ? (await ipsRes.json()).pagination.total : 0,
        totalSenhas: senhasRes.ok ? (await senhasRes.json()).pagination.total : 0,
        totalImpressoras: impressorasRes.ok ? (await impressorasRes.json()).pagination.total : 0,
        totalAutomacoes: automacoesRes.ok ? (await automacoesRes.json()).pagination.total : 0,
        totalRelogios: relogiosRes.ok ? (await relogiosRes.json()).pagination.total : 0,
        totalServidores: servidoresRes.ok ? (await servidoresRes.json()).pagination.total : 0,
        totalConectividades: conectividadesRes.ok ? (await conectividadesRes.json()).pagination.total : 0,
      };

      setStats(statsData);
      setLastUpdate(new Date());
      if (isManualRefresh) {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats(true);
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Nunca atualizado';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `Atualizado há ${diff} segundo${diff !== 1 ? 's' : ''}`;
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `Atualizado há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `Atualizado há ${hours} hora${hours !== 1 ? 's' : ''}`;
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalItems = stats.totalUsers + stats.totalPCs + stats.totalIPs + stats.totalEmails + 
                     stats.totalSenhas + stats.totalImpressoras + stats.totalAutomacoes + 
                     stats.totalRelogios + stats.totalServidores + stats.totalConectividades;

  const statsCards = [
    { label: 'Usuários', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    { label: 'Computadores', value: stats.totalPCs, icon: '💻', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
    { label: 'IPs / VLANs', value: stats.totalIPs, icon: '🌐', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
    { label: 'Emails', value: stats.totalEmails, icon: '📧', color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
    { label: 'Senhas', value: stats.totalSenhas, icon: '🔐', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
    { label: 'Impressoras', value: stats.totalImpressoras, icon: '🖨️', color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
    { label: 'Automações', value: stats.totalAutomacoes, icon: '⚡', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
    { label: 'Relógios de Ponto', value: stats.totalRelogios, icon: '⏰', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
    { label: 'Servidores', value: stats.totalServidores, icon: '🖥️', color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
    { label: 'Conectividades', value: stats.totalConectividades, icon: '📡', color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1d24] via-[#1f2329] to-[#252930] rounded-2xl shadow-2xl border border-gray-800/50 p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,175,80,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400 uppercase tracking-wider">Dashboard</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-3">
                Olá, <span className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] bg-clip-text text-transparent">{user?.fullName || 'Usuário'}</span>
              </h1>
              <p className="text-gray-400 text-lg mb-4">
                Gerencie todos os recursos do sistema em um só lugar
              </p>
              {lastUpdate && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatLastUpdate(lastUpdate)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">IP Público</p>
                    <p className="text-sm font-mono font-semibold text-white">-</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`group relative bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#3d8f41] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 shadow-lg shadow-[#4CAF50]/20 hover:shadow-xl hover:shadow-[#4CAF50]/30 ${
                  refreshing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <svg
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
            </div>
          </div>

          {user?.funcao && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-300">Função:</span>
              <span className="text-sm font-semibold text-white">{user.funcao}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-gradient-to-br from-[#1a1d24] to-[#252930] rounded-2xl shadow-xl border border-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Visão Geral</h2>
            <p className="text-gray-400 text-sm">Resumo de todos os recursos do sistema</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold bg-gradient-to-r from-[#4CAF50] to-[#45a049] bg-clip-text text-transparent">{totalItems}</p>
            <p className="text-sm text-gray-400">Total de Itens</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-[#1f2329] to-[#252930] rounded-xl p-5 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center text-2xl border ${card.borderColor} backdrop-blur-sm`}>
                  {card.icon}
                </div>
                <div className={`px-2 py-1 rounded-md bg-gradient-to-r ${card.color} text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {card.value}
                </div>
              </div>
              <h3 className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">{card.label}</h3>
              <p className="text-3xl font-bold text-white">{card.value.toLocaleString('pt-BR')}</p>
              
              {/* Animated background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 -z-10`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Resources Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1d24] via-[#1f2329] to-[#252930] rounded-2xl shadow-xl border border-gray-800/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Estatísticas do Sistema</h3>
              <p className="text-sm text-gray-400">Distribuição de recursos</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {statsCards.slice(0, 5).map((card, index) => {
              const percentage = totalItems > 0 ? (card.value / totalItems) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{card.icon}</span>
                      <span className="text-gray-300 font-medium">{card.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{card.value}</span>
                      <span className="text-gray-500 text-xs">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Info Card */}
        <div className="bg-gradient-to-br from-[#1a1d24] via-[#1f2329] to-[#252930] rounded-2xl shadow-xl border border-gray-800/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Status do Sistema</h3>
              <p className="text-sm text-gray-400">Informações gerais</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total de Recursos</span>
                <span className="text-lg font-bold text-white">{totalItems}</span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Categorias Ativas</span>
                <span className="text-lg font-bold text-white">10</span>
              </div>
              <p className="text-xs text-gray-500">Tipos de recursos gerenciados</p>
            </div>

            <div className="bg-gradient-to-r from-[#4CAF50]/20 to-[#45a049]/20 backdrop-blur-sm rounded-lg p-4 border border-[#4CAF50]/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-[#4CAF50]">Sistema Operacional</span>
              </div>
              <p className="text-xs text-gray-300">Todas as operações funcionando normalmente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}