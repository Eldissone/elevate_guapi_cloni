'use client';

import { useEffect, useState } from 'react';

interface User {
  username: string;
  fullName: string;
  funcao: string;
  isAdmin: boolean;
  nivelAcesso?: string;
}

interface ConectividadeType {
  _id: string;
  nome: string;
  ip: string;
  categoria?: {
    _id: string;
    nome: string;
  };
  tipo: {
    _id: string;
    nome: string;
  };
  servico: {
    _id: string;
    nome: string;
  };
  modelo: {
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

interface TipoDisponivel {
  _id: string;
  nome: string;
}

interface ServicoDisponivel {
  _id: string;
  nome: string;
}

interface ModeloDisponivel {
  _id: string;
  nome: string;
  marca: {
    _id: string;
    nome: string;
  };
}

export default function ConectividadesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [conectividades, setConectividades] = useState<ConectividadeType[]>([]);
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState<TipoDisponivel[]>([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState<ServicoDisponivel[]>([]);
  const [modelosDisponiveis, setModelosDisponiveis] = useState<ModeloDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConectividade, setEditingConectividade] = useState<ConectividadeType | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    ip: '',
    categoria: '',
    tipo: '',
    servico: '',
    modelo: '',
  });
  const [filtros, setFiltros] = useState({
    search: '',
    categoria: '',
    tipo: '',
    servico: '',
    modelo: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
    fetchConectividades();
    fetchCategorias();
    fetchTiposDisponiveis();
    fetchServicosDisponiveis();
    fetchModelosDisponiveis();
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchConectividades();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.servico) params.append('servico', filtros.servico);
    if (filtros.modelo) params.append('modelo', filtros.modelo);
    params.append('page', page.toString());
    return params.toString();
  };

  const fetchConectividades = async () => {
    try {
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/conectividades?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setConectividades(data.conectividades);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching conectividades:', error);
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

  const fetchTiposDisponiveis = async () => {
    try {
      const response = await fetch('/api/tipos');
      if (response.ok) {
        const data = await response.json();
        setTiposDisponiveis(data.tipos);
      }
    } catch (error) {
      console.error('Error fetching tipos:', error);
    }
  };

  const fetchServicosDisponiveis = async () => {
    try {
      const response = await fetch('/api/servicos');
      if (response.ok) {
        const data = await response.json();
        setServicosDisponiveis(data.servicos);
      }
    } catch (error) {
      console.error('Error fetching servicos:', error);
    }
  };

  const fetchModelosDisponiveis = async () => {
    try {
      console.log('Buscando modelos disponíveis para conectividade...');
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
      console.error('Error fetching modelos:', error);
      setModelosDisponiveis([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingConectividade ? `/api/conectividades/${editingConectividade._id}` : '/api/conectividades';
      const method = editingConectividade ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || `Erro ao ${editingConectividade ? 'atualizar' : 'criar'} conectividade`);
        return;
      }

      setFormData({
        nome: '',
        ip: '',
        categoria: '',
        tipo: '',
        servico: '',
        modelo: '',
      });
      setShowModal(false);
      setEditingConectividade(null);
      fetchConectividades();
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (conectividade: ConectividadeType) => {
    setEditingConectividade(conectividade);
    setFormData({
      nome: conectividade.nome,
      ip: conectividade.ip,
      categoria: conectividade.categoria?._id || '',
      tipo: conectividade.tipo._id,
      servico: conectividade.servico._id,
      modelo: conectividade.modelo._id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conectividade?')) {
      return;
    }

    try {
      const response = await fetch(`/api/conectividades/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchConectividades();
      }
    } catch (error) {
      console.error('Error deleting conectividade:', error);
    }
  };

  const clearFilters = () => {
    setFiltros({
      search: '',
      categoria: '',
      tipo: '',
      servico: '',
      modelo: '',
    });
    setPage(1);
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
        <h1 className="text-3xl font-bold text-white">Conectividades</h1>
        {user?.nivelAcesso !== 'suporte' && (
          <button
            onClick={() => {
              setEditingConectividade(null);
              setFormData({
                nome: '',
                ip: '',
                categoria: '',
                tipo: '',
                servico: '',
                modelo: '',
              });
              setShowModal(true);
            }}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold px-6 py-3 rounded-lg transition duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Conectividade
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-[#282c34] rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Filtros de Busca</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Busca Geral
            </label>
            <input
              type="text"
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              placeholder="Nome, IP ou Categoria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoria
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria._id} value={categoria._id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
            >
              <option value="">Todos</option>
              {tiposDisponiveis.map((tipo) => (
                <option key={tipo._id} value={tipo._id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Serviço
            </label>
            <select
              value={filtros.servico}
              onChange={(e) => setFiltros({ ...filtros, servico: e.target.value })}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
            >
              <option value="">Todos</option>
              {servicosDisponiveis.map((servico) => (
                <option key={servico._id} value={servico._id}>
                  {servico.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modelo
            </label>
            <select
              value={filtros.modelo}
              onChange={(e) => setFiltros({ ...filtros, modelo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
            >
              <option value="">Todos</option>
              {modelosDisponiveis.map((modelo) => (
                <option key={modelo._id} value={modelo._id}>
                  {modelo.nome} - {modelo.marca.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Serviço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Modelo
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
            {conectividades.map((conectividade) => (
              <tr key={conectividade._id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{conectividade.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{conectividade.ip}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{conectividade.categoria?.nome || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{conectividade.tipo.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{conectividade.servico.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    <div>{conectividade.modelo.nome}</div>
                    <div className="text-xs text-gray-400">{conectividade.modelo.marca.nome}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {formatDate(conectividade.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.nivelAcesso !== 'suporte' && (
                    <button
                      onClick={() => handleEdit(conectividade)}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Editar
                    </button>
                  )}
                  {(user?.isAdmin || user?.nivelAcesso === 'admin') && (
                    <button
                      onClick={() => handleDelete(conectividade._id)}
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
            <h2 className="text-3xl font-bold text-white mb-8">{editingConectividade ? 'Editar Conectividade' : 'Nova Conectividade'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder="Nome do equipamento"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IP
                </label>
                <input
                  type="text"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
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
                    <option key={categoria._id} value={categoria._id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
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
                  Serviço
                </label>
                <select
                  value={formData.servico}
                  onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicosDisponiveis.map((servico) => (
                    <option key={servico._id} value={servico._id}>
                      {servico.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modelo
                </label>
                <select
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  required
                >
                  <option value="">Selecione um modelo</option>
                  {modelosDisponiveis.map((modelo) => (
                    <option key={modelo._id} value={modelo._id}>
                      {modelo.nome} - {modelo.marca.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingConectividade(null);
                    setFormData({
                      nome: '',
                      ip: '',
                      categoria: '',
                      tipo: '',
                      servico: '',
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
                  {editingConectividade ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

