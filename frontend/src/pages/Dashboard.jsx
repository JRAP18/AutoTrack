
import { useEffect, useState } from 'react';
import {
  Users,
  Car,
  Wrench,
  ClipboardList,
  Wallet,
  RefreshCw,
} from 'lucide-react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import api from '../api/axios';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value || 0));
};

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/reports/dashboard');

      setDashboard(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = [
    {
      title: 'Total Customers',
      value: dashboard?.totalCustomers ?? 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Vehicles',
      value: dashboard?.totalVehicles ?? 0,
      icon: Car,
      color: 'purple',
    },
    {
      title: 'Service Types',
      value: dashboard?.totalServiceTypes ?? 0,
      icon: Wrench,
      color: 'cyan',
    },
    {
      title: 'Service Records',
      value: dashboard?.totalServiceRecords ?? 0,
      icon: ClipboardList,
      color: 'orange',
    },
    {
      title: 'Completed Service Value',
      value: formatCurrency(
        dashboard?.totalCompletedServiceValue
      ),
      icon: Wallet,
      color: 'green',
    },
  ];

  const statusData = [
    {
      name: 'Completed',
      value: dashboard?.serviceStatus?.completed ?? 0,
      color: '#16a34a',
    },
    {
      name: 'In Progress',
      value: dashboard?.serviceStatus?.inProgress ?? 0,
      color: '#2563eb',
    },
    {
      name: 'Pending',
      value: dashboard?.serviceStatus?.pending ?? 0,
      color: '#eab308',
    },
    {
      name: 'Cancelled',
      value: dashboard?.serviceStatus?.cancelled ?? 0,
      color: '#ef4444',
    },
  ];

  const totalServices = statusData.reduce(
    (total, item) => total + item.value,
    0
  );

  const recentRecords = dashboard?.recentRecords || [];

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div className="page-heading">
          <h1>Dashboard</h1>
          <p>
            Welcome back, {user.fullName || 'Staff'}!
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="content-card">
          <p>Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : (
        <>
          {/* STATISTIC CARDS */}

          <div className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  className="stat-card"
                  key={stat.title}
                >
                  <div
                    className={`stat-icon ${stat.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <div className="stat-info">
                    <p>{stat.title}</p>
                    <h2>{stat.value}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SERVICE STATUS CHART */}

          <div className="content-card dashboard-section">
            <h2>Service Status Overview</h2>

            <p>
              Distribution of all service records.
            </p>

            <div className="status-overview">
              <div className="chart-container">
                {totalServices > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <PieChart>
                      <Pie
                        data={statusData.filter(
                          (item) => item.value > 0
                        )}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {statusData
                          .filter((item) => item.value > 0)
                          .map((item) => (
                            <Cell
                              key={item.name}
                              fill={item.color}
                            />
                          ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">
                    No service records yet.
                  </div>
                )}
              </div>

              <div className="status-legend">
                {statusData.map((item) => (
                  <div
                    className="legend-item"
                    key={item.name}
                  >
                    <span
                      className="legend-color"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span>{item.name}</span>

                    <strong>{item.value}</strong>
                  </div>
                ))}

                <div className="legend-total">
                  <span>Total Services</span>
                  <strong>{totalServices}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT SERVICE RECORDS */}

          <div className="content-card dashboard-section">
            <h2>Recent Service Records</h2>

            <p>Latest five service records.</p>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Vehicle</th>
                    <th>Plate Number</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Cost</th>
                  </tr>
                </thead>

                <tbody>
                  {recentRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="empty-table"
                      >
                        No service records found.
                      </td>
                    </tr>
                  ) : (
                    recentRecords.map((record) => (
                      <tr key={record.serviceRecordId}>
                        <td>
                          #{record.serviceRecordId}
                        </td>

                        <td>
                          {record.vehicle
                            ? `${record.vehicle.brand} ${record.vehicle.model}`
                            : 'N/A'}
                        </td>

                        <td>
                          {record.vehicle?.plateNumber ||
                            'N/A'}
                        </td>

                        <td>
                          {record.serviceType?.serviceName ||
                            'N/A'}
                        </td>

                        <td>{record.serviceDate}</td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status}
                          </span>
                        </td>

                        <td>
                          {formatCurrency(record.cost)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
