
import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Car,
  RefreshCw,
} from 'lucide-react';
import api from '../api/axios';

const emptyForm = {
  customerId: '',
  plateNumber: '',
  brand: '',
  model: '',
  year: '',
  color: '',
};

const maxYear = new Date().getFullYear() + 1;

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteVehicle, setDeleteVehicle] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const getErrorMessage = (err, fallback) => {
    const message = err.response?.data?.message;

    return Array.isArray(message)
      ? message.join(', ')
      : message || fallback;
  };

  // LOAD VEHICLES AND CUSTOMERS

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [vehicleResponse, customerResponse] =
        await Promise.all([
          api.get('/vehicles'),
          api.get('/customers'),
        ]);

      setVehicles(vehicleResponse.data);
      setCustomers(customerResponse.data);
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to load vehicle data.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CUSTOMER NAME

  const getCustomerName = (vehicle) => {
    const customer =
      vehicle.customer ||
      customers.find(
        (item) => item.customerId === vehicle.customerId
      );

    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : 'Unknown Customer';
  };

  // SEARCH AND FILTER

  const filteredVehicles = vehicles.filter((vehicle) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch = [
      vehicle.plateNumber,
      vehicle.brand,
      vehicle.model,
      `${vehicle.brand} ${vehicle.model}`,
      vehicle.year,
      vehicle.color,
      getCustomerName(vehicle),
    ].some((value) =>
      String(value || '').toLowerCase().includes(keyword)
    );

    const matchesCustomer =
      !customerFilter ||
      String(vehicle.customerId) === customerFilter;

    return matchesSearch && matchesCustomer;
  });

  // ADD VEHICLE

  const openAddModal = () => {
    setEditingVehicle(null);
    setForm({ ...emptyForm });
    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  // EDIT VEHICLE

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);

    setForm({
      customerId: String(vehicle.customerId),
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      year: String(vehicle.year),
      color: vehicle.color,
    });

    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingVehicle(null);
    setForm({ ...emptyForm });
    setFormError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'plateNumber'
          ? value.toUpperCase()
          : value,
    }));
  };

  // SAVE VEHICLE

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError('');
    setSuccess('');

    const payload = {
      customerId: Number(form.customerId),
      plateNumber: form.plateNumber.trim().toUpperCase(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      color: form.color.trim(),
    };

    if (
      !payload.customerId ||
      !payload.plateNumber ||
      !payload.brand ||
      !payload.model ||
      !form.year ||
      !payload.color
    ) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (
      !Number.isInteger(payload.year) ||
      payload.year < 1900 ||
      payload.year > maxYear
    ) {
      setFormError(
        `Year must be between 1900 and ${maxYear}.`
      );
      return;
    }

    try {
      setSaving(true);

      if (editingVehicle) {
        await api.put(
          `/vehicles/${editingVehicle.vehicleId}`,
          payload
        );

        setSuccess('Vehicle updated successfully.');
      } else {
        await api.post('/vehicles', payload);

        setSuccess('Vehicle added successfully.');
      }

      setShowModal(false);
      setEditingVehicle(null);
      setForm({ ...emptyForm });

      await fetchData();
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Failed to save vehicle.')
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE VEHICLE

  const handleDelete = async () => {
    if (!deleteVehicle) return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      await api.delete(
        `/vehicles/${deleteVehicle.vehicleId}`
      );

      setSuccess('Vehicle deleted successfully.');
      setDeleteVehicle(null);

      await fetchData();
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to delete vehicle.')
      );

      setDeleteVehicle(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="management-page">
      <div className="page-heading">
        <h1>Vehicles</h1>
        <p>Manage registered vehicles and their owners.</p>
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
          <div className="vehicle-filters">
            <div className="search-box">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search vehicles..."
                aria-label="Search vehicles"
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

            <select
              className="filter-select"
              aria-label="Filter by customer"
              value={customerFilter}
              onChange={(e) =>
                setCustomerFilter(e.target.value)
              }
            >
              <option value="">All Customers</option>

              {customers.map((customer) => (
                <option
                  key={customer.customerId}
                  value={customer.customerId}
                >
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
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
              disabled={loading || customers.length === 0}
            >
              <Plus size={19} />
              Add Vehicle
            </button>
          </div>
        </div>

        {!loading && customers.length === 0 && !error && (
          <div className="warning-message">
            Please register a customer first before
            adding a vehicle.
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            Loading vehicles...
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plate Number</th>
                    <th>Vehicle</th>
                    <th>Year</th>
                    <th>Color</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <Car size={36} />

                          <h3>No vehicles found</h3>

                          <p>
                            {search || customerFilter
                              ? 'Try a different search or filter.'
                              : 'Add your first vehicle to get started.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.vehicleId}>
                        <td>#{vehicle.vehicleId}</td>

                        <td>
                          <span className="plate-number">
                            {vehicle.plateNumber}
                          </span>
                        </td>

                        <td className="customer-name">
                          {vehicle.brand} {vehicle.model}
                        </td>

                        <td>{vehicle.year}</td>

                        <td>{vehicle.color}</td>

                        <td>{getCustomerName(vehicle)}</td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="action-button edit-button"
                              title="Edit vehicle"
                              aria-label="Edit vehicle"
                              onClick={() =>
                                openEditModal(vehicle)
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="action-button delete-button"
                              title="Delete vehicle"
                              aria-label="Delete vehicle"
                              onClick={() => {
                                setError('');
                                setSuccess('');
                                setDeleteVehicle(vehicle);
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
              Showing {filteredVehicles.length} of{' '}
              {vehicles.length} vehicles
            </div>
          </>
        )}
      </div>

      {/* ADD AND EDIT VEHICLE MODAL */}

      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-modal-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="vehicle-modal-title">
                  {editingVehicle
                    ? 'Edit Vehicle'
                    : 'Add Vehicle'}
                </h2>

                <p>
                  {editingVehicle
                    ? 'Update the vehicle information.'
                    : 'Enter the vehicle information below.'}
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
                  <label htmlFor="customerId">
                    Customer / Owner *
                  </label>

                  <select
                    id="customerId"
                    className="form-input"
                    name="customerId"
                    value={form.customerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select a customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.customerId}
                        value={customer.customerId}
                      >
                        {customer.firstName}{' '}
                        {customer.lastName} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="plateNumber">
                    Plate Number *
                  </label>

                  <input
                    id="plateNumber"
                    className="form-input"
                    name="plateNumber"
                    value={form.plateNumber}
                    onChange={handleChange}
                    placeholder="e.g. ABC 1234"
                    maxLength={20}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="brand">Brand *</label>

                    <input
                      id="brand"
                      className="form-input"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="e.g. Toyota"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="model">Model *</label>

                    <input
                      id="model"
                      className="form-input"
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      placeholder="e.g. Vios"
                      maxLength={50}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="year">Year *</label>

                    <input
                      id="year"
                      className="form-input"
                      type="number"
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      placeholder="e.g. 2022"
                      min={1900}
                      max={maxYear}
                      step={1}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="color">Color *</label>

                    <input
                      id="color"
                      className="form-input"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="e.g. White"
                      maxLength={30}
                      required
                    />
                  </div>
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
                    : editingVehicle
                    ? 'Save Changes'
                    : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}

      {deleteVehicle && (
        <div className="modal-overlay">
          <div
            className="modal-card confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-vehicle-title"
          >
            <div className="modal-body">
              <div className="delete-icon">
                <Trash2 size={28} />
              </div>

              <h2 id="delete-vehicle-title">
                Delete Vehicle
              </h2>

              <p>
                Are you sure you want to delete{' '}
                <strong>
                  {deleteVehicle.brand}{' '}
                  {deleteVehicle.model}
                </strong>{' '}
                ({deleteVehicle.plateNumber})?
              </p>

              <p className="delete-warning">
                This action cannot be undone. Vehicles
                with existing service records cannot
                be deleted.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setDeleteVehicle(null)}
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
                  : 'Delete Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
