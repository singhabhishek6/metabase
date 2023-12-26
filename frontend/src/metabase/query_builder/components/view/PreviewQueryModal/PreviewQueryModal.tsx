import { connect } from "react-redux";
import { t } from "ttag";
import MetabaseSettings from "metabase/lib/settings";
import {
  getNativeQueryFn,
  getQuestion,
} from "metabase/query_builder/selectors";
import type { NativeQueryForm } from "metabase-types/api";
import type { State } from "metabase-types/store";
import type Question from "metabase-lib/Question";
import NativeQueryModal, { useNativeQuery } from "../NativeQueryModal";
import { ModalExternalLink } from "./PreviewQueryModal.styled";

interface PreviewQueryModalProps {
  question: Question;
  onLoadQuery: ({ pretty }: { pretty?: boolean }) => Promise<NativeQueryForm>;
  onClose?: () => void;
}

const PreviewQueryModal = ({
  question,
  onLoadQuery,
  onClose,
}: PreviewQueryModalProps): JSX.Element => {
  const { query, error, isLoading } = useNativeQuery(question, () =>
    onLoadQuery({ pretty: false }),
  );
  // XXX: https://www.notion.so/metabase/Tech-Remove-Metabase-links-outside-of-admin-settings-f88ff0fa8f574d6393c6fe5a15911b0a?pvs=4#9087a79fa2ca4d1091ef6c01886668f9
  const learnUrl = MetabaseSettings.learnUrl("debugging-sql/sql-syntax");

  return (
    <NativeQueryModal
      title={t`Query preview`}
      query={query}
      error={error}
      isLoading={isLoading}
      onClose={onClose}
    >
      {error && (
        <ModalExternalLink href={learnUrl}>
          {t`Learn how to debug SQL errors`}
        </ModalExternalLink>
      )}
    </NativeQueryModal>
  );
};

const mapStateToProps = (state: State) => ({
  // FIXME: remove the non-null assertion operator
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  question: getQuestion(state)!,
  onLoadQuery: getNativeQueryFn(state),
});

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default connect(mapStateToProps)(PreviewQueryModal);
