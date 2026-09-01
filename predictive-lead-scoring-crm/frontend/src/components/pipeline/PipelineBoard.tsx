import React from 'react';
import { Deal, PipelineStage } from '../../types/pipeline';
import PipelineColumn from './PipelineColumn';

interface PipelineBoardProps {
  stages: PipelineStage[];
  allDeals: Deal[];
  onStageChange: (dealId: number, newStageId: number) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onAddDeal: (stageId: number) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  stages,
  allDeals,
  onStageChange,
  onEditDeal,
  onDeleteDeal,
  onAddDeal,
}) => {
  return (
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex items-start space-x-4 min-w-max">
        {stages.map((stage) => {
          const stageDeals = allDeals.filter((d) => d.pipeline_stage_id === stage.id);
          return (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              stages={stages}
              deals={stageDeals}
              onStageChange={onStageChange}
              onEditDeal={onEditDeal}
              onDeleteDeal={onDeleteDeal}
              onAddDeal={onAddDeal}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PipelineBoard;

