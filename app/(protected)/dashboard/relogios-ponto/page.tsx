'use client';

import { useEffect, useState } from 'react';

interface User {
  username: string;
  fullName: string;
  funcao: string;
  isAdmin: boolean;
  nivelAcesso?: string;
}

interface RelogioPontoType {
  _id: string;
  setor: string;
  numeroSerie: string;
  tipo: {
    _id: string;
    nome: string;
  };
  enderecoIP: string;
  categoria?: string;
  faixa?: {
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

interface CategoriaType {
  _id: string;
  nome: string;
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

interface TipoDisponivel {
  _id: string;
  nome: string;
}

export default function RelogiosPontoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [relogios, setRelogios] = useState<RelogioPontoType[]>([]);
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [ipsDisponiveis, setIPsDisponiveis] = useState<IPDisponivel[]>([]);
  const [modelosDisponiveis, setModelosDisponiveis] = useState<ModeloDisponivel[]>([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState<TipoDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRelogio, setEditingRelogio] = useState<RelogioPontoType | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    setor: '',
    numeroSerie: '',
    modelo: '',
    tipo: '',
    enderecoIP: '',
    categoria: '',
    faixa: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
    fetchRelogios();
    fetchCategorias();
    fetchIPsDisponiveis();
    fetchModelosDisponiveis();
    fetchTiposDisponiveis();
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

  const fetchRelogios = async () => {
    try {
      const response = await fetch(`/api/relogios-ponto?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setRelogios(data.relogios);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching relogios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data.categorias || []);
      }
    } catch (error) {
      console.error('Error fetching categorias:', error);
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
      console.log('Buscando modelos disponíveis para relógios de ponto...');
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

  const fetchTiposDisponiveis = async () => {
    try {
      const response = await fetch('/api/tipos');
      if (response.ok) {
        const data = await response.json();
        setTiposDisponiveis(data.tipos);
      }
    } catch (error) {
      console.error('Error fetching tipos disponíveis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingRelogio ? `/api/relogios-ponto/${editingRelogio._id}` : '/api/relogios-ponto';
      const method = editingRelogio ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || `Erro ao ${editingRelogio ? 'atualizar' : 'criar'} relógio de ponto`);
        return;
      }

      setFormData({
        setor: '',
        numeroSerie: '',
        modelo: '',
        tipo: '',
        enderecoIP: '',
        categoria: '',
        faixa: '',
      });
      setShowModal(false);
      setEditingRelogio(null);
      fetchRelogios();
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (relogio: RelogioPontoType) => {
    setEditingRelogio(relogio);
    setFormData({
      setor: relogio.setor,
      numeroSerie: relogio.numeroSerie,
      modelo: relogio.modelo?._id || '',
      tipo: relogio.tipo._id || '',
      enderecoIP: relogio.enderecoIP,
      categoria: relogio.categoria || '',
      faixa: relogio.faixa?._id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relógio de ponto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/relogios-ponto/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRelogios();
      }
    } catch (error) {
      console.error('Error deleting relogio:', error);
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
    return <div className="text-gray-400">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Relógios de Ponto</h1>
        {user?.nivelAcesso !== 'suporte' && (
          <button
            onClick={() => {
              setEditingRelogio(null);
              setFormData({
                setor: '',
                numeroSerie: '',
                modelo: '',
                tipo: '',
                enderecoIP: '',
                categoria: '',
                faixa: '',
              });
              setShowModal(true);
            }}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold px-6 py-3 rounded-lg transition duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Relógio de Ponto
          </button>
        )}
      </div>

      <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Setor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nº Série
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Endereço IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Faixa
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
            {relogios.map((relogio) => (
              <tr key={relogio._id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{relogio.setor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{relogio.numeroSerie}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {relogio.modelo ? (
                    <div className="text-sm text-gray-300">
                      <div>{relogio.modelo.nome}</div>
                      <div className="text-xs text-gray-400">{relogio.modelo.marca.nome}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{relogio.tipo.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{relogio.enderecoIP}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{relogio.categoria || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {relogio.faixa ? (
                    <div className="text-sm text-gray-300">
                      {relogio.faixa.nome}
                      {relogio.faixa.tipo === 'faixa' && relogio.faixa.faixa && ` (${relogio.faixa.faixa})`}
                      {relogio.faixa.tipo === 'vlan' && relogio.faixa.vlanId && ` (${relogio.faixa.vlanId})`}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {formatDate(relogio.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.nivelAcesso !== 'suporte' && (
                    <button
                      onClick={() => handleEdit(relogio)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Editar
                    </button>
                  )}
                  {(user?.isAdmin || user?.nivelAcesso === 'admin') && (
                    <button
                      onClick={() => handleDelete(relogio._id)}
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
            <h2 className="text-3xl font-bold text-white mb-8">{editingRelogio ? 'Editar Relógio de Ponto' : 'Novo Relógio de Ponto'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Setor
                </label>
                <input
                  type="text"
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Ex: Financeiro, TI, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nº Série
                </label>
                <input
                  type="text"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Número de série"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {tiposDisponiveis.map((tipo) => (
                    <option key={tipo._id} value={tipo._id}>
                      {tipo.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Endereço IP
                </label>
                <input
                  type="text"
                  value={formData.enderecoIP}
                  onChange={(e) => setFormData({ ...formData, enderecoIP: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Ex: 192.168.1.100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria (opcional)
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                >
                  <option value="">Nenhuma</option>
                  {categorias.map((categoria) => (
                    <option key={categoria._id} value={categoria.nome}>
                      {categoria.nome}
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
                  Faixa IP (opcional)
                </label>
                <select
                  value={formData.faixa}
                  onChange={(e) => setFormData({ ...formData, faixa: e.target.value })}
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

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRelogio(null);
                    setFormData({
                      setor: '',
                      numeroSerie: '',
                      modelo: '',
                      tipo: '',
                      enderecoIP: '',
                      categoria: '',
                      faixa: '',
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
                  {editingRelogio ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

