'use client';

import { useEffect, useState } from 'react';

interface User {
  username: string;
  fullName: string;
  funcao: string;
  isAdmin: boolean;
  nivelAcesso?: string;
}

interface Computador {
  _id: string;
  nome: string;
  descricaoUsuario: string;
  anydesk: string;
  so: {
    _id: string;
    nome: string;
  };
  demaisProgramas: string;
  ip?: {
    _id: string;
    tipo: 'faixa' | 'vlan';
    nome: string;
    faixa?: string;
    vlanNome?: string;
    vlanId?: string;
  };
  modelo?: {
    _id: string;
    nome: string;
    marca: {
      _id: string;
      nome: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface IPDisponivel {
  _id: string;
  tipo: 'faixa' | 'vlan';
  nome: string;
  faixa?: string;
  vlanNome?: string;
  vlanId?: string;
}

interface ModeloDisponivel {
  _id: string;
  nome: string;
  marca: {
    _id: string;
    nome: string;
  };
}

interface SistemaOperacionalDisponivel {
  _id: string;
  nome: string;
}

export default function ListaPCPage() {
  const [user, setUser] = useState<User | null>(null);
  const [computadores, setComputadores] = useState<Computador[]>([]);
  const [ipsDisponiveis, setIPsDisponiveis] = useState<IPDisponivel[]>([]);
  const [modelosDisponiveis, setModelosDisponiveis] = useState<ModeloDisponivel[]>([]);
  const [sistemasDisponiveis, setSistemasDisponiveis] = useState<SistemaOperacionalDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComputador, setEditingComputador] = useState<Computador | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    descricaoUsuario: '',
    anydesk: '',
    so: '',
    demaisProgramas: '',
    ip: '',
    modelo: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
    fetchComputadores();
    fetchIPsDisponiveis();
    fetchModelosDisponiveis();
    fetchSistemasDisponiveis();
  }, [page]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchComputadores = async () => {
    try {
      const response = await fetch(`/api/computadores?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setComputadores(data.computadores);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching computadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIPsDisponiveis = async () => {
    try {
      const response = await fetch('/api/ips?page=1');
      if (response.ok) {
        const data = await response.json();
        setIPsDisponiveis(data.ips);
      }
    } catch (error) {
      console.error('Error fetching IPs disponíveis:', error);
    }
  };

  const fetchModelosDisponiveis = async () => {
    try {
      console.log('Buscando modelos disponíveis para PC...');
      const response = await fetch('/api/modelos');
      const data = await response.json();
      if (response.ok) {
        console.log('Modelos disponíveis recebidos:', data.modelos?.length || 0);
        const modelosArray = Array.isArray(data.modelos) ? data.modelos : [];
        console.log('Definindo modelos disponíveis no estado:', modelosArray.length);
        setModelosDisponiveis(modelosArray);
      } else {
        console.error('Error fetching modelos disponíveis:', response.statusText, data);
        setModelosDisponiveis([]);
      }
    } catch (error) {
      console.error('Error fetching modelos disponíveis:', error);
      setModelosDisponiveis([]);
    }
  };

  const fetchSistemasDisponiveis = async () => {
    try {
      const response = await fetch('/api/sistemas-operacionais');
      if (response.ok) {
        const data = await response.json();
        setSistemasDisponiveis(data.sistemas);
      }
    } catch (error) {
      console.error('Error fetching sistemas operacionais disponíveis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingComputador ? `/api/computadores/${editingComputador._id}` : '/api/computadores';
      const method = editingComputador ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || `Erro ao ${editingComputador ? 'atualizar' : 'criar'} computador`);
        return;
      }

      setFormData({
        nome: '',
        descricaoUsuario: '',
        anydesk: '',
        so: '',
        demaisProgramas: '',
        ip: '',
        modelo: '',
      });
      setShowModal(false);
      setEditingComputador(null);
      fetchComputadores();
      fetchIPsDisponiveis();
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (computador: Computador) => {
    setEditingComputador(computador);
    setFormData({
      nome: computador.nome,
      descricaoUsuario: computador.descricaoUsuario,
      anydesk: computador.anydesk,
      so: computador.so._id || '',
      demaisProgramas: computador.demaisProgramas,
      ip: computador.ip?._id || '',
      modelo: computador.modelo?._id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este computador?')) {
      return;
    }

    try {
      const response = await fetch(`/api/computadores/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComputadores();
        fetchIPsDisponiveis();
      }
    } catch (error) {
      console.error('Error deleting computador:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-gray-400">Carregando computadores...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Lista de PC</h1>
        {user?.nivelAcesso !== 'suporte' && (
          <button
            onClick={() => {
              setEditingComputador(null);
              setFormData({
                nome: '',
                descricaoUsuario: '',
                anydesk: '',
                so: '',
                demaisProgramas: '',
                ip: '',
                modelo: '',
              });
              setShowModal(true);
            }}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold px-4 md:px-6 py-2 md:py-3 rounded-lg transition duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo PC
          </button>
        )}
      </div>

      <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Descrição do Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Anydesk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                S.O.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#282c34] divide-y divide-gray-600">
            {computadores.map((computador) => (
              <tr key={computador._id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{computador.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{computador.descricaoUsuario}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {computador.ip ? (
                    <div className="text-sm text-gray-300">
                      {computador.ip.nome}
                      {computador.ip.tipo === 'faixa' && computador.ip.faixa && ` (${computador.ip.faixa})`}
                      {computador.ip.tipo === 'vlan' && computador.ip.vlanId && ` (${computador.ip.vlanId})`}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {computador.modelo ? (
                    <div className="text-sm text-gray-300">
                      <div>{computador.modelo.nome}</div>
                      <div className="text-xs text-gray-400">{computador.modelo.marca.nome}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{computador.anydesk}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{computador.so.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {formatDate(computador.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.nivelAcesso !== 'suporte' && (
                    <button
                      onClick={() => handleEdit(computador)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Editar
                    </button>
                  )}
                  {(user?.isAdmin || user?.nivelAcesso === 'admin') && (
                    <button
                      onClick={() => handleDelete(computador._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-[#282c34] text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="text-white">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-[#282c34] text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#282c34]/98 backdrop-blur-xl rounded-lg shadow-md p-8 max-w-2xl w-full mx-4 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-white mb-8">{editingComputador ? 'Editar PC' : 'Novo PC'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Computador
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Ex: PC-DESKTOP-123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição do Usuário
                </label>
                <input
                  type="text"
                  value={formData.descricaoUsuario}
                  onChange={(e) => setFormData({ ...formData, descricaoUsuario: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Ex: João Silva - Financeiro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Faixa IP (opcional)
                </label>
                <select
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                >
                  <option value="">Nenhum</option>
                  {ipsDisponiveis.map((ip) => (
                    <option key={ip._id} value={ip._id}>
                      {ip.nome} {ip.tipo === 'faixa' && ip.faixa && `(${ip.faixa})`} {ip.tipo === 'vlan' && ip.vlanId && `(${ip.vlanId})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modelo (opcional)
                </label>
                <select
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                >
                  <option value="">Nenhum</option>
                  {modelosDisponiveis.map((modelo) => (
                    <option key={modelo._id} value={modelo._id}>
                      {modelo.nome} - {modelo.marca.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Anydesk ID
                </label>
                <input
                  type="text"
                  value={formData.anydesk}
                  onChange={(e) => setFormData({ ...formData, anydesk: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Ex: 123 456 789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sistema Operacional
                </label>
                <select
                  value={formData.so}
                  onChange={(e) => setFormData({ ...formData, so: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  required
                >
                  <option value="">Selecione um sistema operacional</option>
                  {sistemasDisponiveis.map((sistema) => (
                    <option key={sistema._id} value={sistema._id}>
                      {sistema.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Demais Programas
                </label>
                <textarea
                  value={formData.demaisProgramas}
                  onChange={(e) => setFormData({ ...formData, demaisProgramas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Liste os programas instalados"
                  rows={3}
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingComputador(null);
                    setFormData({
                      nome: '',
                      descricaoUsuario: '',
                      anydesk: '',
                      so: '',
                      demaisProgramas: '',
                      ip: '',
                      modelo: '',
                    });
                    setError('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold py-2 rounded-lg transition"
                >
                  {editingComputador ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
