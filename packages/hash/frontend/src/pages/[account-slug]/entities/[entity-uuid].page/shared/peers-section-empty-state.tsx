import { Chip } from "@hashintel/hash-design-system";
import { Icon } from "../../../../../shared/icons/icon";
import { SectionEmptyState } from "../../../shared/section-empty-state";
import { SectionWrapper } from "../../../shared/section-wrapper";

export const PeersSectionEmptyState = () => {
  return (
    <SectionWrapper title="Peers" titleStartContent={<Chip label="No peers" />}>
      <SectionEmptyState
        title="This entity currently has no known peers"
        titleIcon={<Icon icon="shapes" style={{ fontSize: 24 }} />}
        description="Peers are instances of a concept found in other graphs. These are
      common, as different users often want to represent the same entities
      in varying ways (e.g. attaching additional information, or providing
      alternative values for properties)"
      />
    </SectionWrapper>
  );
};
