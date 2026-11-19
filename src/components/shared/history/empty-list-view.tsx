import { Button, EmptyState, Surface } from "@irshadnazree/just-things-ui";
import { FileTextIcon, PlusIcon } from "@phosphor-icons/react";

type EmptyListViewProps = {
  title: string;
  handleCreate: () => void;
};

export default function EmptyListView({
  title,
  handleCreate,
}: EmptyListViewProps) {
  const itemLabel = title.endsWith("s") ? title.slice(0, -1) : title;

  return (
    <Surface variant="dashed">
      <EmptyState
        actions={
          <Button onClick={handleCreate} variant="primary">
            <PlusIcon size={16} weight="bold" />
            Create {itemLabel}
          </Button>
        }
        description={`Create your first ${itemLabel} to get started.`}
        icon={<FileTextIcon size={40} weight="duotone" />}
        title={`No ${title} yet`}
      />
    </Surface>
  );
}
