import { useState } from "react";
import { connect } from "react-redux";
import _ from "underscore";
import { checkNotNull } from "metabase/lib/types";
import ExplicitSize from "metabase/components/ExplicitSize";
import NativeQueryEditor from "metabase/query_builder/components/NativeQueryEditor";
import type { State } from "metabase-types/store";
import type Question from "metabase-lib/Question";
import type NativeQuery from "metabase-lib/queries/NativeQuery";
import { cancelQuery, runQuestionQuery, updateQuestion } from "../../actions";
import { getQuestion } from "../../selectors";

const SIDEBAR_FEATURES = {
  dataReference: false,
  variables: false,
  snippets: false,
};

const RESIZABLE_BOX_PROPS = {
  resizeHandles: [],
};

interface OwnProps {
  height: number;
}

interface StateProps {
  question: Question;
}

interface DispatchProps {
  onRunQuery: () => void;
  onCancelQuery: () => void;
  onChangeQuery: (question: Question) => void;
}

type MetabotQueryEditorProps = OwnProps & StateProps & DispatchProps;

const mapStateToProps = (state: State): StateProps => ({
  question: checkNotNull(getQuestion(state)),
});

const mapDispatchToProps: DispatchProps = {
  onRunQuery: runQuestionQuery,
  onChangeQuery: updateQuestion,
  onCancelQuery: cancelQuery,
};

const MetabotQueryEditor = ({
  question,
  height,
  onRunQuery,
  onCancelQuery,
  onChangeQuery,
}: MetabotQueryEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleChange = (query: NativeQuery) => onChangeQuery(query.question());

  return (
    <NativeQueryEditor
      cancelQueryOnLeave={false}
      question={question}
      query={question.legacyQuery()}
      viewHeight={height}
      resizable={false}
      hasParametersList={false}
      canChangeDatabase={false}
      isRunnable={true}
      isInitiallyOpen={false}
      isNativeEditorOpen={isOpen}
      runQuestionQuery={onRunQuery}
      cancelQuery={onCancelQuery}
      setDatasetQuery={handleChange}
      setIsNativeEditorOpen={setIsOpen}
      sidebarFeatures={SIDEBAR_FEATURES}
      resizableBoxProps={RESIZABLE_BOX_PROPS}
    />
  );
};

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default _.compose(
  ExplicitSize(),
  connect(mapStateToProps, mapDispatchToProps),
)(MetabotQueryEditor);
