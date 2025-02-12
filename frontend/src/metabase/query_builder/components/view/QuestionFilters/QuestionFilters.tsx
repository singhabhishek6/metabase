import { FilterPanel, FilterPanelButton } from "metabase/querying";

import type { QueryBuilderMode } from "metabase-types/store";

import type * as Lib from "metabase-lib";
import type Question from "metabase-lib/Question";
import type LegacyQuery from "metabase-lib/queries/StructuredQuery";

interface FilterHeaderToggleProps {
  className?: string;
  query: Lib.Query;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export function FilterHeaderToggle({
  className,
  query,
  isExpanded,
  onExpand,
  onCollapse,
}: FilterHeaderToggleProps) {
  return (
    <div className={className}>
      <FilterPanelButton
        query={query}
        isExpanded={isExpanded}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    </div>
  );
}

interface FilterHeaderProps {
  question: Question;
  expanded: boolean;
  updateQuestion: (question: Question, opts: { run: boolean }) => void;
}

export function FilterHeader({
  question,
  expanded,
  updateQuestion,
}: FilterHeaderProps) {
  const query = question.query();

  const handleChange = (query: Lib.Query) => {
    updateQuestion(question._setMLv2Query(query), { run: true });
  };

  if (!expanded) {
    return null;
  }

  return <FilterPanel query={query} onChange={handleChange} />;
}

type RenderCheckOpts = {
  question: Question;
  queryBuilderMode: QueryBuilderMode;
  isObjectDetail: boolean;
};

const shouldRender = ({
  question,
  queryBuilderMode,
  isObjectDetail,
}: RenderCheckOpts) =>
  queryBuilderMode === "view" &&
  question.isStructured() &&
  question.isQueryEditable() &&
  (question.legacyQuery() as LegacyQuery).topLevelFilters().length > 0 &&
  !isObjectDetail;

FilterHeader.shouldRender = shouldRender;
FilterHeaderToggle.shouldRender = shouldRender;
