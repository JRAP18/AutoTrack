
import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import api from '../api/axios';

const emptyForm = {
  serviceName: '',
  description: '',
  basePrice: '',
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value));
};

function ServiceTypes() {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteService, setDeleteService] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });

  const getErrorMessage = (err, fallback) => {
    const message = err.response?.data?.message;

    return Array.isArray(message)
      ? message.join(', ')
      : message || fallback;
  };

  // LOAD SERVICE TYPES

  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/service-types');

      setServiceTypes(response.data);
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to load service types.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  // SEARCH SERVICE TYPES

  const filteredServices = serviceTypes.filter((service) => {
    const keyword = search.trim().toLowerCase();

    return [
      service.serviceName,
      service.description,
      service.basePrice,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(keyword)
    );
  });

  // ADD SERVICE TYPE

  const openAddModal = () => {
    setEditingService(null);
    setForm({ ...emptyForm });
    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  // EDIT SERVICE TYPE

  const openEditModal = (service) => {
    setEditingService(service);

    setForm({
      serviceName: service.serviceName,
      description: service.description,
      basePrice: String(service.basePrice),
    });

    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingService(null);
    setForm({ ...emptyForm });
    setFormError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SAVE SERVICE TYPE

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError('');
    setSuccess('');

    const payload = {
      serviceName: form.serviceName.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
    };

    if (
      !payload.serviceName ||
      !payload.description ||
      form.basePrice.trim() === ''
    ) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (
      !Number.isFinite(payload.basePrice) ||
      payload.basePrice < 0 ||
      payload.basePrice > 99999999.99
    ) {
      setFormError(
        'Base price must be between 0 and 99,999,999.99.'
      );
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(form.basePrice.trim())) {
      setFormError(
        'Base price must have a maximum of two decimal places.'
      );
      return;
    }

    try {
      setSaving(true);

      if (editingService) {
        await api.put(
          `/service-types/${editingService.serviceTypeId}`,
          payload
        );

        setSuccess('Service type updated successfully.');
      } else {
        await api.post('/service-types', payload);

        setSuccess('Service type added successfully.');
      }

      setShowModal(false);
      setEditingService(null);
      setForm({ ...emptyForm });

      await fetchServiceTypes();
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Failed to save service type.')
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE SERVICE TYPE

  const handleDelete = async () => {
    if (!deleteService) return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      await api.delete(
        `/service-types/${deleteService.serviceTypeId}`
      );

      setSuccess('Service type deleted successfully.');
      setDeleteService(null);

      await fetchServiceTypes();
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to delete service type.')
      );

      setDeleteService(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="management-page">
      <div className="page-heading">
        <h1>Service Types</h1>
        <p>Manage available automotive services and pricing.</p>
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
              placeholder="Search services..."
              aria-label="Search service types"
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
              onClick={fetchServiceTypes}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="primary-button"
              onClick={openAddModal}
            >
              <Plus size={19} />
              Add Service Type
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading service types...
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Base Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <Wrench size={36} />

                          <h3>No service types found</h3>

                          <p>
                            {search
                              ? 'Try a different search.'
                              : 'Add your first service type to get started.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => (
                      <tr key={service.serviceTypeId}>
                        <td>#{service.serviceTypeId}</td>

                        <td>
                          <div className="service-name-cell">
                            <div className="service-type-icon">
                              <Wrench size={18} />
                            </div>

                            <span>{service.serviceName}</span>
                          </div>
                        </td>

                        <td className="service-description">
                          {service.description}
                        </td>

                        <td>
                          <span className="service-price">
                            {formatCurrency(service.basePrice)}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="action-button edit-button"
                              title="Edit service type"
                              aria-label="Edit service type"
                              onClick={() =>
                                openEditModal(service)
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="action-button delete-button"
                              title="Delete service type"
                              aria-label="Delete service type"
                              onClick={() => {
                                setError('');
                                setSuccess('');
                                setDeleteService(service);
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
              Showing {filteredServices.length} of{' '}
              {serviceTypes.length} service types
            </div>
          </>
        )}
      </div>

      {/* ADD AND EDIT SERVICE TYPE MODAL */}

      {showModal && (
        <div className="modal-overlay">
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="service-modal-title">
                  {editingService
                    ? 'Edit Service Type'
                    : 'Add Service Type'}
                </h2>

                <p>
                  {editingService
                    ? 'Update the service information.'
                    : 'Enter the service information below.'}
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
                  <label htmlFor="serviceName">
                    Service Name *
                  </label>

                  <input
                    id="serviceName"
                    className="form-input"
                    name="serviceName"
                    value={form.serviceName}
                    onChange={handleChange}
                    placeholder="e.g. Oil Change"
                    maxLength={100}
                    required
                  />
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
                    placeholder="Enter service description"
                    rows={4}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="basePrice">
                    Base Price (PHP) *
                  </label>

                  <div className="currency-input">
                    <span className="currency-symbol">
                      ₱
                    </span>

                    <input
                      id="basePrice"
                      type="number"
                      name="basePrice"
                      value={form.basePrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      min={0}
                      max={99999999.99}
                      step="0.01"
                      required
                    />
                  </div>

                  <p className="field-hint">
                    Enter the standard price of this service.
                  </p>
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
                    : editingService
                    ? 'Save Changes'
                    : 'Save Service Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}

      {deleteService && (
        <div className="modal-overlay">
          <div
            className="modal-card confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
          >
            <div className="modal-body">
              <div className="delete-icon">
                <Trash2 size={28} />
              </div>

              <h2 id="delete-service-title">
                Delete Service Type
              </h2>

              <p>
                Are you sure you want to delete{' '}
                <strong>
                  {deleteService.serviceName}
                </strong>
                ?
              </p>

              <p className="delete-warning">
                This action cannot be undone. Service types
                with existing service records cannot be deleted.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setDeleteService(null)}
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
                  : 'Delete Service Type'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceTypes;
