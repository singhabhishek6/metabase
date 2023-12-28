import { useState } from "react";
import _ from "underscore";
import { getSignedPreviewUrl } from "metabase/public/lib/embed";
import { getSetting } from "metabase/selectors/settings";
import { useSelector } from "metabase/lib/redux";
import type { ExportFormatType } from "metabase/dashboard/components/PublicLinkPopover/types";

import { StaticEmbedSetupPane } from "../StaticEmbedSetupPane";
import type {
  ActivePreviewPane,
  EmbeddingDisplayOptions,
  EmbeddingParameters,
  EmbeddingParametersValues,
  EmbedResource,
  EmbedResourceParameter,
  EmbedResourceType,
  EmbedType,
} from "../EmbedModal.types";
import { SelectEmbedTypePane } from "../SelectEmbedTypePane";
import { EmbedModalContentStatusBar } from "./EmbedModalContentStatusBar";

const FALLBACK_SECRET_KEY = "<METABASE_SECRET_KEY>";

export interface EmbedModalContentProps {
  embedType: EmbedType;
  setEmbedType: (type: EmbedType) => void;

  resource: EmbedResource;
  resourceType: EmbedResourceType;
  resourceParameters: EmbedResourceParameter[];

  onUpdateEnableEmbedding: (enableEmbedding: boolean) => void;
  onUpdateEmbeddingParams: (embeddingParams: EmbeddingParameters) => void;

  onCreatePublicLink: () => void;
  onDeletePublicLink: () => void;
  getPublicUrl: (
    resource: EmbedResource,
    extension?: ExportFormatType,
  ) => string | null;

  className?: string;
}

export const EmbedModalContent = (
  props: EmbedModalContentProps,
): JSX.Element => {
  const {
    embedType,
    setEmbedType,
    resource,
    resourceType,
    resourceParameters,
    onUpdateEnableEmbedding,
    onUpdateEmbeddingParams,
    onCreatePublicLink,
    onDeletePublicLink,
    getPublicUrl,
  } = props;

  const [pane, setPane] = useState<ActivePreviewPane>("code");

  const siteUrl = useSelector(state => getSetting(state, "site-url"));
  const secretKey =
    useSelector(state => getSetting(state, "embedding-secret-key")) ||
    // "secretKey" should always exist if embedding has been turned on, but to fix typings we add here a fallback value
    FALLBACK_SECRET_KEY;

  const initialEmbeddingParams = getDefaultEmbeddingParams(
    resource,
    resourceParameters,
  );

  const [embeddingParams, setEmbeddingParams] = useState<EmbeddingParameters>(
    initialEmbeddingParams,
  );
  const [parameterValues, setParameterValues] =
    useState<EmbeddingParametersValues>({});
  const [displayOptions, setDisplayOptions] = useState<EmbeddingDisplayOptions>(
    {
      font: null,
      theme: null,
      bordered: true,
      titled: true,
    },
  );

  const handleSave = async () => {
    try {
      if (embedType === "application") {
        if (!resource.enable_embedding) {
          await onUpdateEnableEmbedding(true);
        }
        await onUpdateEmbeddingParams(embeddingParams);
      } else {
        if (!resource.public_uuid) {
          await onCreatePublicLink();
        }
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleUnpublish = async () => {
    try {
      await onUpdateEnableEmbedding(false);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDiscard = () => {
    setEmbeddingParams(getDefaultEmbeddingParams(resource, resourceParameters));
  };

  const getPreviewParamsBySlug = () => {
    const lockedParameters = getPreviewParameters(
      resourceParameters,
      embeddingParams,
    );

    return Object.fromEntries(
      lockedParameters.map(parameter => [
        parameter.slug,
        parameterValues[parameter.id] ?? null,
      ]),
    );
  };

  const previewParametersBySlug = getPreviewParamsBySlug();
  const previewParameters = getPreviewParameters(
    resourceParameters,
    embeddingParams,
  );

  if (!embedType) {
    return (
      <SelectEmbedTypePane
        resource={resource}
        resourceType={resourceType}
        onCreatePublicLink={onCreatePublicLink}
        onDeletePublicLink={onDeletePublicLink}
        getPublicUrl={getPublicUrl}
        onChangeEmbedType={setEmbedType}
      />
    );
  }

  const hasSettingsChanges = !_.isEqual(
    initialEmbeddingParams,
    embeddingParams,
  );

  return (
    <div className="flex flex-column full-height">
      <EmbedModalContentStatusBar
        resourceType={resourceType}
        isEmbeddingEnabled={resource.enable_embedding}
        hasSettingsChanges={hasSettingsChanges}
        onSave={handleSave}
        onUnpublish={handleUnpublish}
        onDiscard={handleDiscard}
      />

      <div className="flex flex-full">
        <StaticEmbedSetupPane
          activePane={pane}
          resource={resource}
          resourceType={resourceType}
          iframeUrl={getSignedPreviewUrl(
            siteUrl,
            resourceType,
            resource.id,
            previewParametersBySlug,
            displayOptions,
            secretKey,
            embeddingParams,
          )}
          siteUrl={siteUrl}
          secretKey={secretKey}
          params={previewParametersBySlug}
          displayOptions={displayOptions}
          previewParameters={previewParameters}
          parameterValues={parameterValues}
          resourceParameters={resourceParameters}
          initialEmbeddingParams={initialEmbeddingParams}
          embeddingParams={embeddingParams}
          onChangeDisplayOptions={setDisplayOptions}
          onChangeEmbeddingParameters={setEmbeddingParams}
          onChangeParameterValue={(id: string, value: string) =>
            setParameterValues(prevState => ({
              ...prevState,
              [id]: value,
            }))
          }
          onChangePane={setPane}
        />
      </div>
    </div>
  );
};

function getDefaultEmbeddingParams(
  resource: EmbedResource,
  resourceParameters: EmbedResourceParameter[],
) {
  return filterValidResourceParameters(
    resourceParameters,
    resource.embedding_params || {},
  );
}

function filterValidResourceParameters(
  resourceParameters: EmbedResourceParameter[],
  embeddingParams: EmbeddingParameters,
) {
  const validParameters = resourceParameters.map(parameter => parameter.slug);

  return _.pick(embeddingParams, validParameters);
}

function getPreviewParameters(
  resourceParameters: EmbedResourceParameter[],
  embeddingParams: EmbeddingParameters,
) {
  return resourceParameters.filter(
    parameter => embeddingParams[parameter.slug] === "locked",
  );
}
