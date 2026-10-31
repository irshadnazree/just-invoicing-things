import { CopyIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import {
  useAddTerm,
  useDuplicateTerm,
  useQuotationTerms,
  useRemoveTerm,
  useUpdateTerm,
} from "@/stores/quotation-store";
import type { QuotationStore } from "@/types/quotation";

export default function TermsSection() {
  const terms = useQuotationTerms();
  const addTerm = useAddTerm();
  const duplicateTerm = useDuplicateTerm();
  const removeTerm = useRemoveTerm();
  const updateTerm = useUpdateTerm();

  function handleAddTerm() {
    addTerm();
  }

  function handleDuplicateTerm(index: number) {
    duplicateTerm(index);
  }

  function handleRemoveTerm(index: number) {
    removeTerm(index);
  }

  const handleUpdateTerm: QuotationStore["updateTerm"] = (index, value) =>
    updateTerm(index, value);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b-2 pb-1">
        <h3 className="border-text font-semibold text-lg">
          Terms and Conditions Details
        </h3>
        {terms.length > 0 && (
          <Button
            icon={<PlusIcon size={22} weight="bold" />}
            onClick={handleAddTerm}
            size="sm"
            variant="ghost"
          >
            Add Term
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {terms.length === 0 && (
          <Card
            className="flex flex-col items-center justify-center gap-2"
            variant="placeholder"
          >
            <Button
              icon={<PlusIcon size={18} />}
              onClick={handleAddTerm}
              size="sm"
              variant="ghost"
            >
              Add New Term
            </Button>
          </Card>
        )}
        {terms.map((term, index) => (
          <Card key={`term-${index + 1}`}>
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-semibold text-lg">Term {index + 1}</h3>
              <div className="flex items-center">
                <Button
                  icon={<CopyIcon size={18} />}
                  onClick={() => handleDuplicateTerm(index)}
                  size="sm"
                  variant="ghost"
                />

                <Button
                  icon={<TrashIcon size={18} />}
                  onClick={() => handleRemoveTerm(index)}
                  size="sm"
                  variant="ghost"
                />
              </div>
            </div>
            <Textarea
              id={`term-${index}`}
              onChange={(value) => handleUpdateTerm(index, value as string)}
              placeholder="Enter term"
              value={term}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
