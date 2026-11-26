
import { useEffect, useState } from 'react';
import {
  FileText,
  Printer,
  RotateCcw,
  ClipboardList,
  CheckCircle,
  Wallet,
  CarFront,
  CalendarDays,
} from 'lucide-react';
import api from '../api/axios';

const statuses = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
];

const defaultFilters = {
  reportType: 'services',
  startDate: '',
  endDate: '',
  status: '',
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value ?? 0));
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
  return String(status)
    .toLowerCase()
    .replace(/\s+/g, '-');
};

const getCustomerName = (record) => {
  const customer = record.vehicle?.customer;

  return customer
    ? `${customer.firstName} ${customer.lastName}`
    : '—';
};

const getStaffName = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    return user?.fullName || 'Staff';
  } catch {
    return 'Staff';
  }
};

function Reports() {
  const [filters, setFilters] = useState({
    ...defaultFilters,
  });

  const [report, setReport] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ERROR HANDLING

  const getErrorMessage = (err, fallback) => {
    const message = err.response?.data?.message;

    return Array.isArray(message)
      ? message.join(', ')
      : message || fallback;
  };

  // GENERATE REPORT

  const generateReport = async (selectedFilters) => {
    setError('');

    if (
      selectedFilters.startDate &&
      selectedFilters.endDate &&
      selectedFilters.startDate > selectedFilters.endDate
    ) {
      setError(
        'Start date must not be later than end date.'
      );
      return;
    }

    try {
      setLoading(true);

      const params = {};

      if (selectedFilters.startDate) {
        params.startDate = selectedFilters.startDate;
      }

      if (selectedFilters.endDate) {
        params.endDate = selectedFilters.endDate;
      }

      if (
        selectedFilters.reportType === 'services' &&
        selectedFilters.status
      ) {
        params.status = selectedFilters.status;
      }

      const endpoint =
        selectedFilters.reportType === 'service-value'
          ? '/reports/service-value'
          : '/reports/services';

      const response = await api.get(endpoint, {
        params,
      });

      const data = response.data;

      // NORMALIZE BOTH REPORT RESPONSE STRUCTURES

      if (
        selectedFilters.reportType === 'service-value'
      ) {
        setReport({
          reportType: 'service-value',
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'Completed',
          totalRecords: data.totalCompletedServices,
          completedRecords: data.totalCompletedServices,
          totalCompletedServiceValue:
            data.totalCompletedServiceValue,
          records: data.records || [],
        });
      } else {
        setReport({
          reportType: 'services',
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          totalRecords: data.totalRecords,
          completedRecords: data.completedRecords,
          totalCompletedServiceValue:
            data.totalCompletedServiceValue,
          records: data.records || [],
        });
      }

      setGeneratedAt(new Date());
    } catch (err) {
      setReport(null);
      setGeneratedAt(null);

      setError(
        getErrorMessage(err, 'Failed to generate report.')
      );
    } finally {
      setLoading(false);
    }
  };

  // LOAD DEFAULT REPORT

  useEffect(() => {
    generateReport(defaultFilters);
  }, []);

  // FILTER INPUTS

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'reportType' &&
      value === 'service-value'
        ? { status: '' }
        : {}),
    }));

    setError('');
  };

  const handleGenerate = (event) => {
    event.preventDefault();
    generateReport(filters);
  };

  const handleReset = () => {
    const resetFilters = { ...defaultFilters };

    setFilters(resetFilters);
    generateReport(resetFilters);
  };

  // CHECK WHETHER FILTERS HAVE CHANGED

  const filtersChanged =
    report &&
    (
      filters.reportType !== report.reportType ||
      filters.startDate !== (report.startDate || '') ||
      filters.endDate !== (report.endDate || '') ||
      (
        filters.reportType === 'services' &&
        filters.status !==
          (report.status === 'All'
            ? ''
            : report.status || '')
      )
    );

  // PRINT REPORT

  const handlePrint = () => {
    if (!report || loading || filtersChanged) return;

    window.print();
  };

  // REPORT INFORMATION

  const reportTitle =
    report?.reportType === 'service-value'
      ? 'Completed Service Value Report'
      : 'Service History Report';

  const getReportingPeriod = () => {
    if (!report) return 'All Dates';

    if (report.startDate && report.endDate) {
      return `${formatDate(report.startDate)} - ${formatDate(
        report.endDate
      )}`;
    }

    if (report.startDate) {
      return `From ${formatDate(report.startDate)}`;
    }

    if (report.endDate) {
      return `Until ${formatDate(report.endDate)}`;
    }

    return 'All Dates';
  };

  const reportStatus =
    report?.status === 'All'
      ? 'All Statuses'
      : report?.status || 'All Statuses';

  const generatedDate = generatedAt
    ? generatedAt.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="reports-page">

      {/* PAGE HEADING */}

      <div className="page-heading no-print">
        <h1>Reports</h1>

        <p>
          Generate and print automotive service reports.
        </p>
      </div>

      {/* REPORT FILTERS */}

      <div className="content-card report-filter-card no-print">
        <div className="report-filter-heading">
          <div className="report-filter-icon">
            <FileText size={23} />
          </div>

          <div>
            <h2>Report Filters</h2>

            <p>
              Select a report type and reporting period.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div className="report-filter-grid">

            <div className="form-group">
              <label htmlFor="reportType">
                Report Type
              </label>

              <select
                id="reportType"
                className="form-input"
                name="reportType"
                value={filters.reportType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="services">
                  Service History Report
                </option>

                <option value="service-value">
                  Completed Service Value Report
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">
                Start Date
              </label>

              <input
                id="startDate"
                className="form-input"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                End Date
              </label>

              <input
                id="endDate"
                className="form-input"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reportStatus">
                Service Status
              </label>

              <select
                id="reportStatus"
                className="form-input"
                name="status"
                value={
                  filters.reportType === 'service-value'
                    ? 'Completed'
                    : filters.status
                }
                onChange={handleChange}
                disabled={
                  loading ||
                  filters.reportType === 'service-value'
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

          </div>

          <p className="report-filter-note">
            Leave the date fields empty to include all
            available service dates.
          </p>

          {filters.reportType === 'service-value' && (
            <div className="report-information">
              <Wallet size={19} />

              <span>
                This report includes completed services only.
                Pending, in-progress, and cancelled services
                are excluded.
              </span>
            </div>
          )}

          <div className="report-actions">

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              <FileText size={18} />

              {loading
                ? 'Generating...'
                : 'Generate Report'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw size={17} />
              Reset Filters
            </button>

            <button
              type="button"
              className="print-button"
              onClick={handlePrint}
              disabled={
                loading ||
                !report ||
                filtersChanged
              }
            >
              <Printer size={18} />
              Print Report
            </button>

          </div>
        </form>
      </div>

      {/* UNSAVED FILTER CHANGES */}

      {filtersChanged && !loading && (
        <div className="warning-message no-print">
          Report filters have changed. Click Generate Report
          to update the displayed results before printing.
        </div>
      )}

      {/* LOADING STATE */}

      {loading && (
        <div className="content-card no-print">
          <div className="empty-state">
            <FileText size={36} />

            <h3>Generating report...</h3>

            <p>Please wait while the data is retrieved.</p>
          </div>
        </div>
      )}

      {/* REPORT CONTENT */}

      {!loading && report && (
        <div id="printable-report">

          {/* PRINT-ONLY HEADER */}

          <div className="print-only print-report-header">
            <div className="print-brand">
              <CarFront size={40} />
              <h1>AutoTrack</h1>
            </div>

            <p>
              Automotive Service and Maintenance
              Management System
            </p>

            <div className="print-header-line" />
          </div>

          {/* REPORT TITLE */}

          <div className="report-document-heading">
            <h2>{reportTitle}</h2>

            <div className="report-period">
              <CalendarDays size={16} />

              <span>
                Reporting Period: {getReportingPeriod()}
              </span>
            </div>

            <p>Status: {reportStatus}</p>

            <p>Generated: {generatedDate}</p>
          </div>

          {/* REPORT SUMMARY */}

          <div className="report-summary-grid">

            <div className="report-summary-card">
              <div className="report-summary-icon blue">
                <ClipboardList size={24} />
              </div>

              <div className="report-summary-info">
                <p>Total Records</p>

                <h2>{report.totalRecords}</h2>
              </div>
            </div>

            <div className="report-summary-card">
              <div className="report-summary-icon green">
                <CheckCircle size={24} />
              </div>

              <div className="report-summary-info">
                <p>Completed Services</p>

                <h2>{report.completedRecords}</h2>
              </div>
            </div>

            <div className="report-summary-card">
              <div className="report-summary-icon purple">
                <Wallet size={24} />
              </div>

              <div className="report-summary-info">
                <p>Completed Service Value</p>

                <h2 className="report-value">
                  {formatCurrency(
                    report.totalCompletedServiceValue
                  )}
                </h2>
              </div>
            </div>

          </div>

          {/* REPORT TABLE */}

          <div className="content-card report-table-card">
            <div className="report-table-heading">
              <h3>Service Record Details</h3>

              <p>
                {report.records.length} matching service
                record(s)
              </p>
            </div>

            <div className="table-wrapper">
              <table className="data-table report-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service Date</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Service Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Cost</th>
                  </tr>
                </thead>

                <tbody>
                  {report.records.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <FileText size={36} />

                          <h3>No records found</h3>

                          <p>
                            No service records match the
                            selected report filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    report.records.map((record) => (
                      <tr key={record.serviceRecordId}>

                        <td>
                          #{record.serviceRecordId}
                        </td>

                        <td>
                          {formatDate(record.serviceDate)}
                        </td>

                        <td>
                          <div className="record-vehicle">
                            <span className="plate-number">
                              {record.vehicle?.plateNumber ||
                                '—'}
                            </span>

                            <span className="record-vehicle-name">
                              {record.vehicle?.brand}{' '}
                              {record.vehicle?.model}
                            </span>
                          </div>
                        </td>

                        <td>
                          {getCustomerName(record)}
                        </td>

                        <td>
                          {record.serviceType?.serviceName ||
                            '—'}
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

                        <td className="report-cost-cell">
                          {formatCurrency(record.cost)}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* REPORT TOTAL */}

            <div className="report-total-section">
              <div>
                <p>Total Completed Service Value</p>

                <span>
                  Includes completed services only.
                </span>
              </div>

              <h2>
                {formatCurrency(
                  report.totalCompletedServiceValue
                )}
              </h2>
            </div>
          </div>

          {/* REPORT FOOTER */}

          <div className="report-footer">
            <div className="report-prepared-by">
              <p>Prepared by:</p>

              <strong>{getStaffName()}</strong>

              <span>AutoTrack Staff</span>
            </div>

            <div className="print-only signature-section">
              <div className="signature-line" />
              <p>Signature</p>
            </div>
          </div>

          <div className="report-footer-note">
            <p>
              This is a system-generated report from AutoTrack.
            </p>

            <p>
              Completed service value represents recorded
              service costs, not confirmed payments or profit.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

export default Reports;
