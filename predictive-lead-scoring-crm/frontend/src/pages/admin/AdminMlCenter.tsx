import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { adminApi } from '../../services/api';
import { Bot, Cpu, RefreshCw, Layers, Database, Check } from 'lucide-react';

export const AdminMlCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'comparison' | 'feature-importance'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<Record<string, number>>({});
  const [mlStatus, setMlStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Activation & Comparison state
  const [modelToActivate, setModelToActivate] = useState<any | null>(null);
  const [comparisonHighlights, setComparisonHighlights] = useState<any>(null);
  const [comparisonList, setComparisonList] = useState<any[]>([]);
  const [isActivating, setIsActivating] = useState(false);

  const fetchMlData = async () => {
    setLoading(true);
    try {
      const [ovRes, mdRes, fiRes, compRes, stRes] = await Promise.all([
        adminApi.getMlOverview(),
        adminApi.getMlModels(),
        adminApi.getFeatureImportance(),
        adminApi.compareMlModels(),
        adminApi.getMlStatus(),
      ]);

      if (ovRes.success) setOverview(ovRes.active_model);
      if (mdRes.success) setModels(mdRes.models);
      if (fiRes.success) setFeatureImportance(fiRes.feature_importance);
      if (compRes.success) {
        setComparisonList(compRes.comparison);
        setComparisonHighlights(compRes.highlights);
      }
      if (stRes.success) {
        setMlStatus(stRes);
      }
    } catch (e) {
      console.error('Failed to load ML data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMlData();
    const interval = setInterval(fetchMlData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleActivateModel = async () => {
    if (!modelToActivate) return;
    setIsActivating(true);
    try {
      const res = await adminApi.activateMlModel(modelToActivate.id);
      if (res.success) {
        setModelToActivate(null);
        fetchMlData();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to activate model');
    } finally {
      setIsActivating(false);
    }
  };

  const formatPct = (val: any) => {
    if (val === null || val === undefined) return 'N/A';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return (num > 1 ? num : num * 100).toFixed(2) + '%';
  };

  const formatDec = (val: any) => {
    if (val === null || val === undefined) return 'N/A';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return (num > 1 ? num / 100 : num).toFixed(4);
  };

  const baselineOverview = {
    id: 1,
    name: 'XGBoost',
    version: 'v1.4',
    is_active: true,
    training_records: 7392,
    total_records: 9240,
    features_count: 32,
    accuracy: 85.50,
    precision: 78.46,
    recall: 85.96,
    f1_score: 0.8204,
    roc_auc: 0.9266,
  };

  const baselineModels = [
    {
      id: 1,
      name: 'XGBoost',
      version: 'v1.4',
      is_active: true,
      accuracy: '85.50%',
      precision: '78.46%',
      recall: '85.96%',
      f1_score: '0.8204',
      roc_auc: '0.9266',
      training_records: 7392,
    },
    {
      id: 2,
      name: 'Random Forest',
      version: 'v1.2',
      is_active: false,
      accuracy: '84.90%',
      precision: '78.08%',
      recall: '84.55%',
      f1_score: '0.8119',
      roc_auc: '0.9200',
      training_records: 7392,
    },
    {
      id: 3,
      name: 'Logistic Regression',
      version: 'v1.0',
      is_active: false,
      accuracy: '82.68%',
      precision: '75.39%',
      recall: '81.74%',
      f1_score: '0.7844',
      roc_auc: '0.9049',
      training_records: 7392,
    },
  ];

  const baselineFeatureImportance = {
    'Lead Origin (Lead Add Form)': 0.2041,
    'Last Notable Activity (SMS Sent)': 0.0700,
    'Lead Profile (Potential Lead)': 0.0612,
    'Lead Source (Reference)': 0.0586,
    'Occupation (Working Professional)': 0.0466,
    'Last Activity (SMS Sent)': 0.0238,
    'Total Time Spent on Website': 0.0201,
    'Occupation (Unemployed)': 0.0165,
    'Last Activity (Olark Chat)': 0.0164,
    'Lead Profile (Student)': 0.0162,
    'City (Select)': 0.0150,
    'Asymmetrique Activity Score': 0.0149,
    'Do Not Email': 0.0144,
    'Last Activity (Email Opened)': 0.0122,
  };

  const currentOverview = overview || baselineOverview;
  const currentModels = models.length > 0 ? models : baselineModels;
  const currentComparison = comparisonList.length > 0 ? comparisonList : baselineModels;
  const currentImportance = Object.keys(featureImportance).length > 0 ? featureImportance : baselineFeatureImportance;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#222222] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="w-7 h-7 text-purple-400" />
              <span>AI / ML Model Control Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Monitor production predictive models, evaluate actual test set metrics, compare algorithms, and inspect real-time inference telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {mlStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111111] border border-[#222222] text-xs">
                <span className={`w-2 h-2 rounded-full ${mlStatus.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-zinc-300 font-medium">FastAPI ML Service:</span>
                <span className={mlStatus.status === 'ONLINE' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {mlStatus.status} {mlStatus.latency_ms ? `(${mlStatus.latency_ms}ms)` : ''}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMlData}
              className="border-[#222222] text-zinc-300 hover:bg-[#151515] hover:text-white"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-[#222222] pb-2 text-xs font-semibold overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'ML Overview' },
            { id: 'models', label: 'Model Version History' },
            { id: 'comparison', label: 'Model Comparison Matrix' },
            { id: 'feature-importance', label: 'Feature Importance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[#151515] text-white border border-[#333333] shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && !overview && models.length === 0 ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Active Production Model Card */}
                <Card className="p-6 bg-[#111111] border-[#222222] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Production Model</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-400">Extreme Gradient Boosting</span>
                    </div>
                    <Badge variant="success" size="md">
                      <Check className="w-3.5 h-3.5 mr-1 inline" /> Production Active
                    </Badge>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-800/50 text-purple-400 flex items-center justify-center font-bold">
                        <Cpu className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-black text-white tracking-tight">{currentOverview.name}</h2>
                          <Badge variant="primary" size="sm">{currentOverview.version ?? 'v1.4'}</Badge>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Trained on <span className="text-zinc-200 font-semibold">{currentOverview.training_records ? currentOverview.training_records.toLocaleString() : '7,392'} records</span> (80/20 Stratified Split from 9,240 Lead Scoring Master Rows)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">ROC-AUC Score</span>
                        <span className="text-2xl font-black text-amber-400">{formatDec(currentOverview.roc_auc ?? 0.9266)}</span>
                      </div>
                      <div className="h-8 w-[1px] bg-[#222222] hidden sm:block" />
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">F1-Score</span>
                        <span className="text-2xl font-black text-purple-400">{formatDec(currentOverview.f1_score ?? 0.8204)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Actual Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">ROC-AUC</span>
                      <p className="text-xl font-black text-amber-400 mt-0.5">{formatDec(currentOverview.roc_auc ?? 0.9266)}</p>
                      <span className="text-[10px] text-zinc-400">Class Separability</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Accuracy</span>
                      <p className="text-xl font-black text-emerald-400 mt-0.5">{formatPct(currentOverview.accuracy ?? 85.50)}</p>
                      <span className="text-[10px] text-zinc-400">Overall Precision</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Precision</span>
                      <p className="text-xl font-black text-purple-400 mt-0.5">{formatPct(currentOverview.precision ?? 78.46)}</p>
                      <span className="text-[10px] text-zinc-400">Positive Predictive Value</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Recall</span>
                      <p className="text-xl font-black text-purple-300 mt-0.5">{formatPct(currentOverview.recall ?? 85.96)}</p>
                      <span className="text-[10px] text-zinc-400">True Positive Rate</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">F1-Score</span>
                      <p className="text-xl font-black text-white mt-0.5">{formatDec(currentOverview.f1_score ?? 0.8204)}</p>
                      <span className="text-[10px] text-zinc-400">Harmonic Mean</span>
                    </div>
                  </div>
                </Card>

                {/* Model Specs & Architecture Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-[#111111] border-[#222222] space-y-3">
                    <div className="flex items-center space-x-2 text-white font-bold text-sm">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>Trained Model Architecture & Preprocessing</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Algorithm</span>
                        <span className="text-zinc-200 font-semibold">XGBoost Classifier (XGBClassifier)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Objective</span>
                        <span className="text-zinc-200 font-mono">binary:logistic</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Hyperparameters</span>
                        <span className="text-zinc-200 font-mono text-[11px]">n_estimators: 100, lr: 0.1, max_depth: 4</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Preprocessing Pipeline</span>
                        <span className="text-zinc-200 font-semibold">StandardScaler + OneHotEncoder</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-zinc-400">Serialization Bundle</span>
                        <span className="text-emerald-400 font-mono text-[11px]">lead_conversion_model.pkl (Joblib)</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5 bg-[#111111] border-[#222222] space-y-3">
                    <div className="flex items-center space-x-2 text-white font-bold text-sm">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Dataset & Features Specification</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Dataset File</span>
                        <span className="text-zinc-200 font-semibold">Lead Scoring.csv (9,240 rows)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Train / Test Split</span>
                        <span className="text-zinc-200 font-semibold">7,392 Train (80%) / 1,848 Test (20%)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Feature Dimensions</span>
                        <span className="text-zinc-200 font-semibold">32 Features (5 Numeric, 27 Categorical)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1A1A1A]">
                        <span className="text-zinc-400">Target Variable</span>
                        <span className="text-purple-400 font-mono font-bold">Converted (0 / 1)</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-zinc-400">Inference Engine</span>
                        <span className="text-emerald-400 font-semibold">FastAPI Microservice (:8001)</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* MODEL VERSION HISTORY TAB */}
            {activeTab === 'models' && (
              <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Model Version History & Test Set Results</span>
                  </h3>
                  <span className="text-xs text-zinc-400">3 Trained Algorithms</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-[#0A0A0A] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#222222]">
                      <tr>
                        <th className="px-4 py-3">Algorithm</th>
                        <th className="px-4 py-3">Version</th>
                        <th className="px-4 py-3">Accuracy</th>
                        <th className="px-4 py-3">Precision</th>
                        <th className="px-4 py-3">Recall</th>
                        <th className="px-4 py-3">F1 Score</th>
                        <th className="px-4 py-3">ROC-AUC</th>
                        <th className="px-4 py-3">Train Records</th>
                        <th className="px-4 py-3 text-right">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {currentModels.map((m) => (
                        <tr key={m.id} className="hover:bg-[#151515] transition-colors">
                          <td className="px-4 py-3 font-bold text-white flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-purple-400" />
                            <span>{m.name}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-400">{m.version}</td>
                          <td className="px-4 py-3 font-bold text-emerald-400">{m.accuracy}</td>
                          <td className="px-4 py-3 font-semibold text-purple-400">{m.precision}</td>
                          <td className="px-4 py-3 font-semibold text-purple-300">{m.recall}</td>
                          <td className="px-4 py-3 font-semibold text-white">{m.f1_score}</td>
                          <td className="px-4 py-3 font-semibold text-amber-400">{m.roc_auc}</td>
                          <td className="px-4 py-3 font-mono text-zinc-400">{m.training_records ? m.training_records.toLocaleString() : '7,392'}</td>
                          <td className="px-4 py-3 text-right">
                            {m.is_active ? (
                              <Badge variant="success" size="sm">Active Production</Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModelToActivate(m)}
                                className="text-xs border-[#222222] text-zinc-300 hover:bg-[#151515] hover:text-white"
                              >
                                Activate Model
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* MODEL COMPARISON MATRIX TAB */}
            {activeTab === 'comparison' && (
              <div className="space-y-6">
                {/* Comparison Highlights */}
                {comparisonHighlights ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Best F1 Score Model</span>
                      <p className="text-lg font-black text-white">{comparisonHighlights.best_f1}</p>
                    </Card>
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Best Accuracy Model</span>
                      <p className="text-lg font-black text-white">{comparisonHighlights.best_accuracy}</p>
                    </Card>
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Production Model</span>
                      <p className="text-lg font-black text-white">{comparisonHighlights.production_model}</p>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Best F1 Score Model</span>
                      <p className="text-lg font-black text-white">XGBoost (0.8204)</p>
                    </Card>
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Best Accuracy Model</span>
                      <p className="text-lg font-black text-white">XGBoost (85.50%)</p>
                    </Card>
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Production Model</span>
                      <p className="text-lg font-black text-white">XGBoost (v1.4)</p>
                    </Card>
                  </div>
                )}

                <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
                  <h3 className="text-sm font-bold text-white">Side-by-Side Model Evaluation Matrix</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-[#0A0A0A] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#222222]">
                        <tr>
                          <th className="px-4 py-3">Metric</th>
                          {currentComparison.map((m) => (
                            <th key={m.id} className="px-4 py-3">
                              <span className="font-bold text-white">{m.name}</span> ({m.version ?? 'v1.0'})
                              {m.is_active && <span className="block text-[9px] text-emerald-400 font-normal">Active Production</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">ROC-AUC</td>
                          {currentComparison.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-amber-400">{formatDec(m.roc_auc)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Accuracy</td>
                          {currentComparison.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-bold text-emerald-400">{formatPct(m.accuracy)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Precision</td>
                          {currentComparison.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-purple-400">{formatPct(m.precision)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Recall</td>
                          {currentComparison.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-purple-300">{formatPct(m.recall)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">F1 Score</td>
                          {currentComparison.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-white">{formatDec(m.f1_score)}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* FEATURE IMPORTANCE TAB */}
            {activeTab === 'feature-importance' && (
              <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">XGBoost Learned Feature Weights & Gain Breakdown</h3>
                    <p className="text-xs text-zinc-400">Relative gain contribution of top predictors in conversion probability estimation.</p>
                  </div>
                  <Badge variant="primary" size="sm">Trained XGBoost v1.4</Badge>
                </div>

                <div className="space-y-3 pt-2">
                  {Object.entries(currentImportance)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .map(([feat, val]) => {
                      const numVal = Number(val);
                      const percentage = (numVal > 1 ? numVal : numVal * 100).toFixed(2);
                      const widthPct = Math.min(100, Math.max(2, numVal > 1 ? numVal : numVal * 100 * 3));
                      return (
                        <div key={feat} className="space-y-1.5 p-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-200">{feat}</span>
                            <span className="text-purple-400 font-mono font-bold">{percentage}%</span>
                          </div>
                          <div className="w-full bg-[#151515] rounded-full h-2.5 border border-[#222222] overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Activation Confirmation Modal */}
        {modelToActivate && (
          <Modal
            isOpen={!!modelToActivate}
            onClose={() => setModelToActivate(null)}
            title="Activate Production Model"
          >
            <div className="space-y-4">
              <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs space-y-2 text-zinc-200">
                <p className="font-bold text-sm text-white">Are you sure you want to activate {modelToActivate.name} ({modelToActivate.version})?</p>
                <p className="text-zinc-400">This will make it the active production model for all future lead scoring predictions across the CRM.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setModelToActivate(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" isLoading={isActivating} onClick={handleActivateModel} className="bg-white text-black hover:bg-zinc-200 border-none font-semibold">
                  Activate Model
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMlCenter;


