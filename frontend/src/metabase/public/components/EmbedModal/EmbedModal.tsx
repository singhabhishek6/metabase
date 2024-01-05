import { useState } from "react";
import { getIsPaidPlan, getSetting } from "metabase/selectors/settings";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { getApplicationName } from "metabase/selectors/whitelabel";
import { Icon } from "metabase/core/components/Icon";
import Modal from "metabase/components/Modal";
import type { WindowModalProps } from "metabase/components/Modal/WindowModal";
import { Box, Button, Text } from "metabase/ui";
import { updateSetting } from "metabase/admin/settings/settings";
import { EmbedTitleContainer } from "./EmbedModal.styled";

export type EmbedModalStep = "application" | "legalese" | null;

const EmbedTitle = ({
  embedStep,
  onClick,
}: {
  embedStep: EmbedModalStep;
  onClick?: () => void;
}) => {
  const applicationName = useSelector(getApplicationName);

  const label =
    embedStep === null ? `Embed ${applicationName}` : `Static embedding`;

  return (
    <EmbedTitleContainer isActive={embedStep !== null} onClick={onClick}>
      {embedStep !== null && <Icon name="chevronleft" />}
      <Text fz="xl" c="text.1">
        {label}
      </Text>
    </EmbedTitleContainer>
  );
};

export const EmbedModal = ({
  children,
  isOpen,
  onClose,
  ...modalProps
}: {
  isOpen?: boolean;
  onClose: () => void;
  children: ({
    embedType,
    goToNextStep,
    goToPreviousStep,
  }: {
    embedType: EmbedModalStep;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
  }) => JSX.Element;
} & WindowModalProps) => {
  const hasAcceptedTerms = useSelector(state =>
    getSetting(state, "has-accepted-embedding-terms"),
  );

  const shouldSkipLegaleseStep = hasAcceptedTerms;

  const [embedType, setEmbedType] = useState<EmbedModalStep>(null);

  const goToNextStep = () => {
    if (embedType === null && !shouldSkipLegaleseStep) {
      setEmbedType("legalese");
    } else {
      setEmbedType("application");
    }
  };

  // TODO: this is purely for debugging
  const dispatch = useDispatch();
  const resetSetting = () => {
    dispatch(
      updateSetting({
        key: "has-accepted-embedding-terms",
        value: false,
      }),
    );
  };

  const goToPreviousStep = () => {
    setEmbedType(null);
  };

  const onEmbedClose = () => {
    onClose();
    setEmbedType(null);
  };

  const isFullScreen = embedType === "application";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onEmbedClose}
      title={
        <Box>
          <EmbedTitle embedStep={embedType} onClick={goToPreviousStep} />
          <Button color="red" onClick={resetSetting}>
            Reset
          </Button>
        </Box>
      }
      fit={!isFullScreen}
      full={isFullScreen}
      formModal={false}
      {...modalProps}
    >
      <Box bg="bg.0" h="100%">
        {children({ embedType, goToNextStep, goToPreviousStep })}
      </Box>
    </Modal>
  );
};
