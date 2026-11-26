
import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  RefreshCw,
} from 'lucide-react';
import api from '../api/axios';

const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');

  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getErrorMessage = (err, fallback) => {
    const message = err.response?.data?.message;

    return Array.isArray(message)
      ? message.join(', ')
      : message || fallback;
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/customers');

      setCustomers(response.data);
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to load customers.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.trim().toLowerCase();

    return [
      customer.firstName,
      customer.lastName,
      `${customer.firstName} ${customer.lastName}`,
      customer.phone,
      customer.email,
      customer.address,
    ].some((value) =>
      String(value || '').toLowerCase().includes(keyword)
    );
  });

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm({ ...emptyForm });
    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
    });

    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError('');
    setSuccess('');

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.phone ||
      !payload.address
    ) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (form.email.trim()) {
      payload.email = form.email.trim();
    }

    try {
      setSaving(true);

      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer.customerId}`,
          payload
        );

        setSuccess('Customer updated successfully.');
      } else {
        await api.post('/customers', payload);

        setSuccess('Customer added successfully.');
      }

      setShowModal(false);
      setEditingCustomer(null);
      setForm({ ...emptyForm });

      await fetchCustomers();
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Failed to save customer.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCustomer) return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      await api.delete(
        `/customers/${deleteCustomer.customerId}`
      );

      setSuccess('Customer deleted successfully.');
      setDeleteCustomer(null);

      await fetchCustomers();
    } catch (err) {
      setError(
        getErrorMessage(err, 'Failed to delete customer.')
      );

      setDeleteCustomer(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="management-page">
      <div className="page-heading">
        <h1>Customers</h1>
        <p>Manage customer information and records.</p>
      </div>

      {success && (
        <div className="success-message" role="status">
          {success}
          <button onClick={() => setSuccess('')}
            aria-label="Dismiss message">
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
              placeholder="Search customers..."
              aria-label="Search customers"
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
              onClick={fetchCustomers}
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
              Add Customer
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading customers...
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Phone Number</th>
                    <th>Email Address</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <Users size={36} />

                          <h3>No customers found</h3>

                          <p>
                            {search
                              ? 'Try a different search.'
                              : 'Add your first customer to get started.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.customerId}>
                        <td>#{customer.customerId}</td>

                        <td className="customer-name">
                          {customer.firstName}{' '}
                          {customer.lastName}
                        </td>

                        <td>{customer.phone}</td>

                        <td>{customer.email || '—'}</td>

                        <td className="address-cell">
                          {customer.address}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="action-button edit-button"
                              title="Edit customer"
                              aria-label="Edit customer"
                              onClick={() =>
                                openEditModal(customer)
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="action-button delete-button"
                              title="Delete customer"
                              aria-label="Delete customer"
                              onClick={() => {
                                setError('');
                                setSuccess('');
                                setDeleteCustomer(customer);
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
              Showing {filteredCustomers.length} of{' '}
              {customers.length} customers
            </div>
          </>
        )}
      </div>

      {/* ADD AND EDIT CUSTOMER MODAL */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title">
            <div className="modal-header">
              <div>
                <h2 id="customer-modal-title">
                  {editingCustomer
                    ? 'Edit Customer'
                    : 'Add Customer'}
                </h2>

                <p>
                  {editingCustomer
                    ? 'Update the customer information.'
                    : 'Enter the customer information below.'}
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

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>

                    <input
                      id="firstName"
                      className="form-input"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>

                    <input
                      id="lastName"
                      className="form-input"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      maxLength={50}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>

                  <input
                    id="phone"
                    className="form-input"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    maxLength={20}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email Address (Optional)
                  </label>

                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address *</label>

                  <textarea
                    id="address"
                    className="form-input"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows={3}
                    maxLength={255}
                    required
                  />
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
                    : editingCustomer
                    ? 'Save Changes'
                    : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}

      {deleteCustomer && (
        <div className="modal-overlay">
          <div className="modal-card confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title">
            <div className="modal-body">
              <div className="delete-icon">
                <Trash2 size={28} />
              </div>

              <h2 id="delete-modal-title">Delete Customer</h2>

              <p>
                Are you sure you want to delete{' '}
                <strong>
                  {deleteCustomer.firstName}{' '}
                  {deleteCustomer.lastName}
                </strong>
                ?
              </p>

              <p className="delete-warning">
                This action cannot be undone. Customers
                with registered vehicles cannot be deleted.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setDeleteCustomer(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
