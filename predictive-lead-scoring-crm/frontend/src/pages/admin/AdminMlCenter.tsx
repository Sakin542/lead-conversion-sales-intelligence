import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { adminApi } from '../../services/api';
import { Bot, Play, CheckCircle2, Cpu, RefreshCw, Layers } from 'lucide-react';

export const AdminMlCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'comparison' | 'feature-importance' | 'predictions' | 'training'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<Record<string, number>>({});
  const [predictions, setPredictions] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
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
      const [ovRes, mdRes, fiRes, prRes, dsRes, compRes] = await Promise.all([
        adminApi.getMlOverview(),
        adminApi.getMlModels(),
        adminApi.getFeatureImportance(),
        adminApi.getPredictions(1),
        adminApi.getDatasets(),
        adminApi.compareMlModels(),
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMlData();
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
              Monitor production predictive models, evaluate metrics, compare algorithms, and run model retraining workflows.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchMlData}
            className="border-[#222222] text-zinc-300 hover:bg-[#151515] hover:text-white"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh ML Engine
          </Button>
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

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && overview && (
              <div className="space-y-6">
                <Card className="p-6 bg-[#111111] border-[#222222] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Production Model Status</span>
                    <Badge variant="success" size="md">Production Active</Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#151515] border border-[#222222] text-purple-400 flex items-center justify-center font-bold">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white">{overview.name}</h2>
                      <p className="text-xs text-zinc-400">Version {overview.version} • Trained with 12,450 records</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Accuracy</span>
                      <p className="text-lg font-black text-emerald-400">{overview.accuracy * 100}%</p>
                    </div>
                    <div className="p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Precision</span>
                      <p className="text-lg font-black text-purple-400">{overview.precision * 100}%</p>
                    </div>
                    <div className="p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Recall</span>
                      <p className="text-lg font-black text-purple-300">{overview.recall * 100}%</p>
                    </div>
                    <div className="p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">F1 Score</span>
                      <p className="text-lg font-black text-white">{overview.f1_score}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* MODEL VERSION HISTORY TAB */}
            {activeTab === 'models' && (
              <Card className="p-5 bg-[#111111] border-[#222222] space-y-4">
                <h3 className="text-sm font-bold text-white">Model Version History</h3>

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
                        <th className="px-4 py-3 text-right">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {models.map((m) => (
                        <tr key={m.id} className="hover:bg-[#151515]">
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
                      <span className="text-[10px] font-bold text-purple-400 uppercase">Best F1 Score Model</span>
                      <p className="text-lg font-black text-white">{comparisonHighlights.best_f1}</p>
                    </Card>
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Best Accuracy Model</span>
                      <p className="text-lg font-black text-white">{comparisonHighlights.best_accuracy}</p>
                    </Card>
                    <Card className="p-4 bg-[#111111] border-[#222222] space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Current Production Model</span>
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
                              {m.name} ({m.version ?? 'v1.0'})
                              {m.is_active && <span className="block text-[9px] text-emerald-400 font-normal">Active Production</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Accuracy</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-bold text-emerald-400">{m.accuracy ? roundNum(m.accuracy * 100) + '%' : 'N/A'}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Precision</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-purple-400">{m.precision ? roundNum(m.precision * 100) + '%' : 'N/A'}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">Recall</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-purple-300">{m.recall ? roundNum(m.recall * 100) + '%' : 'N/A'}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">F1 Score</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-white">{m.f1_score ?? 'N/A'}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-bold text-zinc-300">ROC-AUC</td>
                          {comparisonList.map((m) => (
                            <td key={m.id} className="px-4 py-3 font-semibold text-amber-400">{m.roc_auc ?? 'N/A'}</td>
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
                <h3 className="text-sm font-bold text-white">Active Model Feature Importance Breakdown</h3>

                <div className="space-y-3">
                  {Object.entries(featureImportance).map(([feat, val]) => {
                    const percentage = Math.round(val * 100);
                    return (
                      <div key={feat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-200">{feat}</span>
                          <span className="text-purple-400 font-mono">{percentage}%</span>
                        </div>
                        <div className="w-full bg-[#0A0A0A] rounded-full h-3 border border-[#222222] overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
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
                <h3 className="text-sm font-bold text-white">Live Prediction Stream</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-[#0A0A0A] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#222222]">
                      <tr>
                        <th className="px-4 py-3">Lead</th>
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Probability</th>
                        <th className="px-4 py-3">Classification</th>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3 text-right">Predicted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {predictions.map((p) => (
                        <tr key={p.id} className="hover:bg-[#151515]">
                          <td className="px-4 py-3 font-bold text-white">{p.lead_name}</td>
                          <td className="px-4 py-3 text-zinc-400">{p.company}</td>
                          <td className="px-4 py-3 font-black text-purple-400">{p.score}</td>
                          <td className="px-4 py-3 font-bold text-emerald-400">{p.conversion_probability}</td>
                          <td className="px-4 py-3">
                            <Badge variant={p.temperature === 'HOT' ? 'warning' : p.temperature === 'WARM' ? 'primary' : 'neutral'} size="sm">
                              {p.temperature}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-400">{p.model}</td>
                          <td className="px-4 py-3 text-right text-zinc-400">{p.predicted_at}</td>
                        </tr>
                      ))}
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
                    Configure dataset preprocessing, feature engineering, and execute model training.
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
                      { value: 'XGBoost', label: 'XGBoost (Recommended)' },
                      { value: 'Random Forest', label: 'Random Forest' },
                      { value: 'Logistic Regression', label: 'Logistic Regression' },
                    ]}
                  />

                  <Select
                    label="Training Dataset"
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                    options={[
                      { value: '', label: 'Use Production Database Leads' },
                      ...datasets.map((d) => ({ value: String(d.id), label: `${d.name} (${d.row_count} rows)` })),
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
                <p className="text-zinc-400">This will make it the production model for all future lead scoring predictions in the system.</p>
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

function roundNum(val: number) {
  return Math.round(val * 10) / 10;
}

export default AdminMlCenter;

