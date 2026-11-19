import { Button, EmptyState, Surface } from "@irshadnazree/just-things-ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export default function NoResultSection({
  title,
  setSearchTerm,
}: {
  title: string;
  setSearchTerm: (searchTerm: string) => void;
}) {
  return (
    <Surface variant="dashed">
      <EmptyState
        actions={
          <Button onClick={() => setSearchTerm("")}>Clear search</Button>
        }
        description="Try different search terms."
        icon={<MagnifyingGlassIcon size={40} weight="duotone" />}
        title={`No ${title} found`}
      />
    </Surface>
  );
}
