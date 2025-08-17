import React, { useState, useEffect } from 'react';
import { useRaffle } from '../contexts/RaffleContext';
import { Modal } from '../components/ui/Modal';
import { TrashIcon } from '../components/ui/TrashIcon';
import { Button } from '../components/ui/Button';
import { purchaseService } from '../services/purchase.service';
import { ShoppingCart } from 'lucide-react';
import { config } from '../lib/config';
import { Info, Edit2, Mail, Link as LinkIcon, SortDesc, SortAsc } from 'lucide-react';
import { sendPurchaseLinkEmail } from '../services/email.service';


export const PurchasesView: React.FC = () => {



  const {
    purchases,
    raffles,
    totalPurchases,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    setFilters,
    refreshPurchases
  } = useRaffle();

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<string | null>(null);
  const [editPurchase, setEditPurchase] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'paid' | 'failed' | 'cancelled' | 'confirmed'>('pending');
  const [editPaymentMethod, setEditPaymentMethod] = useState<"" | "mercadopago" | "bank_transfer" | "cash" | undefined>('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ purchase: any } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  // Refrescar compras al montar la vista
  useEffect(() => {
    refreshPurchases();
  }, []);

  // Función para copiar el enlace de selección de tickets
  const handleCopyLink = (purchaseId: string) => {
    const url = `${config.app.baseUrl}/select-tickets/${purchaseId}`;
    navigator.clipboard.writeText(url);
    setFeedbackModal({ message: 'Enlace copiado al portapapeles', type: 'success' });
  };

  // Función para enviar el enlace por mail
  const handleSendLinkEmail = async (to: string, purchaseId: string) => {
    try {
      await sendPurchaseLinkEmail(to, purchaseId);
      setFeedbackModal({ message: 'Enlace enviado por email', type: 'success' });
    } catch (err) {
      setFeedbackModal({ message: 'No se pudo enviar el email', type: 'error' });
    }
  };

  const fetchPaymentInfo = async (paymentId: string) => {
    try {
      setLoadingInfo(paymentId);
      const res = await fetch(`${config.app.apiUrl}/payment/payment-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      if (!res.ok) throw new Error('Error fetching payment info');
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error fetching payment info:', err);
      alert('Error al obtener información de pago');
    } finally {
      setLoadingInfo(null);
    }
  };

  const handleDeletePurchase = async (purchase: any) => {
    setDeleteLoadingId(purchase.id);
    try {
      // Liberar los tickets asociados
      let numerosLiberados = '';
      if (purchase.tickets && purchase.tickets.length > 0) {
        const ticketIds = purchase.tickets.map((t: any) => t.id);
        numerosLiberados = purchase.tickets.map((t: any) => t.number).join(', ');
        await purchaseService.assignTicketsToPurchase(null, ticketIds); // null para liberar
      }
      // Eliminar la compra
      await purchaseService.deletePurchase(purchase.id);
      await refreshPurchases();
      setFeedbackModal({
        message: `Compra eliminada correctamente. Los números seleccionados (${numerosLiberados || 'ninguno'}) han sido liberados y están disponibles para otros usuarios.`,
        type: 'success'
      });
    } catch (err) {
      setFeedbackModal({ message: 'Error al eliminar la compra. Intenta nuevamente.', type: 'error' });
    } finally {
      setDeleteLoadingId(null);
      setDeleteModal(null);
    }
  };

  const onSubmitEditPurchase = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setEditLoading(true);
    // Actualizar en base de datos
    await purchaseService.updatePurchaseStatusAndPaymentMethod(
      editPurchase.id,
      editStatus,
      editPaymentMethod
    );
    // Si el estado cambió a 'paid', enviar email de confirmación y selección de números
    if (editStatus === 'paid' && editPurchase.status !== 'paid') {
      try {

        await sendPurchaseLinkEmail(editPurchase.email, editPurchase.id);
        setFeedbackModal({ message: 'Email de confirmación enviado al comprador.', type: 'success' });
      } catch (err) {
        setFeedbackModal({ message: 'No se pudo enviar el email de confirmación.', type: 'error' });
      }
    }
    editPurchase.status = editStatus;
    editPurchase.paymentMethod = editPaymentMethod;
    setEditPurchase(null);
    setEditLoading(false);
    // Ideal: recargar compras o actualizar el estado global
  };

  // El backend ya filtra y ordena, solo usamos purchases
  const filteredPurchases = purchases;

  return (
    <div className="space-y-6">
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar compra" size="sm">
        <div className="py-4 text-center">
          <div className="mb-4 text-3xl text-red-600">🗑️</div>
          <div className="text-lg font-medium mb-2">¿Seguro que deseas eliminar esta compra?</div>
          <div className="text-sm text-gray-600 mb-4">Esta acción no se puede deshacer.</div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setDeleteModal(null)} disabled={deleteLoadingId === deleteModal?.purchase.id}>Cancelar</Button>
            <Button
              variant="danger"
              loading={deleteLoadingId === deleteModal?.purchase.id}
              onClick={() => handleDeletePurchase(deleteModal?.purchase)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!feedbackModal} onClose={() => setFeedbackModal(null)} title={feedbackModal?.type === 'success' ? '¡Éxito!' : 'Error'} size="sm">
        <div className="py-4 text-center">
          <div className={`mb-4 text-3xl ${feedbackModal?.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{feedbackModal?.type === 'success' ? '✔️' : '❌'}</div>
          <div className="text-lg font-medium mb-2">{feedbackModal?.message}</div>
          <Button className="mt-2 w-full" onClick={() => setFeedbackModal(null)}>
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* Modal de edición */}
      <Modal isOpen={!!editPurchase} onClose={() => setEditPurchase(null)} title="Editar Venta" size="md">
        {editPurchase && (
          <form
            onSubmit={onSubmitEditPurchase}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as 'pending' | 'paid' | 'failed' | 'cancelled' | 'confirmed')}
                required
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="confirmed">Confirmado</option>
                <option value="failed">Fallido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Forma de pago</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={editPaymentMethod}
                onChange={e => setEditPaymentMethod(e.target.value as "" | "mercadopago" | "bank_transfer" | "cash" | undefined)}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="bank_transfer">Transferencia</option>
                <option value="mercadopago">MercadoPago</option>
                <option value="cash">Efectivo</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditPurchase(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={editLoading}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        )}
      </Modal>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestión de Compras
        </h1>
        <p className="text-gray-600">
          Monitorea todas las compras y selecciones de números
        </p>
      </div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-1 items-end">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          placeholder="Buscar por rifa, nombre o Preference ID..."
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
          <option value="pending">Pendiente</option>
          <option value="paid">Pagado</option>
          <option value="failed">Fallido</option>
          <option value="confirmed">Confirmado</option>
        </select>
        <select
          className="w-[200px] px-3 py-2 border rounded focus:outline-none focus:ring"
          value={filters.raffleId || ''}
          onChange={e => {
            setFilters({ ...filters, raffleId: e.target.value });
            setPage(1);
          }}
        >
          <option value="">Todas las rifas</option>
          {raffles.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <select
            className="w-[44px] h-10 px-2 py-1 border rounded focus:outline-none focus:ring text-xs"
            value={filters.order || 'desc'}
            onChange={e => {
              setFilters({ ...filters, order: e.target.value as 'asc' | 'desc' });
              setPage(1);
            }}
            aria-label="Ordenar"
          >
            <option value="desc">↓</option>
            <option value="asc">↑</option>
          </select>
          {filters.order === 'asc' ? (
            <SortAsc className="w-4 h-4 text-gray-500" />
          ) : (
            <SortDesc className="w-4 h-4 text-gray-500" />
          )}
        </div>
        {/* Botón de refrescar */}
        <Button
          className="md:col-span-1 w-auto min-w-[90px] px-3"
          variant="outline"
          onClick={() => refreshPurchases()}
        >
          Buscar
        </Button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[1.5fr_1.5fr_2fr_0.5fr] gap-2 bg-gray-100 rounded-t-lg px-4 py-2 text-xs font-semibold text-gray-700">
            <div>Comprador</div>
            <div>Rifa y Paquete</div>
            <div>Estado y Números</div>
            <div className="text-right pr-2">Acciones</div>
          </div>
          {filteredPurchases.map(purchase => {
            const raffle = raffles.find(r => r.id === purchase.raffleId);
            const tier = raffle?.priceTiers.find(t => t.id === purchase.priceTierId);
            return (
              <div key={purchase.id} className="grid grid-cols-[1.5fr_1.5fr_2fr_0.5fr] gap-2 border-b px-4 py-3 items-center text-sm bg-white hover:bg-gray-50 transition-all">
                {/* Columna 1: Comprador */}
                <div>
                  <div className="font-semibold text-gray-900">{purchase.fullName}</div>
                  <div className="text-xs text-gray-600">{purchase.email}</div>
                  <div className="text-xs text-gray-400">{new Date(purchase.createdAt).toLocaleDateString()}</div>
                </div>
                {/* Columna 2: Rifa y Paquete */}
                <div>
                  <div className="font-medium text-gray-900">{raffle?.title}</div>
                  <div className="text-xs text-gray-600">{tier?.ticketCount} números - ${tier?.amount?.toFixed(2)}</div>
                  {/* Mostrar Preference ID solo para mercadopago */}
                  {purchase.paymentMethod === 'mercadopago' && (
                    <div className="text-xs text-gray-500">Preference ID: {purchase.preferenceId || 'N/A'}</div>
                  )}
                  <div className="text-xs text-gray-500">Método: {purchase.paymentMethod === 'mercadopago' ? 'MercadoPago' : purchase.paymentMethod === 'bank_transfer' ? 'Transferencia' : purchase.paymentMethod === 'cash' ? 'Efectivo' : 'N/A'}</div>
                </div>
                {/* Columna 3: Estado y Números */}
                <div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${purchase.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : purchase.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : purchase.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {purchase.status === 'paid' ? 'Pagado' :
                      purchase.status === 'pending' ? 'Pendiente' :
                        purchase.status === 'confirmed' ? 'Confirmado' : 'Fallido'}
                  </div>
                  {purchase.tickets.length > 0 && (
                    <div className="text-xs text-blue-600">
                      Nros: {purchase.tickets.map((t: { number: any; }) => t.number).join(', ')}
                    </div>
                  )}
                  {/* Mostrar Payment ID solo para mercadopago */}
                  {purchase.paymentMethod === 'mercadopago' && (
                    <div className="text-xs text-gray-500">Payment ID: {purchase.paymentId || 'N/A'}</div>
                  )}
                </div>
                {/* Columna 4: Acciones */}
                <div className="flex gap-2 items-center justify-end pr-2">
                  {/* Copiar enlace de selección de tickets */}
                  <button
                    title="Copiar enlace de selección"
                    className="p-1 rounded hover:bg-gray-100"
                    onClick={() => handleCopyLink(purchase.id)}
                  >
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  {/* Enviar enlace por email */}
                  <button
                    title="Enviar enlace por email"
                    className="p-1 rounded hover:bg-green-100"
                    onClick={() => handleSendLinkEmail(purchase.email, purchase.id)}
                  >
                    <Mail className="w-5 h-5 text-green-600" />
                  </button>


                  {purchase.paymentMethod === 'mercadopago' && (
                    <button
                      title="Ver info de pago"
                      className="p-1 rounded hover:bg-blue-100"
                      disabled={!purchase.paymentId || loadingInfo === purchase.paymentId}
                      onClick={() => purchase.paymentId && fetchPaymentInfo(purchase.paymentId)}
                    >
                      <Info className="w-5 h-5 text-blue-600" />
                    </button>
                  )}
                  <button
                    title="Editar"
                    className="p-1 rounded hover:bg-indigo-100"
                    onClick={() => {
                      setEditPurchase(purchase);
                      setEditStatus(purchase.status);
                      setEditPaymentMethod(purchase.paymentMethod || '');
                    }}
                  >
                    <Edit2 className="w-5 h-5 text-indigo-600" />
                  </button>
                  <button
                    title="Eliminar"
                    className="p-1 rounded hover:bg-red-100"
                    disabled={deleteLoadingId === purchase.id}
                    onClick={() => setDeleteModal({ purchase })}
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredPurchases.length === 0 && (
            <div className="text-center py-16 col-span-4">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay compras registradas
              </h3>
              <p className="text-gray-600">
                Las compras aparecerán aquí cuando los usuarios participen en las rifas.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Controles de paginación y tamaño de página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">Tamaño de página:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1); // Volver a la primera página al cambiar tamaño
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
          <span className="text-sm">Página {page} de {Math.max(1, Math.ceil(totalPurchases / pageSize))}</span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(totalPurchases / pageSize)}
          >Siguiente</button>
        </div>
        <div className="text-xs text-gray-500">Total: {totalPurchases} compras</div>
      </div>


    </div>
  );
};

export default PurchasesView;