import { Button, Surface, Textarea } from "@irshadnazree/just-things-ui";
import { CopyIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { SectionHeading } from "@/components/shared/page-header";
import {
  useAddTerm,
  useDuplicateTerm,
  useQuotationTerms,
  useRemoveTerm,
  useUpdateTerm,
} from "@/stores/quotation-store";

export default function TermsSection() {
  const terms = useQuotationTerms();
  const addTerm = useAddTerm();
  const duplicateTerm = useDuplicateTerm();
  const removeTerm = useRemoveTerm();
  const updateTerm = useUpdateTerm();

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        action={
          terms.length > 0 && (
            <Button onClick={() => addTerm()} size="sm" variant="link">
              <PlusIcon size={14} weight="bold" />
              Add term
            </Button>
          )
        }
      >
        Terms and conditions
      </SectionHeading>
      <div className="flex flex-col gap-4">
        {terms.length === 0 && (
          <Surface
            className="flex flex-col items-center justify-center"
            variant="dashed"
          >
            <Button onClick={() => addTerm()} size="sm">
              <PlusIcon size={14} weight="bold" />
              Add a term
            </Button>
          </Surface>
        )}
        {terms.map((term, index) => {
          const termNumber = index + 1;

          return (
            <Surface className="flex flex-col gap-3" key={`term-${termNumber}`}>
              <div className="flex items-center justify-between">
                <h3 className="jt-label">Term {termNumber}</h3>
                <div className="flex items-center gap-1">
                  <Button
                    aria-label={`Duplicate term ${termNumber}`}
                    iconOnly
                    onClick={() => duplicateTerm(index)}
                    size="sm"
                    title="Duplicate"
                    variant="ghost"
                  >
                    <CopyIcon size={14} />
                  </Button>
                  <Button
                    aria-label={`Remove term ${termNumber}`}
                    iconOnly
                    onClick={() => removeTerm(index)}
                    size="sm"
                    title="Remove"
                    variant="ghost"
                  >
                    <TrashIcon size={14} />
                  </Button>
                </div>
              </div>
              <Textarea
                aria-label={`Term ${termNumber}`}
                onChange={(event) => updateTerm(index, event.target.value)}
                placeholder="Enter term"
                rows={5}
                value={term}
              />
            </Surface>
          );
        })}
      </div>
    </section>
  );
}
