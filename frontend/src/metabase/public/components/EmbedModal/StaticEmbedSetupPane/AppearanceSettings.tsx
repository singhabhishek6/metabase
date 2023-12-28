import { jt, t } from "ttag";
import { Divider, SegmentedControl, Stack, Switch, Text } from "metabase/ui";
import { useSelector } from "metabase/lib/redux";
import { getDocsUrl, getSetting } from "metabase/selectors/settings";
import ExternalLink from "metabase/core/components/ExternalLink";
import { PLUGIN_SELECTORS } from "metabase/plugins";
import Select from "metabase/core/components/Select";
import { useUniqueId } from "metabase/hooks/use-unique-id";
import { color } from "metabase/lib/colors";

import type {
  ActivePreviewPane,
  EmbeddingDisplayOptions,
  EmbeddingParameters,
  EmbedResource,
  EmbedResourceType,
} from "../EmbedModal.types";
import { EmbedCodePane } from "./EmbedCodePane";
import PreviewPane from "./PreviewPane";
import {
  CODE_PREVIEW_CONTROL_OPTIONS,
  DisplayOptionSection,
  SettingsTabLayout,
} from "./StaticEmbedSetupPane.styled";
import { StaticEmbedSetupPaneSettingsContentSection } from "./StaticEmbedSetupPaneSettingsContentSection";

const THEME_OPTIONS = [
  { label: t`Light`, value: "light" },
  { label: t`Dark`, value: "night" },
  { label: t`Transparent`, value: "transparent" },
];
const DEFAULT_THEME = THEME_OPTIONS[0].value;

export interface AppearanceSettingsProps {
  activePane: ActivePreviewPane;

  resource: EmbedResource;
  resourceType: EmbedResourceType;
  iframeUrl: string;
  siteUrl: string;
  secretKey: string;
  params: EmbeddingParameters;
  displayOptions: EmbeddingDisplayOptions;
  initialEmbeddingParams: EmbeddingParameters | undefined;

  onChangePane: (pane: ActivePreviewPane) => void;
  onChangeDisplayOptions: (displayOptions: EmbeddingDisplayOptions) => void;
}

export const AppearanceSettings = ({
  activePane,
  resource,
  resourceType,
  iframeUrl,
  siteUrl,
  secretKey,
  params,
  displayOptions,
  initialEmbeddingParams,

  onChangePane,
  onChangeDisplayOptions,
}: AppearanceSettingsProps): JSX.Element => {
  const docsUrl = useSelector(state =>
    getDocsUrl(state, { page: "embedding/static-embedding" }),
  );
  const canWhitelabel = useSelector(PLUGIN_SELECTORS.canWhitelabel);
  const availableFonts = useSelector(state =>
    getSetting(state, "available-fonts"),
  );

  const fontControlLabelId = useUniqueId("display-option");

  return (
    <SettingsTabLayout
      settingsSlot={
        <>
          <StaticEmbedSetupPaneSettingsContentSection
            title={t`Customizing your embed’s appearance`}
          >
            <Text>{jt`These cosmetic options requiring changing the server code. You can play around with and preview the options here, and check out the ${(
              <ExternalLink
                key="doc"
                href={docsUrl}
              >{t`documentation`}</ExternalLink>
            )} for more.`}</Text>
          </StaticEmbedSetupPaneSettingsContentSection>
          <StaticEmbedSetupPaneSettingsContentSection
            title={t`Play with the options here`}
            mt="2rem"
          >
            <Stack spacing="1rem">
              <DisplayOptionSection title={t`Background`}>
                <SegmentedControl
                  value={displayOptions.theme || DEFAULT_THEME}
                  data={THEME_OPTIONS}
                  fullWidth
                  bg={color("bg-light")}
                  onChange={value => {
                    const newValue = value === DEFAULT_THEME ? null : value;

                    onChangeDisplayOptions({
                      ...displayOptions,
                      theme: newValue,
                    });
                  }}
                />
              </DisplayOptionSection>

              <Switch
                label={t`Dashboard title`}
                labelPosition="left"
                size="sm"
                variant="stretch"
                checked={displayOptions.titled}
                onChange={e =>
                  onChangeDisplayOptions({
                    ...displayOptions,
                    titled: e.target.checked,
                  })
                }
              />

              <Switch
                label={t`Border`}
                labelPosition="left"
                size="sm"
                variant="stretch"
                checked={displayOptions.bordered}
                onChange={e =>
                  onChangeDisplayOptions({
                    ...displayOptions,
                    bordered: e.target.checked,
                  })
                }
              />

              <DisplayOptionSection
                title={t`Font`}
                titleId={fontControlLabelId}
              >
                {canWhitelabel ? (
                  <Select
                    value={displayOptions.font}
                    options={[
                      {
                        name: t`Use instance font`,
                        value: null,
                      },
                      ...availableFonts?.map(font => ({
                        name: font,
                        value: font,
                      })),
                    ]}
                    buttonProps={{
                      "aria-labelledby": fontControlLabelId,
                    }}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      onChangeDisplayOptions({
                        ...displayOptions,
                        font: e.target.value,
                      });
                    }}
                  />
                ) : (
                  <Text>{jt`You can change the font with ${(
                    <ExternalLink href="https://www.metabase.com/pricing/">{t`a paid plan`}</ExternalLink>
                  )}.`}</Text>
                )}
              </DisplayOptionSection>

              {canWhitelabel && resourceType === "question" && (
                // We only show the "Download Data" toggle if the users are pro/enterprise
                // and they're sharing a question metabase#23477
                <DisplayOptionSection title={t`Download data`}>
                  <Switch
                    label={t`Enable users to download data from this embed?`}
                    labelPosition="left"
                    size="sm"
                    variant="stretch"
                    checked={!displayOptions.hide_download_button}
                    onChange={e =>
                      onChangeDisplayOptions({
                        ...displayOptions,
                        hide_download_button: !e.target.checked ? true : null,
                      })
                    }
                  />
                </DisplayOptionSection>
              )}
            </Stack>
          </StaticEmbedSetupPaneSettingsContentSection>
          {!canWhitelabel && (
            <>
              <Divider my="2rem" />
              <StaticEmbedSetupPaneSettingsContentSection
                title={t`Removing the “Powered by Metabase” banner`}
              >
                <Text>{jt`This banner appears on all static embeds created with the Metabase open source version. You’ll need to upgrade to ${(
                  <ExternalLink
                    key="doc"
                    href="https://www.metabase.com/pricing/"
                  >{t`a paid plan`}</ExternalLink>
                )} to remove the banner.`}</Text>
              </StaticEmbedSetupPaneSettingsContentSection>
            </>
          )}
        </>
      }
      previewSlot={
        <>
          <SegmentedControl
            value={activePane}
            data={CODE_PREVIEW_CONTROL_OPTIONS}
            onChange={onChangePane}
          />

          {activePane === "preview" ? (
            <PreviewPane
              className="flex-full"
              previewUrl={iframeUrl}
              isTransparent={displayOptions.theme === "transparent"}
            />
          ) : activePane === "code" ? (
            <EmbedCodePane
              className="flex-full w-full"
              resource={resource}
              resourceType={resourceType}
              siteUrl={siteUrl}
              secretKey={secretKey}
              params={params}
              displayOptions={displayOptions}
              showDiff
              initialEmbeddingParams={initialEmbeddingParams}
            />
          ) : null}
        </>
      }
    />
  );
};
