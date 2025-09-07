import { Dice5, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useRaffle } from '../contexts/RaffleContext';

export const AdminRafflesView: React.FC = () => {
  const {
    raffles,
    updateRaffle,
    deleteRaffle,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    refreshRaffles
  } = useRaffle();
  const [deleteModal, setDeleteModal] = useState<{ id: string, title: string } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const navigate = useNavigate();


  const handleEdit = (id: string) => {
    navigate(`/admin/raffles/edit/${id}`);
  };

  const handleAdminDetail = (id: string) => {
    navigate(`/admin/raffles/detail/${id}`);
  };

  const handleToggle = async (raffle: any) => {
    await updateRaffle(raffle.id, { isActive: !raffle.isActive });
  };

  const truncateChars = (text: string, maxChars: number) => {
    if (!text) return '';
    const t = text.trim();
    if (t.length <= maxChars) return t;
    return t.slice(0, maxChars).trimEnd() + '…';
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Raffles Admin</h1>
      {/* Filtros y ordenamiento */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-1 items-end">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          placeholder="Buscar por título o descripción..."
          value={filters.search || ''}
          onChange={e => {
            setFilters({ ...filters, search: e.target.value });
            setPage(1);
          }}
        />
        <select
          className="w-[200px] px-3 py-2 border rounded focus:outline-none focus:ring"
          value={filters.status || ''}
          onChange={e => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </select>
        <select
          className="w-[44px] h-10 px-2 py-1 border rounded focus:outline-none focus:ring text-xs"
          value={filters.order || 'desc'}
          onChange={e => {
            setFilters({ ...filters, order: e.target.value as 'asc' | 'desc' | undefined });
            setPage(1);
          }}
          aria-label="Ordenar"
        >
          <option value="desc">↓</option>
          <option value="asc">↑</option>
        </select>
        <Button
          className="md:col-span-1 w-auto min-w-[90px] px-3"
          variant="outline"
          onClick={() => refreshRaffles()}
        >
          Buscar
        </Button>
        <Button onClick={() => navigate('/admin/raffles/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Bono Contribución
        </Button>
      </div>
      {/* Responsive table/cards */}
      <div className="overflow-x-auto">
        {/* Desktop table */}
        <div className="hidden md:block min-w-[900px]">
          {/* Encabezado */}
          <div className="grid grid-cols-[1.7fr_0.7fr_0.3fr_0.3fr_1.5fr_0.5fr_0.5fr] gap-1 bg-gray-100 rounded-t-lg px-2 py-2 text-xs font-semibold text-gray-700">
            <div>Bono Contribución</div>
            <div>Fecha sorteo</div>
            <div>Tickets</div>
            <div>Estado</div>
            <div>Premios</div>
            <div>Precios</div>
            <div className="text-right pr-2">Acciones</div>
          </div>
          {/* Filas */}
          {raffles.map(raffle => (
            <div key={raffle.id} className="grid grid-cols-[1.7fr_0.7fr_0.3fr_0.3fr_1.5fr_0.5fr_0.5fr] gap-1 border-b px-2 py-2 items-center text-sm bg-white hover:bg-gray-50 transition-all">
              <div>
                <div className="font-semibold text-gray-900">{raffle.title}</div>
                {raffle.description && (
                  <div className="text-xs text-gray-500 mt-0.5">{truncateChars(raffle.description, 120)}</div>
                )}
              </div>
              <div className="text-xs text-gray-700">{new Date(raffle.drawDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div className="font-semibold text-blue-900">{raffle.soldTickets?.toLocaleString('es-AR')} / <span className="text-green-900">{raffle.maxTickets?.toLocaleString('es-AR')}</span></div>
              <div className="flex flex-col items-start gap-1">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${raffle.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{raffle.isActive ? 'Activa' : 'Inactiva'}</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={raffle.isActive}
                    onChange={() => handleToggle(raffle)}
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-400 transition-all relative">
                    <div className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white shadow transition-all ${raffle.isActive ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
              <div className="text-xs text-gray-700 pl-2">
                {raffle.prizes?.length > 0 ? (
                  <ol className="list-decimal ml-4">
                    {raffle.prizes.slice(0, 3).map((p, i) => <li key={i}>{p.name}</li>)}
                    {raffle.prizes.length > 3 && (
                      <b>+{raffle.prizes.length - 3} premios más</b>
                    )}
                  </ol>
                ) : 'Sin premios'}
              </div>
              <div className="text-xs text-gray-700 text-left flex flex-row items-end justify-end">
                {raffle.priceTiers?.length > 0 ? (
                  <ul className="list-disc ml-4">
                    {raffle.priceTiers.map((t, i) => <li key={i}>{t.ticketCount} x ${t.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</li>)}
                  </ul>
                ) : 'Sin precios'}
              </div>
              <div className="flex gap-2 items-center justify-end pr-2">
                <button
                  title="Editar"
                  className="p-1 rounded hover:bg-indigo-100"
                  onClick={() => handleEdit(raffle.id)}
                >
                  <Pencil className="w-5 h-5 text-indigo-600" />
                </button>
                <button
                  title="Administrar Detalle"
                  className="p-1 rounded hover:bg-green-100"
                  onClick={() => handleAdminDetail(raffle.id)}
                >
                  <Dice5 className="w-5 h-5 text-green-600" />
                </button>
                <a
                  href={`/raffle/view/${raffle.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver detalle"
                  className="p-1 rounded hover:bg-blue-100"
                >
                  <Eye className="w-5 h-5 text-blue-600" />
                </a>
                <button
                  title="Eliminar"
                  className="p-1 rounded hover:bg-red-100"
                  onClick={() => setDeleteModal({ id: raffle.id, title: raffle.title })}
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
          {raffles.length === 0 && (
            <div className="text-center py-16 col-span-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay rifas registradas
              </h3>
              <p className="text-gray-600">
                Las rifas aparecerán aquí cuando sean creadas.
              </p>
            </div>
          )}
        </div>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {raffles.map(raffle => (
            <div key={raffle.id} className="bg-white rounded-lg shadow border p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900 text-base">{raffle.title}</div>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${raffle.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{raffle.isActive ? 'Activa' : 'Inactiva'}</span>
              </div>
              {raffle.description && (
                <div className="text-xs text-gray-500 mb-1">{truncateChars(raffle.description, 120)}</div>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                <div><span className="font-semibold">Fecha:</span> {new Date(raffle.drawDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div><span className="font-semibold">Tickets:</span> {raffle.soldTickets?.toLocaleString('es-AR')} / {raffle.maxTickets?.toLocaleString('es-AR')}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                {raffle.prizes?.length > 0 && (
                  <div>
                    <span className="font-semibold">Premios:</span> {
                      raffle.prizes.length <= 3
                        ? raffle.prizes.map((p) => p.name).join(', ')
                        : `${raffle.prizes.slice(0, 3).map((p) => p.name).join(', ')} +${raffle.prizes.length - 3} más`
                    }
                  </div>
                )}
                {raffle.priceTiers?.length > 0 && <div><span className="font-semibold">Precios:</span> {raffle.priceTiers.map((t) => `${t.ticketCount} x $${t.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`).join(', ')}</div>}
              </div>
              <div className="flex gap-2 items-center justify-end mt-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={raffle.isActive}
                    onChange={() => handleToggle(raffle)}
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-400 transition-all relative">
                    <div className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white shadow transition-all ${raffle.isActive ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>
                <button
                  title="Editar"
                  className="p-1 rounded hover:bg-indigo-100"
                  onClick={() => handleEdit(raffle.id)}
                >
                  <Pencil className="w-5 h-5 text-indigo-600" />
                </button>
                <a
                  href={`/raffle/view/${raffle.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver detalle"
                  className="p-1 rounded hover:bg-blue-100"
                >
                  <Eye className="w-5 h-5 text-blue-600" />
                </a>
                <button
                  title="Eliminar"
                  className="p-1 rounded hover:bg-red-100"
                  onClick={() => setDeleteModal({ id: raffle.id, title: raffle.title })}
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
          {raffles.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay Bonos de Contribución registrados
              </h3>
              <p className="text-gray-600">
                Los Bonos de Contribución aparecerán aquí cuando sean creados.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Paginación */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Tamaño de página:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 15, 20, 30, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >Anterior</button>
          <span className="text-sm">Página {page}</span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
          // Aquí deberías calcular el total de páginas si tienes ese dato
          >Siguiente</button>
        </div>
      </div>
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar rifa" size="sm">
        <div className="py-4 text-center">
          <div className="mb-4 text-3xl text-red-600">🗑️</div>
          <div className="text-lg font-medium mb-2">¿Seguro que deseas eliminar el bono de contribución "{deleteModal?.title}"?</div>
          <div className="text-sm text-gray-600 mb-4">Esta acción eliminará todas las compras, premios, precios y números asociados.</div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (deleteModal) {
                  const ok = await deleteRaffle(deleteModal.id);
                  setDeleteModal(null);
                  setFeedback(ok ? 'Bono de contribución eliminado correctamente.' : 'Error al eliminar el bono de contribución.');
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!feedback} onClose={() => setFeedback(null)} title="Resultado" size="sm">
        <div className="py-4 text-center">
          <div className={`mb-4 text-3xl ${feedback === 'Bono de contribución eliminado correctamente.' ? 'text-green-600' : 'text-red-600'}`}>{feedback === 'Bono de contribución eliminado correctamente.' ? '✔️' : '❌'}</div>
          <div className="text-lg font-medium mb-2">{feedback}</div>
          <Button className="mt-2 w-full" onClick={() => setFeedback(null)}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};
