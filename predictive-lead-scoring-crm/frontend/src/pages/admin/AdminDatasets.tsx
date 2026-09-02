import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { adminApi } from '../../services/api';
import { Database, Upload, Trash2, CheckCircle2, AlertCircle, FileText, RefreshCw, BarChart2, Eye, ShieldAlert } from 'lucide-react';

export const AdminDatasets: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Quality Report & Preview state
  const [qualityReport, setQualityReport] = useState<any | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [loadingQualityId, setLoadingQualityId] = useState<number | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<number | null>(null);
  const [activeDatasetId, setActiveDatasetId] = useState<number | null>(null);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDatasets();
      if (res.success) {
        setDatasets(res.datasets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQualityReport = async (id: number) => {
    setLoadingQualityId(id);
    try {
      const res = await adminApi.getDatasetQualityReport(id);
      if (res.success) {
        setQualityReport(res);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to load quality report.');
    } finally {
      setLoadingQualityId(null);
    }
  };

  const handlePreviewDataset = async (id: number, page = 1) => {
    setLoadingPreviewId(id);
    setActiveDatasetId(id);
    try {
      const res = await adminApi.getDatasetPreview(id, page, 10);
      if (res.success) {
        setPreviewData(res);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to preview dataset.');
    } finally {
      setLoadingPreviewId(null);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a CSV file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (datasetName) formData.append('name', datasetName);

    try {
      const res = await adminApi.uploadDataset(formData);
      if (res.success) {
        setUploadSuccess(res.message);
        setFile(null);
        setDatasetName('');
        fetchDatasets();
      }
    } catch (err: any) {
      setUploadError(err.data?.message || err.message || 'Failed to upload dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDataset = async (id: number) => {
    if (!window.confirm('Delete this dataset permanently?')) return;
    try {
      const res = await adminApi.deleteDataset(id);
      if (res.success) {
        setDatasets((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to delete dataset.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Database className="w-7 h-7 text-indigo-400" />
              <span>Dataset Management & Validation</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload CSV training sets, inspect row counts, missing values, duplicates, and validate for ML model training.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDatasets}
            className="border-slate-800 text-slate-300 hover:bg-slate-900"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Datasets
          </Button>
        </div>

        {/* CSV Upload & Validation Card */}
        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload New CSV Training Dataset</span>
          </h3>

          {uploadSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg flex items-center space-x-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Dataset Custom Label (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Q3_2026_Lead_Conversions.csv"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-2 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv,.txt"
                id="dataset-file-input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="dataset-file-input" className="cursor-pointer block space-y-2">
                <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-xs font-bold text-slate-200">
                  {file ? file.name : 'Click or Drag CSV file here to upload'}
                </p>
                <p className="text-[11px] text-slate-500">Supports .CSV up to 10MB</p>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUploading}
                disabled={!file}
                className="bg-indigo-600 hover:bg-indigo-500 border-none font-bold"
              >
                Upload & Validate Dataset
              </Button>
            </div>
          </form>
        </Card>

        {/* Datasets Table */}
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">System Datasets Directory</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Dataset Name</th>
                  <th className="px-4 py-3">Rows</th>
                  <th className="px-4 py-3">Columns</th>
                  <th className="px-4 py-3">Missing Values</th>
                  <th className="px-4 py-3">Duplicates</th>
                  <th className="px-4 py-3">Validation Status</th>
                  <th className="px-4 py-3">Uploaded Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : datasets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No uploaded datasets found.
                    </td>
                  </tr>
                ) : (
                  datasets.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>{d.name}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{d.row_count}</td>
                      <td className="px-4 py-3 text-slate-400">{d.column_count}</td>
                      <td className="px-4 py-3 text-amber-400 font-semibold">{d.missing_values_count}</td>
                      <td className="px-4 py-3 text-slate-400">{d.duplicate_count}</td>
                      <td className="px-4 py-3">
                        <Badge variant={d.status === 'valid' ? 'success' : 'danger'} size="sm">
                          {d.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={loadingQualityId === d.id}
                            onClick={() => handleViewQualityReport(d.id)}
                            className="text-[11px] border-indigo-800 text-indigo-300 hover:bg-indigo-950/60"
                          >
                            <BarChart2 className="w-3 h-3 mr-1" />
                            Quality Report
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={loadingPreviewId === d.id}
                            onClick={() => handlePreviewDataset(d.id, 1)}
                            className="text-[11px] border-slate-700 text-slate-200 hover:bg-slate-800"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>

                          <button
                            onClick={() => handleDeleteDataset(d.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"
                            title="Delete Dataset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quality Report Modal */}
        {qualityReport && (
          <Modal
            isOpen={!!qualityReport}
            onClose={() => setQualityReport(null)}
            title={`Dataset Quality Report: ${qualityReport.dataset_name}`}
          >
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-300">Validation Status</span>
                <Badge variant={qualityReport.metrics.validation_status === 'Passed' ? 'success' : 'warning'} size="md">
                  {qualityReport.metrics.validation_status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Rows</span>
                  <p className="text-base font-black text-white">{qualityReport.metrics.total_rows}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Columns</span>
                  <p className="text-base font-black text-indigo-400">{qualityReport.metrics.total_columns}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Missing Values</span>
                  <p className="text-base font-black text-amber-400">{qualityReport.metrics.missing_values_count} ({qualityReport.metrics.missing_percentage})</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Duplicate Rows</span>
                  <p className="text-base font-black text-cyan-400">{qualityReport.metrics.duplicate_rows} ({qualityReport.metrics.duplicate_percentage})</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Target Class Distribution</span>
                <p className="text-slate-200">Positive Class Ratio: <strong className="text-emerald-400">{qualityReport.metrics.positive_class_ratio}</strong> | Negative Class Ratio: <strong className="text-slate-400">{qualityReport.metrics.negative_class_ratio}</strong></p>
              </div>

              {qualityReport.metrics.warnings?.length > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl space-y-1.5 text-amber-200">
                  <span className="font-bold flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-amber-400" /> Data Validation Warnings</span>
                  <ul className="list-disc list-inside space-y-1">
                    {qualityReport.metrics.warnings.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Dataset Preview Modal */}
        {previewData && (
          <Modal
            isOpen={!!previewData}
            onClose={() => setPreviewData(null)}
            title={`CSV Preview: ${previewData.dataset_name}`}
          >
            <div className="space-y-4">
              <div className="overflow-x-auto max-h-80 border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <tr>
                      {previewData.headers.map((h: string, idx: number) => (
                        <th key={idx} className="px-3 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {previewData.rows.map((row: any[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40">
                        {row.map((cell: any, cIdx: number) => (
                          <td key={cIdx} className="px-3 py-2 whitespace-nowrap font-mono text-[11px] text-slate-300">{cell ?? 'NULL'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                <span>Showing page {previewData.pagination.current_page} of first {previewData.pagination.total_rows} records</span>
                {activeDatasetId && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={previewData.pagination.current_page <= 1}
                      onClick={() => handlePreviewDataset(activeDatasetId, previewData.pagination.current_page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewDataset(activeDatasetId, previewData.pagination.current_page + 1)}
                    >
                      Next Page
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDatasets;

