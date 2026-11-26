
import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  RefreshCw,
  Clock,
  Wrench,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';
import api from '../api/axios';

const statuses = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
];

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const emptyForm = () => ({
  vehicleId: '',
  serviceTypeId: '',
  serviceDate: getToday(),
  description: '',
  status: 'Pending',
  cost: '',
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value));
};

const formatDate = (value) => {
  if (!value) return '—';

  return new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  ).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusClass = (status) => {
  return status.toLowerCase().replace(/\s+/g, '-');
};

function ServiceRecords() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const getErrorMessage = (err, fallback) => {
    const message = err.response?.data?.message;

    return Array.isArray(message)
      ? message.join(', ')
      : message || fallback;
  };

  // LOAD ALL REQUIRED DATA

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        recordResponse,
        vehicleResponse,
        serviceResponse,
      ] = await Promise.all([
        api.get('/service-records'),
        api.get('/vehicles'),
        api.get('/service-types'),
      ]);

      setRecords(recordResponse.data);
      setVehicles(vehicleResponse.data);
      setServiceTypes(serviceResponse.data);
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to load service records.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // GET CUSTOMER NAME

  const getCustomerName = (vehicle) => {
    const customer = vehicle?.customer;

    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : 'Unknown Customer';
  };

  const selectedVehicle = vehicles.find(
    (vehicle) =>
      String(vehicle.vehicleId) === form.vehicleId
  );

  const selectedService = serviceTypes.find(
    (service) =>
      String(service.serviceTypeId) === form.serviceTypeId
  );

  // STATUS SUMMARY

  const statusSummary = [
    {
      label: 'Pending',
      count: records.filter(
        (record) => record.status === 'Pending'
      ).length,
      icon: Clock,
      color: 'pending',
    },
    {
      label: 'In Progress',
      count: records.filter(
        (record) => record.status === 'In Progress'
      ).length,
      icon: Wrench,
      color: 'in-progress',
    },
    {
      label: 'Completed',
      count: records.filter(
        (record) => record.status === 'Completed'
      ).length,
      icon: CheckCircle,
      color: 'completed',
    },
    {
      label: 'Cancelled',
      count: records.filter(
        (record) => record.status === 'Cancelled'
      ).length,
      icon: XCircle,
      color: 'cancelled',
    },
  ];

  // SEARCH AND FILTER

  const filteredRecords = records.filter((record) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch = [
      record.serviceRecordId,
      record.vehicle?.plateNumber,
      record.vehicle?.brand,
      record.vehicle?.model,
      `${record.vehicle?.brand || ''} ${record.vehicle?.model || ''}`,
      getCustomerName(record.vehicle),
      record.serviceType?.serviceName,
      record.description,
      record.status,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(keyword)
    );

    const matchesStatus =
      !statusFilter || record.status === statusFilter;

    const matchesVehicle =
      !vehicleFilter ||
      String(record.vehicleId) === vehicleFilter;

    const matchesDate =
      !dateFilter ||
      String(record.serviceDate).slice(0, 10) === dateFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesVehicle &&
      matchesDate
    );
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setVehicleFilter('');
    setDateFilter('');
  };

  // ADD RECORD

  const openAddModal = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  // EDIT RECORD

  const openEditModal = (record) => {
    setEditingRecord(record);

    setForm({
      vehicleId: String(record.vehicleId),
      serviceTypeId: String(record.serviceTypeId),
      serviceDate: String(record.serviceDate).slice(0, 10),
      description: record.description,
      status: record.status,
      cost: String(record.cost),
    });

    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingRecord(null);
    setForm(emptyForm());
    setFormError('');
  };

  // FORM INPUT AND AUTOMATIC COST

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'serviceTypeId') {
      const service = serviceTypes.find(
        (item) => String(item.serviceTypeId) === value
      );

      setForm((previous) => ({
        ...previous,
        serviceTypeId: value,
        cost: service
          ? Number(service.basePrice).toFixed(2)
          : '',
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SAVE RECORD

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError('');
    setSuccess('');

    const payload = {
      vehicleId: Number(form.vehicleId),
      serviceTypeId: Number(form.serviceTypeId),
      serviceDate: form.serviceDate,
      description: form.description.trim(),
      status: form.status,
      cost: Number(form.cost),
    };

    if (
      !payload.vehicleId ||
      !payload.serviceTypeId ||
      !payload.serviceDate ||
      !payload.description ||
      form.cost.trim() === ''
    ) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (
      !Number.isFinite(payload.cost) ||
      payload.cost < 0 ||
      payload.cost > 99999999.99
    ) {
      setFormError(
        'Service cost must be between 0 and 99,999,999.99.'
      );
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(form.cost.trim())) {
      setFormError(
        'Service cost must have a maximum of two decimal places.'
      );
      return;
    }

    try {
      setSaving(true);

      if (editingRecord) {
        await api.put(
          `/service-records/${editingRecord.serviceRecordId}`,
          payload
        );

        setSuccess('Service record updated successfully.');
      } else {
        await api.post('/service-records', payload);

        setSuccess('Service record added successfully.');
      }

      setShowModal(false);
      setEditingRecord(null);
      setForm(emptyForm());

      await fetchData();
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Failed to save service record.')
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE RECORD

  const handleDelete = async () => {
    if (!deleteRecord) return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      await api.delete(
        `/service-records/${deleteRecord.serviceRecordId}`
      );

      setSuccess('Service record deleted successfully.');
      setDeleteRecord(null);

      await fetchData();
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to delete service record.')
      );

      setDeleteRecord(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="management-page">
      <div className="page-heading">
        <h1>Service Records</h1>
        <p>Manage and monitor vehicle maintenance services.</p>
      </div>

      {/* STATUS SUMMARY CARDS */}

      <div className="record-summary-grid">
        {statusSummary.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`record-summary-card ${
                statusFilter === item.label
                  ? 'selected-summary'
                  : ''
              }`}
              aria-pressed={statusFilter === item.label}
              onClick={() =>
                setStatusFilter(
                  statusFilter === item.label
                    ? ''
                    : item.label
                )
              }
            >
              <div
                className={`record-summary-icon ${item.color}`}
              >
                <Icon size={24} />
              </div>

              <div className="record-summary-info">
                <p>{item.label}</p>
                <h2>{loading ? '—' : item.count}</h2>
              </div>
            </button>
          );
        })}
      </div>

      {success && (
        <div className="success-message" role="status">
          {success}

          <button
            onClick={() => setSuccess('')}
            aria-label="Dismiss message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="content-card">
        <div className="management-toolbar">
          <div className="search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search service records..."
              aria-label="Search service records"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="toolbar-actions">
            <button
              className="refresh-button"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="primary-button"
              onClick={openAddModal}
              disabled={
                loading ||
                vehicles.length === 0 ||
                serviceTypes.length === 0
              }
            >
              <Plus size={19} />
              Add Service Record
            </button>
          </div>
        </div>

        {/* FILTERS */}

        <div className="record-filters">
          <div className="record-filter-group">
            <label htmlFor="statusFilter">Status</label>

            <select
              id="statusFilter"
              className="filter-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="">All Statuses</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="record-filter-group">
            <label htmlFor="vehicleFilter">Vehicle</label>

            <select
              id="vehicleFilter"
              className="filter-select"
              value={vehicleFilter}
              onChange={(e) =>
                setVehicleFilter(e.target.value)
              }
            >
              <option value="">All Vehicles</option>

              {vehicles.map((vehicle) => (
                <option
                  key={vehicle.vehicleId}
                  value={vehicle.vehicleId}
                >
                  {vehicle.plateNumber} - {vehicle.brand}{' '}
                  {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div className="record-filter-group">
            <label htmlFor="dateFilter">Service Date</label>

            <input
              id="dateFilter"
              className="filter-select"
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
            />
          </div>

          <button
            className="secondary-button"
            onClick={clearFilters}
          >
            <X size={16} />
            Clear Filters
          </button>
        </div>

        {!loading &&
          !error &&
          (vehicles.length === 0 ||
            serviceTypes.length === 0) && (
            <div className="warning-message">
              Please register at least one vehicle and one
              service type before adding a service record.
            </div>
          )}

        {/* SERVICE RECORDS TABLE */}

        {loading ? (
          <div className="empty-state">
            Loading service records...
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Service Type</th>
                    <th>Service Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="empty-state">
                          <ClipboardList size={36} />

                          <h3>No service records found</h3>

                          <p>
                            {search ||
                            statusFilter ||
                            vehicleFilter ||
                            dateFilter
                              ? 'Try a different search or filter.'
                              : 'Add your first service record to get started.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.serviceRecordId}>
                        <td>#{record.serviceRecordId}</td>

                        <td>
                          <div className="record-vehicle">
                            <span className="plate-number">
                              {record.vehicle?.plateNumber || '—'}
                            </span>

                            <span className="record-vehicle-name">
                              {record.vehicle?.brand}{' '}
                              {record.vehicle?.model}
                            </span>
                          </div>
                        </td>

                        <td>
                          {getCustomerName(record.vehicle)}
                        </td>

                        <td className="customer-name">
                          {record.serviceType?.serviceName || '—'}
                        </td>

                        <td>
                          {formatDate(record.serviceDate)}
                        </td>

                        <td className="record-description">
                          {record.description}
                        </td>

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
                          <span className="service-price">
                            {formatCurrency(record.cost)}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="action-button edit-button"
                              title="Edit service record"
                              aria-label="Edit service record"
                              onClick={() =>
                                openEditModal(record)
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="action-button delete-button"
                              title="Delete service record"
                              aria-label="Delete service record"
                              onClick={() => {
                                setError('');
                                setSuccess('');
                                setDeleteRecord(record);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Showing {filteredRecords.length} of{' '}
              {records.length} service records
            </div>
          </>
        )}
      </div>

      {/* ADD AND EDIT SERVICE RECORD MODAL */}

      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal-card service-record-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-modal-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="record-modal-title">
                  {editingRecord
                    ? 'Edit Service Record'
                    : 'Add Service Record'}
                </h2>

                <p>
                  {editingRecord
                    ? 'Update the maintenance information.'
                    : 'Enter the vehicle maintenance information below.'}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="error-message" role="alert">
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="vehicleId">
                    Vehicle *
                  </label>

                  <select
                    id="vehicleId"
                    className="form-input"
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select a vehicle
                    </option>

                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle.vehicleId}
                        value={vehicle.vehicleId}
                      >
                        {vehicle.plateNumber} -{' '}
                        {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedVehicle && (
                  <div className="vehicle-owner-info">
                    <div className="owner-info-icon">
                      <User size={21} />
                    </div>

                    <div>
                      <p>Vehicle Owner</p>

                      <strong>
                        {getCustomerName(selectedVehicle)}
                      </strong>

                      <span>
                        {selectedVehicle.customer?.phone || ''}
                      </span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="serviceTypeId">
                    Service Type *
                  </label>

                  <select
                    id="serviceTypeId"
                    className="form-input"
                    name="serviceTypeId"
                    value={form.serviceTypeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select a service type
                    </option>

                    {serviceTypes.map((service) => (
                      <option
                        key={service.serviceTypeId}
                        value={service.serviceTypeId}
                      >
                        {service.serviceName} -{' '}
                        {formatCurrency(service.basePrice)}
                      </option>
                    ))}
                  </select>

                  {selectedService && (
                    <p className="field-hint">
                      {selectedService.description}
                    </p>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="serviceDate">
                      Service Date *
                    </label>

                    <input
                      id="serviceDate"
                      className="form-input"
                      type="date"
                      name="serviceDate"
                      value={form.serviceDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">
                      Status *
                    </label>

                    <select
                      id="status"
                      className="form-input"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      required
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Description *
                  </label>

                  <textarea
                    id="description"
                    className="form-input"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter maintenance details..."
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cost">
                    Service Cost (PHP) *
                  </label>

                  <div className="currency-input">
                    <span className="currency-symbol">
                      ₱
                    </span>

                    <input
                      id="cost"
                      type="number"
                      name="cost"
                      value={form.cost}
                      onChange={handleChange}
                      placeholder="0.00"
                      min={0}
                      max={99999999.99}
                      step="0.01"
                      required
                    />
                  </div>

                  <p className="field-hint">
                    Automatically filled from the base price.
                    You can adjust the actual service cost.
                  </p>
                </div>

                <div className="record-cost-summary">
                  <div>
                    <p>Total Service Cost</p>
                    <h2>
                      {formatCurrency(form.cost || 0)}
                    </h2>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      form.status
                    )}`}
                  >
                    {form.status}
                  </span>
                </div>

                <p className="required-note">
                  * Required fields
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingRecord
                    ? 'Save Changes'
                    : 'Save Service Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}

      {deleteRecord && (
        <div className="modal-overlay">
          <div
            className="modal-card confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-record-title"
          >
            <div className="modal-body">
              <div className="delete-icon">
                <Trash2 size={28} />
              </div>

              <h2 id="delete-record-title">
                Delete Service Record
              </h2>

              <p>
                Are you sure you want to delete service
                record{' '}
                <strong>
                  #{deleteRecord.serviceRecordId}
                </strong>
                ?
              </p>

              <div className="delete-record-details">
                <p>
                  <strong>Vehicle:</strong>{' '}
                  {deleteRecord.vehicle?.plateNumber}
                </p>

                <p>
                  <strong>Service:</strong>{' '}
                  {deleteRecord.serviceType?.serviceName}
                </p>

                <p>
                  <strong>Cost:</strong>{' '}
                  {formatCurrency(deleteRecord.cost)}
                </p>
              </div>

              <p className="delete-warning">
                This action cannot be undone. Deleting
                this record may affect dashboard statistics
                and service reports.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setDeleteRecord(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Service Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceRecords;
