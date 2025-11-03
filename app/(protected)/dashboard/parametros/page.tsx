'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Categoria {
  _id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

interface Marca {
  _id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

interface Modelo {
  _id: string;
  nome: string;
  marca: {
    _id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Tipo {
  _id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

interface SistemaOperacional {
  _id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

interface Servico {
  _id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export default function ParametrosPage() {
  const [activeTab, setActiveTab] = useState<'categorias' | 'marcas' | 'modelos' | 'tipos' | 'sistemas' | 'servicos'>('categorias');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [sistemas, setSistemas] = useState<SistemaOperacional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCategorias();
    fetchMarcas();
    fetchModelos();
    fetchTipos();
    fetchSistemas();
    fetchServicos();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchMarcas = async () => {
    try {
      const response = await fetch('/api/marcas');
      if (response.ok) {
        const data = await response.json();
        setMarcas(data.marcas);
      }
    } catch (error) {
      console.error('Error fetching marcas:', error);
    }
  };

  const fetchModelos = async () => {
    try {
      const response = await fetch('/api/modelos');
      if (response.ok) {
        const data = await response.json();
        setModelos(data.modelos);
      }
    } catch (error) {
      console.error('Error fetching modelos:', error);
    }
  };

  const fetchTipos = async () => {
    try {
      const response = await fetch('/api/tipos');
      if (response.ok) {
        const data = await response.json();
        setTipos(data.tipos);
      }
    } catch (error) {
      console.error('Error fetching tipos:', error);
    }
  };

  const fetchSistemas = async () => {
    try {
      const response = await fetch('/api/sistemas-operacionais');
      if (response.ok) {
        const data = await response.json();
        setSistemas(data.sistemas);
      }
    } catch (error) {
      console.error('Error fetching sistemas operacionais:', error);
    }
  };

  const fetchServicos = async () => {
    try {
      const response = await fetch('/api/servicos');
      if (response.ok) {
        const data = await response.json();
        setServicos(data.servicos);
      }
    } catch (error) {
      console.error('Error fetching servicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let url = '';
      let method = 'POST';
      
      if (activeTab === 'categorias') {
        url = '/api/categorias';
      } else if (activeTab === 'marcas') {
        url = '/api/marcas';
      } else if (activeTab === 'modelos') {
        url = '/api/modelos';
      } else if (activeTab === 'tipos') {
        url = '/api/tipos';
      } else if (activeTab === 'sistemas') {
        url = '/api/sistemas-operacionais';
      } else if (activeTab === 'servicos') {
        url = '/api/servicos';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || `Erro ao criar ${activeTab}`);
        return;
      }

      setFormData({ nome: '', marca: '' });
      setShowModal(false);
      
      if (activeTab === 'categorias') {
        fetchCategorias();
      } else if (activeTab === 'marcas') {
        fetchMarcas();
      } else if (activeTab === 'modelos') {
        fetchModelos();
      } else if (activeTab === 'tipos') {
        fetchTipos();
      } else if (activeTab === 'sistemas') {
        fetchSistemas();
      } else if (activeTab === 'servicos') {
        fetchServicos();
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleDelete = async (id: string, type: 'categorias' | 'marcas' | 'modelos' | 'tipos' | 'sistemas' | 'servicos') => {
    let typeName = '';
    if (type === 'categorias') typeName = 'categoria';
    else if (type === 'marcas') typeName = 'marca';
    else if (type === 'modelos') typeName = 'modelo';
    else if (type === 'tipos') typeName = 'tipo';
    else if (type === 'sistemas') typeName = 'sistema operacional';
    else if (type === 'servicos') typeName = 'serviço';
    
    if (!confirm(`Tem certeza que deseja excluir este ${typeName}?`)) {
      return;
    }

    try {
      // Mapear o tipo para a URL correta da API
      let apiPath: string = type;
      if (type === 'sistemas') {
        apiPath = 'sistemas-operacionais';
      }
      
      const response = await fetch(`/api/${apiPath}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (type === 'categorias') {
          fetchCategorias();
        } else if (type === 'marcas') {
          fetchMarcas();
        } else if (type === 'modelos') {
          fetchModelos();
        } else if (type === 'tipos') {
          fetchTipos();
        } else if (type === 'sistemas') {
          fetchSistemas();
        } else if (type === 'servicos') {
          fetchServicos();
        }
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
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
        <h1 className="text-3xl font-bold text-white">Parâmetros</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold px-6 py-3 rounded-lg transition duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo {activeTab === 'categorias' ? 'Categoria' : activeTab === 'marcas' ? 'Marca' : activeTab === 'modelos' ? 'Modelo' : activeTab === 'tipos' ? 'Tipo' : activeTab === 'sistemas' ? 'Sistema Operacional' : 'Serviço'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => {
            setActiveTab('categorias');
            setShowModal(false);
            setFormData({ nome: '', marca: '' });
          }}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'categorias'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Categorias
        </button>
        <button
          onClick={() => {
            setActiveTab('marcas');
            setShowModal(false);
            setFormData({ nome: '', marca: '' });
          }}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'marcas'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Marcas
        </button>
        <button
          onClick={() => {
            setActiveTab('modelos');
            setShowModal(false);
            setFormData({ nome: '', marca: '' });
          }}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'modelos'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Modelos
        </button>
        <button
          onClick={() => {
            setActiveTab('tipos');
            setShowModal(false);
            setFormData({ nome: '', marca: '' });
          }}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'tipos'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tipos
        </button>
        <button
          onClick={() => {
            setActiveTab('sistemas');
            setShowModal(false);
            setFormData({ nome: '', marca: '' });
          }}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'sistemas'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sistema Operacional
        </button>
        <button
          onClick={() => {
            setActiveTab('servicos');
            setShowModal(false);
            setFormData({ nome: '', marca: '' });
          }}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'servicos'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Serviços
        </button>
      </div>

      {/* Categorias Table */}
      {activeTab === 'categorias' && (
        <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Atualizado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#282c34] divide-y divide-gray-600">
              {categorias.map((categoria) => (
                <tr key={categoria._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{categoria.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(categoria.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(categoria.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(categoria._id, 'categorias')}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Marcas Table */}
      {activeTab === 'marcas' && (
        <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Atualizado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#282c34] divide-y divide-gray-600">
              {marcas.map((marca) => (
                <tr key={marca._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{marca.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(marca.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(marca.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(marca._id, 'marcas')}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modelos Table */}
      {activeTab === 'modelos' && (
        <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Atualizado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#282c34] divide-y divide-gray-600">
              {modelos.map((modelo) => (
                <tr key={modelo._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{modelo.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{modelo.marca.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(modelo.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(modelo.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(modelo._id, 'modelos')}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tipos Table */}
      {activeTab === 'tipos' && (
        <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Atualizado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#282c34] divide-y divide-gray-600">
              {tipos.map((tipo) => (
                <tr key={tipo._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{tipo.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(tipo.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(tipo.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(tipo._id, 'tipos')}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sistemas Operacionais Table */}
      {activeTab === 'sistemas' && (
        <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Atualizado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#282c34] divide-y divide-gray-600">
              {sistemas.map((sistema) => (
                <tr key={sistema._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{sistema.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(sistema.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(sistema.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(sistema._id, 'sistemas')}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Serviços Table */}
      {activeTab === 'servicos' && (
        <div className="bg-[#282c34] rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Atualizado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#282c34] divide-y divide-gray-600">
              {servicos.map((servico) => (
                <tr key={servico._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{servico.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(servico.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(servico.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(servico._id, 'servicos')}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#282c34]/98 backdrop-blur-xl rounded-lg shadow-md p-8 max-w-2xl w-full mx-4 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-white mb-8">
              Novo {activeTab === 'categorias' ? 'Categoria' : activeTab === 'marcas' ? 'Marca' : activeTab === 'modelos' ? 'Modelo' : activeTab === 'tipos' ? 'Tipo' : activeTab === 'sistemas' ? 'Sistema Operacional' : 'Serviço'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {activeTab === 'categorias' ? 'Nome da Categoria' : activeTab === 'marcas' ? 'Nome da Marca' : activeTab === 'modelos' ? 'Nome do Modelo' : activeTab === 'tipos' ? 'Nome do Tipo' : activeTab === 'sistemas' ? 'Nome do Sistema Operacional' : 'Nome do Serviço'}
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  placeholder={activeTab === 'categorias' ? 'Ex: NVR, Switch, Servidores' : activeTab === 'marcas' ? 'Ex: Dell, HP, Lenovo' : activeTab === 'modelos' ? 'Ex: Inspiron, ProBook' : activeTab === 'tipos' ? 'Ex: Laser, Inkjet, Multifuncional' : activeTab === 'sistemas' ? 'Ex: Windows 11 Pro, Windows 10' : 'Ex: Backup, Monitoramento, Firewall'}
                  required
                />
              </div>

              {activeTab === 'modelos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Marca
                  </label>
                  <select
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#363f4a] text-white focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma marca</option>
                    {marcas.map((marca) => (
                      <option key={marca._id} value={marca._id}>
                        {marca.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ nome: '', marca: '' });
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
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
