import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";

type SearchHeaderProps = {
  address: string;
  schoolQuery: string;
  onAddressChange: (value: string) => void;
  onSchoolQueryChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function SearchHeader({
  address,
  schoolQuery,
  onAddressChange,
  onSchoolQueryChange,
  onSubmit,
  isSubmitting
}: SearchHeaderProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="searchPanel" aria-label="Search schools">
      <form className="searchGrid" onSubmit={handleSubmit}>
        <TextInput
          label="Home address"
          placeholder="e.g. 123 Ang Mo Kio Ave 3"
          aria-label="Home address"
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
        />
        <TextInput
          label="Search school name"
          placeholder="e.g. CHIJ St. Nicholas"
          aria-label="Search school name"
          value={schoolQuery}
          onChange={(event) => onSchoolQueryChange(event.target.value)}
        />
        <Button className="searchSubmit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Find schools"}
        </Button>
      </form>
      <p className="caption">
        Transparent metrics only: distance, historical ballot pressure, intake
        changes, CCA, and affiliation pathways.
      </p>
    </section>
  );
}
