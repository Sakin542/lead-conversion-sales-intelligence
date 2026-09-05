import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { adminApi } from '../../services/api';
import { Database, Upload, Trash2, CheckCircle2, AlertCircle, FileText, RefreshCw, BarChart2, Eye, ShieldAlert, X } from 'lucide-react';

const DEFAULT_DATASETS = [
  {
    id: 1,
    name: 'Lead Scoring.csv',
    row_count: 9240,
    column_count: 37,
    missing_values_count: 41039,
    duplicate_count: 0,
    status: 'validated',
    created_at: new Date().toISOString(),
  },
];

export const AdminDatasets: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('crm_admin_datasets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_DATASETS;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (res.success && Array.isArray(res.datasets) && res.datasets.length > 0) {
        setDatasets(res.datasets);
        try {
          localStorage.setItem('crm_admin_datasets', JSON.stringify(res.datasets));
        } catch (_) {}
      } else {
        setDatasets((prev) => {
          const list = prev.length > 0 ? prev : DEFAULT_DATASETS;
          try {
            localStorage.setItem('crm_admin_datasets', JSON.stringify(list));
          } catch (_) {}
          return list;
        });
      }
    } catch (e) {
      console.error(e);
      setDatasets((prev) => (prev.length > 0 ? prev : DEFAULT_DATASETS));
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

  const handleFileSelect = (selectedFile: File | null) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }
    const maxSizeBytes = 50 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setUploadError(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 50MB.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(selectedFile);
    if (!datasetName) {
      setDatasetName(selectedFile.name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a CSV or TXT file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    const targetName = datasetName.trim() || file.name;

    try {
      // 1. Try standard FormData upload
      let textContent = '';
      try {
        textContent = await file.text();
      } catch (_) {
        // Fallback for older browsers
      }

      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('name', targetName);
      if (textContent) {
        formData.append('csv_content', textContent);
      }

      let res: any;
      try {
        res = await adminApi.uploadDataset(formData);
      } catch (uploadErr: any) {
        // If FormData upload encountered a server size or multipart issue and we have textContent, fallback to JSON payload
        if (textContent) {
          res = await adminApi.uploadDatasetJson({
            name: targetName,
            content: textContent,
          });
        } else {
          throw uploadErr;
        }
      }

      if (res && res.success) {
        setUploadSuccess(res.message || 'Dataset uploaded and validated successfully.');
        setFile(null);
        setDatasetName('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (res.dataset) {
          setDatasets((prev) => {
            const updated = [res.dataset, ...prev.filter((d) => d.id !== res.dataset.id)];
            try {
              localStorage.setItem('crm_admin_datasets', JSON.stringify(updated));
            } catch (_) {}
            return updated;
          });
        }
        fetchDatasets();
      } else {
        throw new Error(res?.message || 'Upload failed');
      }
    } catch (err: any) {
      let errorMsg = 'Failed to upload dataset.';
      if (err.data?.errors) {
        const firstField = Object.values(err.data.errors)[0];
        errorMsg = Array.isArray(firstField) ? firstField[0] : String(firstField);
      } else if (err.data?.message) {
        errorMsg = err.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setUploadError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDataset = async (id: number) => {
    if (!window.confirm('Delete this dataset permanently?')) return;
    try {
      const res = await adminApi.deleteDataset(id);
      if (res.success) {
        setDatasets((prev) => {
          const updated = prev.filter((d) => d.id !== id);
          try {
            localStorage.setItem('crm_admin_datasets', JSON.stringify(updated));
          } catch (_) {}
          return updated;
        });
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to delete dataset.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Database className="w-7 h-7 text-[#FF7A00]" />
              <span>Dataset Management & Validation</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Upload CSV training sets, inspect row counts, missing values, duplicates, and validate for ML model training.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDatasets}
            className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C]"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Datasets
          </Button>
        </div>

        {/* Top Section: Upload Box & Directory Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CSV Upload & Validation Card Box */}
          <Card className="lg:col-span-4 p-6 bg-[#171718] border-[#2A2A2E] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-[#FF7A00]" />
                <span>Upload CSV Dataset</span>
              </h3>
              <Badge variant="neutral" size="sm">Max 50MB</Badge>
            </div>

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
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Dataset Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Q3_2026_Lead_Conversions.csv"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full bg-[#111113] border border-[#2A2A2E] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center space-y-2 transition-all cursor-pointer select-none ${
                  isDragging
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10'
                    : file
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-[#2A2A2E] hover:border-[#FF7A00] bg-[#111113]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,text/csv,text/plain,application/vnd.ms-excel"
                  id="dataset-file-input"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    handleFileSelect(selected);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <div className="block space-y-2">
                  <FileText className={`w-8 h-8 mx-auto ${file ? 'text-emerald-400' : 'text-[#FF7A00]'}`} />
                  <p className="text-xs font-bold text-zinc-200 truncate max-w-full px-2">
                    {file ? file.name : 'Click or Drag CSV file here'}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'Supports .CSV, .TSV, .TXT up to 50MB'}
                  </p>
                </div>

                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setDatasetName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-white bg-[#1E1E20] hover:bg-[#2A2A2E] rounded-full transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="ai"
                  size="md"
                  isLoading={isUploading}
                  disabled={!file}
                  className="w-full justify-center"
                >
                  Upload & Validate
                </Button>
              </div>
            </form>
          </Card>

          {/* Datasets Table Box */}
          <Card className="lg:col-span-8 p-6 bg-[#171718] border-[#2A2A2E] space-y-4 shadow-xl min-w-0">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#FF7A00]" />
                <span>System Datasets Directory</span>
              </h3>
              <span className="text-xs font-semibold text-zinc-400 font-mono">{datasets.length} Datasets</span>
            </div>

            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#111113] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#2A2A2E]">
                  <tr>
                    <th className="px-4 py-3">Dataset Name</th>
                    <th className="px-4 py-3">Rows</th>
                    <th className="px-4 py-3">Columns</th>
                    <th className="px-4 py-3">Missing</th>
                    <th className="px-4 py-3">Duplicates</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2E]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                        <LoadingSpinner size="md" />
                      </td>
                    </tr>
                  ) : datasets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                        No uploaded datasets found.
                      </td>
                    </tr>
                  ) : (
                    datasets.map((d) => (
                      <tr key={d.id} className="hover:bg-[#1C1C1E] transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          <div className="flex items-center space-x-2 truncate max-w-[180px]">
                            <FileText className="w-4 h-4 text-[#FF7A00] shrink-0" />
                            <span className="truncate">{d.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-200">{d.row_count}</td>
                        <td className="px-4 py-3 text-zinc-400">{d.column_count}</td>
                        <td className="px-4 py-3 text-amber-400 font-semibold">{d.missing_values_count}</td>
                        <td className="px-4 py-3 text-zinc-400">{d.duplicate_count}</td>
                        <td className="px-4 py-3">
                          <Badge variant={['valid', 'validated', 'ready'].includes(d.status?.toLowerCase()) ? 'success' : 'danger'} size="sm">
                            {(d.status || 'valid').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              isLoading={loadingQualityId === d.id}
                              onClick={() => handleViewQualityReport(d.id)}
                              className="text-[11px] border-[#FF7A00]/40 text-[#FF7A00] hover:bg-[#FF7A00]/10 px-2.5 py-1 min-h-[30px]"
                            >
                              <BarChart2 className="w-3 h-3 mr-1" />
                              Report
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              isLoading={loadingPreviewId === d.id}
                              onClick={() => handlePreviewDataset(d.id, 1)}
                              className="text-[11px] border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C] px-2.5 py-1 min-h-[30px]"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>

                            <button
                              onClick={() => handleDeleteDataset(d.id)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-[#29292C] rounded-lg transition-colors"
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
        </div>

        {/* Quality Report Modal */}
        {qualityReport && (
          <Modal
            isOpen={!!qualityReport}
            onClose={() => setQualityReport(null)}
            title={`Dataset Quality Report: ${qualityReport.dataset_name}`}
          >
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center p-3 bg-[#111113] rounded-xl border border-[#2A2A2E]">
                <span className="font-bold text-zinc-300">Validation Status</span>
                <Badge variant={qualityReport.metrics.validation_status === 'Passed' ? 'success' : 'warning'} size="md">
                  {qualityReport.metrics.validation_status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Rows</span>
                  <p className="text-base font-black text-white">{qualityReport.metrics.total_rows}</p>
                </div>
                <div className="p-3 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Columns</span>
                  <p className="text-base font-black text-[#FF7A00]">{qualityReport.metrics.total_columns}</p>
                </div>
                <div className="p-3 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Missing Values</span>
                  <p className="text-base font-black text-amber-400">{qualityReport.metrics.missing_values_count} ({qualityReport.metrics.missing_percentage})</p>
                </div>
                <div className="p-3 bg-[#111113] border border-[#2A2A2E] rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Duplicate Rows</span>
                  <p className="text-base font-black text-cyan-400">{qualityReport.metrics.duplicate_rows} ({qualityReport.metrics.duplicate_percentage})</p>
                </div>
              </div>

              <div className="p-3 bg-[#111113] border border-[#2A2A2E] rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Target Class Distribution</span>
                <p className="text-zinc-200">Positive Class Ratio: <strong className="text-emerald-400">{qualityReport.metrics.positive_class_ratio}</strong> | Negative Class Ratio: <strong className="text-zinc-400">{qualityReport.metrics.negative_class_ratio}</strong></p>
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
              <div className="overflow-x-auto max-h-80 border border-[#2A2A2E] rounded-xl bg-[#111113]">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#171718] text-zinc-400 font-bold uppercase border-b border-[#2A2A2E]">
                    <tr>
                      {previewData.headers.map((h: string, idx: number) => (
                        <th key={idx} className="px-3 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2E]">
                    {previewData.rows.map((row: any[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-[#1C1C1E]">
                        {row.map((cell: any, cIdx: number) => (
                          <td key={cIdx} className="px-3 py-2 whitespace-nowrap font-mono text-[11px] text-zinc-300">{cell ?? 'NULL'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-xs text-zinc-400 pt-2">
                <span>Showing page {previewData.pagination.current_page} of first {previewData.pagination.total_rows} records</span>
                {activeDatasetId && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={previewData.pagination.current_page <= 1}
                      onClick={() => handlePreviewDataset(activeDatasetId, previewData.pagination.current_page - 1)}
                      className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C]"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewDataset(activeDatasetId, previewData.pagination.current_page + 1)}
                      className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C]"
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
