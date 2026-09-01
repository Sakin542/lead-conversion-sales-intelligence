import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (importedCount: number) => void;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        setErrorMsg('Please select a valid CSV or Excel file (.csv, .xlsx).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,First Name,Last Name,Email,Company,Phone,Status\n' +
      'Sarah,Conner,sarah@cyberdyne.com,Cyberdyne Systems,+1 (555) 019-2831,Qualified\n' +
      'Michael,Scott,michael@dundermifflin.com,Dunder Mifflin,+1 (555) 014-9921,New\n' +
      'Bruce,Wayne,bruce@wayneenterprises.com,Wayne Enterprises,+1 (555) 018-4420,Proposal\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'crm_leads_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setErrorMsg('Please choose a CSV file to import.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);

    // Simulate backend CSV parsing & batch import
    setTimeout(() => {
      setIsImporting(false);
      const count = Math.floor(Math.random() * 5) + 3;
      setSuccessMsg(`Successfully imported ${count} leads into your CRM pipeline!`);
      if (onSuccess) onSuccess(count);
      setTimeout(() => {
        setSuccessMsg(null);
        setSelectedFile(null);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Leads from CSV">
      <div className="space-y-5 text-slate-200 text-xs">
        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-400 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-400 font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* File Dropzone Box */}
        <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center space-y-3 bg-slate-950/60 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="font-bold text-white text-sm">
              {selectedFile ? selectedFile.name : 'Upload your leads CSV spreadsheet'}
            </p>
            <p className="text-slate-400 text-[11px]">
              Drag and drop or click below to select a file (.csv, .xlsx max 10MB)
            </p>
          </div>

          <input
            type="file"
            id="csv-file-input"
            accept=".csv, .xlsx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex justify-center space-x-2 pt-1">
            <label
              htmlFor="csv-file-input"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors border border-slate-700"
            >
              {selectedFile ? 'Change File' : 'Browse File'}
            </label>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1.5 border border-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample Template</span>
            </button>
          </div>
        </div>

        {/* File Details Preview */}
        {selectedFile && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-bold text-white block">{selectedFile.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
              Ready to Import
            </span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isImporting}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isImporting}
            disabled={isImporting || !selectedFile}
            onClick={handleImport}
            className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-500/25"
          >
            {isImporting ? 'Importing Leads...' : 'Import Leads'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportLeadsModal;

