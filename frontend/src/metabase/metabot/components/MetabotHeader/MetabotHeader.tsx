import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {push} from "react-router-redux";
import {jt, t} from "ttag";
import * as Urls from "metabase/lib/urls";
import {getUser} from "metabase/selectors/user";
import {DatabaseId, MetabotFeedbackType, User} from "metabase-types/api";
import {Dispatch, MetabotQueryStatus, State} from "metabase-types/store";
import Question from "metabase-lib/Question";
import Database from "metabase-lib/metadata/Database";
import {cancelQuery, runPromptQuery, updatePrompt} from "../../actions";
import {getFeedbackType, getQueryStatus, getPrompt} from "../../selectors";
import MetabotMessage from "../MetabotMessage";

interface OwnProps {
    model?: Question;
    database?: Database;
    databases?: Database[];
}

interface StateProps {
    prompt: string;
    queryStatus: MetabotQueryStatus;
    feedbackType: MetabotFeedbackType | null;
    user: User | null;
}

interface DispatchProps {
    onChangePrompt: (prompt: string) => void;
    onSubmitPrompt: () => void;
    onDatabaseChange: (databaseId: DatabaseId) => void;
    onCancel: () => void;
}

type MetabotHeaderProps = OwnProps & StateProps & DispatchProps;

const mapStateToProps = (state: State): StateProps => ({
    prompt: getPrompt(state),
    queryStatus: getQueryStatus(state),
    feedbackType: getFeedbackType(state),
    user: getUser(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onChangePrompt: prompt => dispatch(updatePrompt(prompt)),
    onSubmitPrompt: () => dispatch(runPromptQuery()),
    onDatabaseChange: databaseId => push(Urls.databaseMetabot(databaseId)),
    onCancel: () => dispatch(cancelQuery()),
});

const MetabotHeader = ({
                           prompt,
                           queryStatus,
                           model,
                           database,
                           databases = [],
                           user,
                           onChangePrompt,
                           onSubmitPrompt,
                           onDatabaseChange,
                           onCancel,
                       }: MetabotHeaderProps) => {
    const [isLoadedRecently, setIsLoadedRecently] = useState(false);

    useEffect(() => {
        if (queryStatus !== "complete") {
            return;
        }

        setIsLoadedRecently(true);
        const timerId = setTimeout(() => setIsLoadedRecently(false), 5000);
        return () => clearTimeout(timerId);
    }, [queryStatus]);

    const title = getTitle(
        prompt,
        model,
        database,
        databases,
        user,
        queryStatus === "running"
    );

    return (
        <MetabotMessage>{title}</MetabotMessage>
    );
};

const getTitle = (
    prompt: string,
    model: Question | undefined,
    database: Database | undefined,
    databases: Database[],
    user: User | null,
    isLoading: boolean,
) => {
    if (isLoading) {
        return `Computing the data for "${prompt}"`
    }

    return `Here is the data for your question: "${prompt}"`
};

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default connect(mapStateToProps, mapDispatchToProps)(MetabotHeader);
