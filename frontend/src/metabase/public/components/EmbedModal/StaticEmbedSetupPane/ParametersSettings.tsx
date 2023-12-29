import { t } from "ttag";
import type { ChangeEvent } from "react";
import { useMemo } from "react";
import { Icon } from "metabase/core/components/Icon";
import { color } from "metabase/lib/colors";
import Select, { Option } from "metabase/core/components/Select";
import { Box, Divider, SegmentedControl, Stack, Text } from "metabase/ui";
import { ParameterWidget as StaticParameterWidget } from "metabase/parameters/components/ParameterWidget";
import type {
  EmbeddingDisplayOptions,
  EmbeddingParameters,
  EmbeddingParametersValues,
  EmbedResource,
  EmbedResourceParameter,
  EmbedResourceType,
} from "metabase/public/lib/types";
import { getValuePopulatedParameters } from "metabase-lib/parameters/utils/parameter-values";

import type {
  ActivePreviewPane,
  EmbedResourceParameterWithValue,
} from "../EmbedModal.types";
import { EmbedCodePane } from "./EmbedCodePane";
import PreviewPane from "./PreviewPane";
import {
  CODE_PREVIEW_CONTROL_OPTIONS,
  SettingsTabLayout,
} from "./StaticEmbedSetupPane.styled";
import { StaticEmbedSetupPaneSettingsContentSection } from "./StaticEmbedSetupPaneSettingsContentSection";

export interface ParametersSettingsProps {
  activePane: ActivePreviewPane;

  resource: EmbedResource;
  resourceType: EmbedResourceType;
  resourceParameters: EmbedResourceParameter[];

  initialEmbeddingParams: EmbeddingParameters | undefined;
  embeddingParams: EmbeddingParameters;
  previewParameters: EmbedResourceParameter[];
  parameterValues: EmbeddingParametersValues;

  iframeUrl: string;
  siteUrl: string;
  secretKey: string;
  params: EmbeddingParameters;
  displayOptions: EmbeddingDisplayOptions;

  onChangeEmbeddingParameters: (parameters: EmbeddingParameters) => void;
  onChangeParameterValue: (id: string, value: string) => void;

  onChangePane: (pane: ActivePreviewPane) => void;
}

export const ParametersSettings = ({
  activePane,
  resource,
  resourceType,
  resourceParameters,
  initialEmbeddingParams,
  embeddingParams,
  previewParameters,
  parameterValues,
  displayOptions,
  iframeUrl,
  siteUrl,
  secretKey,
  params,
  onChangeEmbeddingParameters,
  onChangeParameterValue,
  onChangePane,
}: ParametersSettingsProps): JSX.Element => {
  const valuePopulatedParameters = useMemo(
    () =>
      getValuePopulatedParameters(
        previewParameters,
        parameterValues,
      ) as EmbedResourceParameterWithValue[],
    [previewParameters, parameterValues],
  );

  return (
    <SettingsTabLayout
      settingsSlot={
        resourceParameters.length > 0 ? (
          <>
            <StaticEmbedSetupPaneSettingsContentSection
              title={t`Enable or lock parameters`}
            >
              <Stack spacing="1rem">
                <Text>{t`Enabling a parameter lets viewers interact with it. Locking one lets you pass it a value from your app while hiding it from viewers.`}</Text>

                {resourceParameters.map(parameter => (
                  <div key={parameter.id} className="flex align-center">
                    <Icon
                      name={getIconForParameter(parameter)}
                      className="mr2"
                      style={{ color: color("text-light") }}
                    />
                    <h3>{parameter.name}</h3>
                    <Select
                      buttonProps={{
                        "aria-label": parameter.name,
                      }}
                      className="ml-auto bg-white"
                      value={embeddingParams[parameter.slug] || "disabled"}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        onChangeEmbeddingParameters({
                          ...embeddingParams,
                          [parameter.slug]: e.target.value,
                        })
                      }
                    >
                      <Option
                        icon="close"
                        value="disabled"
                      >{t`Disabled`}</Option>
                      <Option
                        icon="pencil"
                        value="enabled"
                      >{t`Editable`}</Option>
                      <Option icon="lock" value="locked">{t`Locked`}</Option>
                    </Select>
                  </div>
                ))}
              </Stack>
            </StaticEmbedSetupPaneSettingsContentSection>

            {previewParameters.length > 0 && (
              <>
                <Divider my="2rem" />
                <StaticEmbedSetupPaneSettingsContentSection
                  title={t`Preview locked parameters`}
                >
                  <Stack spacing="1rem">
                    <Text>{t`Try passing some sample values to your locked parameters here. Your server will have to provide the actual values in the signed token when doing this for real.`}</Text>

                    {valuePopulatedParameters.map(parameter => (
                      <StaticParameterWidget
                        key={parameter.id}
                        className="m0"
                        parameter={parameter}
                        parameters={valuePopulatedParameters}
                        setValue={(value: string) => {
                          onChangeParameterValue(parameter.id, value);

                          if (!parameter.value && value) {
                            onChangePane("preview");
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </StaticEmbedSetupPaneSettingsContentSection>
              </>
            )}
          </>
        ) : (
          <>
            <Box mb="2rem">
              {t`This ${resourceType} doesn't have any parameters to configure yet.`}
            </Box>
            <Divider />
          </>
        )
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
              showDiff
              variant="parameters"
              resource={resource}
              resourceType={resourceType}
              siteUrl={siteUrl}
              secretKey={secretKey}
              initialEmbeddingParams={initialEmbeddingParams}
              params={params}
              displayOptions={displayOptions}
            />
          ) : null}
        </>
      }
    />
  );
};

const getIconForParameter = (parameter: EmbedResourceParameter) =>
  parameter.type === "category"
    ? "string"
    : parameter.type.indexOf("date/") === 0
    ? "calendar"
    : "unknown";
