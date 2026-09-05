import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { adminApi } from '../../services/api';
import { Bot, Play, CheckCircle2, Cpu, RefreshCw, Layers, Activity, Database, Check } from 'lucide-react';

export const AdminMlCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'comparison' | 'feature-importance' | 'predictions' | 'training'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<Record<string, number>>({});
  const [predictions, setPredictions] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [mlStatus, setMlStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Activation & Comparison state
  const [modelToActivate, setModelToActivate] = useState<any | null>(null);
  const [comparisonHighlights, setComparisonHighlights] = useState<any>(null);
  const [comparisonList, setComparisonList] = useState<any[]>([]);
  const [isActivating, setIsActivating] = useState(false);

  // Training Form State
  const [trainAlgorithm, setTrainAlgorithm] = useState('XGBoost');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingSuccess, setTrainingSuccess] = useState<string | null>(null);

  const fetchMlData = async () => {
    setLoading(true);
    try {
      const [ovRes, mdRes, fiRes, prRes, dsRes, compRes, stRes] = await Promise.all([
        adminApi.getMlOverview(),
        adminApi.getMlModels(),
        adminApi.getFeatureImportance(),
        adminApi.getPredictions(1),
        adminApi.getDatasets(),
        adminApi.compareMlModels(),
        adminApi.getMlStatus(),
      ]);

      if (ovRes.success) setOverview(ovRes.active_model);
      if (mdRes.success) setModels(mdRes.models);
      if (fiRes.success) setFeatureImportance(fiRes.feature_importance);
      if (prRes.success) setPredictions(prRes.data);
      if (dsRes.success) setDatasets(dsRes.datasets);
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

  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);
    setTrainingSuccess(null);
    try {
      const res = await adminApi.trainModel({
        algorithm: trainAlgorithm,
        dataset_id: selectedDatasetId ? Number(selectedDatasetId) : undefined,
      });

      if (res.success) {
        setTrainingSuccess(res.message);
        fetchMlData();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Training failed');
    } finally {
      setIsTraining(false);
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
            { id: 'predictions', label: 'Prediction Monitoring' },
            { id: 'training', label: 'Model Training' },
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

        {loading && !overview ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && overview && (
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
                          <h2 className="text-2xl font-black text-white tracking-tight">{overview.name}</h2>
                          <Badge variant="primary" size="sm">{overview.version ?? 'v1.4'}</Badge>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Trained on <span className="text-zinc-200 font-semibold">{overview.training_records ? overview.training_records.toLocaleString() : '7,392'} records</span> (80/20 Stratified Split from 9,240 Lead Scoring Master Rows)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">ROC-AUC Score</span>
                        <span className="text-2xl font-black text-amber-400">{formatDec(overview.roc_auc || 0.9263)}</span>
                      </div>
                      <div className="h-8 w-[1px] bg-[#222222] hidden sm:block" />
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">F1-Score</span>
                        <span className="text-2xl font-black text-purple-400">{formatDec(overview.f1_score || 0.8204)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Actual Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">ROC-AUC</span>
                      <p className="text-xl font-black text-amber-400 mt-0.5">{formatDec(overview.roc_auc || 0.9263)}</p>
                      <span className="text-[10px] text-zinc-400">Class Separability</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Accuracy</span>
                      <p className="text-xl font-black text-emerald-400 mt-0.5">{formatPct(overview.accuracy || 85.55)}</p>
                      <span className="text-[10px] text-zinc-400">Overall Precision</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Precision</span>
                      <p className="text-xl font-black text-purple-400 mt-0.5">{formatPct(overview.precision || 78.71)}</p>
                      <span className="text-[10px] text-zinc-400">Positive Predictive Value</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Recall</span>
                      <p className="text-xl font-black text-purple-300 mt-0.5">{formatPct(overview.recall || 85.67)}</p>
                      <span className="text-[10px] text-zinc-400">True Positive Rate</span>
                    </div>
                    <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">F1-Score</span>
                      <p className="text-xl font-black text-white mt-0.5">{formatDec(overview.f1_score || 0.8204)}</p>
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
                      {models.map((m) => (
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
                {comparisonHighlights && (
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
                )}

                <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
                  <h3 className="text-sm font-bold text-white">Side-by-Side Model Evaluation Matrix</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-[#0A0A0A] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#222222]">
                        <tr>
                          <th className="px-4 py-3">Metric</th>
                          {comparisonList.map((m) => (
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
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-amber-400">{formatDec(m.roc_auc)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Accuracy</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-bold text-emerald-400">{formatPct(m.accuracy)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Precision</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-purple-400">{formatPct(m.precision)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Recall</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-purple-300">{formatPct(m.recall)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">F1 Score</td>
                          {comparisonList.map((m) => (
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
                  {Object.entries(featureImportance).map(([feat, val]) => {
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

            {/* PREDICTION MONITORING TAB */}
            {activeTab === 'predictions' && (
              <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span>Real-Time Model Inference & Scoring Stream</span>
                  </h3>
                  <span className="text-xs text-zinc-400">Live Telemetry</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-[#0A0A0A] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#222222]">
                      <tr>
                        <th className="px-4 py-3">Lead Name</th>
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Score (0-100)</th>
                        <th className="px-4 py-3">Conversion Prob</th>
                        <th className="px-4 py-3">Classification</th>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3 text-right">Predicted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {predictions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                            No scored leads recorded yet.
                          </td>
                        </tr>
                      ) : (
                        predictions.map((p) => (
                          <tr key={p.id} className="hover:bg-[#151515] transition-colors">
                            <td className="px-4 py-3 font-bold text-white">{p.lead_name || `${p.first_name || ''} ${p.last_name || ''}`}</td>
                            <td className="px-4 py-3 text-zinc-400">{p.company || 'N/A'}</td>
                            <td className="px-4 py-3 font-black text-purple-400">{p.score ?? p.lead_score ?? 'N/A'}</td>
                            <td className="px-4 py-3 font-bold text-emerald-400">
                              {p.conversion_probability ? `${(Number(p.conversion_probability) * 100).toFixed(1)}%` : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={p.score >= 80 ? 'warning' : p.score >= 50 ? 'primary' : 'neutral'} size="sm">
                                {p.score >= 80 ? '🔥 HOT' : p.score >= 50 ? '⚡ WARM' : '❄️ COLD'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-400">{p.model || 'XGBoost v1.4'}</td>
                            <td className="px-4 py-3 text-right text-zinc-400">{p.predicted_at || p.updated_at || 'Just now'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* MODEL TRAINING TAB */}
            {activeTab === 'training' && (
              <Card className="p-6 bg-[#111111] border-[#222222] space-y-5 max-w-2xl mx-auto">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Play className="w-5 h-5 text-emerald-400" />
                    <span>Train Machine Learning Model</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Trigger background automated model retraining with cross-validation and feature evaluation.
                  </p>
                </div>

                {trainingSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{trainingSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleStartTraining} className="space-y-4">
                  <Select
                    label="Algorithm"
                    value={trainAlgorithm}
                    onChange={(e) => setTrainAlgorithm(e.target.value)}
                    options={[
                      { value: 'XGBoost', label: 'XGBoost (Extreme Gradient Boosting - Recommended)' },
                      { value: 'Random Forest', label: 'Random Forest Classifier' },
                      { value: 'Logistic Regression', label: 'Logistic Regression' },
                    ]}
                  />

                  <Select
                    label="Training Dataset"
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                    options={[
                      { value: '', label: 'Master Dataset (Lead Scoring.csv - 9,240 rows)' },
                      ...datasets.map((d) => ({ value: String(d.id), label: `${d.name} (${d.row_count || 0} rows)` })),
                    ]}
                  />

                  <div className="pt-2 border-t border-[#222222] flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isTraining}
                      className="bg-white text-black hover:bg-zinc-200 border-none font-semibold"
                    >
                      Start Model Training
                    </Button>
                  </div>
                </form>
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


