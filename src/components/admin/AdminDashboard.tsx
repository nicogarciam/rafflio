import { BarChart3, Calendar, DollarSign, Gift, Plus, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRaffle } from '../../contexts/RaffleContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export const AdminDashboard: React.FC = () => {
  const { raffles, purchases } = useRaffle();
  const navigate = useNavigate();

  // Calculate statistics
  const totalRaffles = raffles.length;
  const activeRaffles = raffles.filter(r => r.isActive).length;
  const totalRevenue = purchases
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => {
      const raffle = raffles.find(r => r.id === p.raffleId);
      const tier = raffle?.priceTiers.find(t => t.id === p.priceTierId);
      return sum + (tier?.amount || 0);
    }, 0);
  const totalSales = purchases.filter(p => p.status === 'paid').length;
  const totalTicketsSold = raffles.reduce((sum, r) => sum + r.soldTickets, 0);
  const totalTicketsAvailable = raffles.reduce((sum, r) => sum + r.maxTickets, 0);

  const recentPurchases = purchases
    .filter(p => p.status === 'paid')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona tus bonos de contribución y monitorea las contribuciones</p>
        </div>

        <Button onClick={() => navigate('/admin/raffles/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Bono Contribución
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Bonos Contribución Totales</p>
              <p className="text-2xl font-bold text-gray-900">{totalRaffles}</p>
              <p className="text-xs text-green-600">{activeRaffles} activas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600">+12% este mes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
              <p className="text-xs text-green-600">Contribuciones exitosas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Números Vendidos</p>
              <p className="text-2xl font-bold text-gray-900">{totalTicketsSold.toLocaleString()}</p>
              <p className="text-xs text-gray-500">de {totalTicketsAvailable.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Raffles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Bonos Contribución Activos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {raffles.filter(r => r.isActive).map(raffle => {
                const soldPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;
                return (
                  <div key={raffle.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        <a
                          href={`/raffle/view/${raffle.id}`}
                          rel="noopener noreferrer"
                          title="Ver detalle"
                          className="p-1 rounded hover:bg-blue-100"
                        >
                          {raffle.title}
                        </a></h4>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(raffle.drawDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progreso de ventas</span>
                        <span className="font-medium">{soldPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{raffle.soldTickets.toLocaleString()} vendidos</span>
                        <span>{raffle.maxTickets.toLocaleString()} total</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {raffles.filter(r => r.isActive).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay Bonos activos</p>
                  <Button
                    onClick={() => navigate('/admin/raffles/new')}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Crear Bono Contribución
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Contribuciones Recientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPurchases.map(purchase => {
                const raffle = raffles.find(r => r.id === purchase.raffleId);
                const tier = raffle?.priceTiers.find(t => t.id === purchase.priceTierId);

                return (
                  <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{purchase.fullName}</p>
                      <p className="text-sm text-gray-600">{raffle?.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${tier?.amount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tier?.ticketCount} números
                      </p>
                    </div>
                  </div>
                );
              })}

              {recentPurchases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay compras recientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};