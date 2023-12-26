import { t } from "ttag";

import MetabaseSettings from "metabase/lib/settings";
import ExternalLink from "metabase/core/components/ExternalLink";
import { CaveatText } from "./CaveatMessage.styled";

function CaveatMessage() {
  return (
    <CaveatText>
      {t`Recipients will see this data just as you see it, regardless of their permissions.`}
      &nbsp;
      <ExternalLink
        className="link"
        target="_blank"
        // XXX: https://www.notion.so/metabase/Tech-Remove-Metabase-links-outside-of-admin-settings-f88ff0fa8f574d6393c6fe5a15911b0a?pvs=4#75bafcbbbb7a4bfba0e5a2bc9e7f21de

        href={MetabaseSettings.docsUrl("dashboards/subscriptions")}
      >
        {t`Learn more`}
      </ExternalLink>
      .
    </CaveatText>
  );
}

export default CaveatMessage;
