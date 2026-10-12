import { useState } from "react";

// Extended Organizer Registration & Legal Details
export function useOrganizerFields() {
  const [companyName, setCompanyName] = useState("");
  const [entityType, setEntityType] = useState("Private Corporation / LLC");
  const [representativeTitle, setRepresentativeTitle] = useState("Event Director & Authorized Representative");
  const [phone, setPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [website, setWebsite] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  // Legal & Compliance Checkboxes
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [acceptedLiability, setAcceptedLiability] = useState(true);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);
  const [certifiedAuthorized, setCertifiedAuthorized] = useState(true);

  return {
    companyName, setCompanyName, entityType, setEntityType,
    representativeTitle, setRepresentativeTitle, phone, setPhone,
    businessAddress, setBusinessAddress, taxId, setTaxId, website, setWebsite,
    bankName, setBankName, bankAccountName, setBankAccountName,
    bankAccountNumber, setBankAccountNumber,
    acceptedTerms, setAcceptedTerms, acceptedLiability, setAcceptedLiability,
    acceptedPrivacy, setAcceptedPrivacy, certifiedAuthorized, setCertifiedAuthorized,
  };
}

export type OrganizerFields = ReturnType<typeof useOrganizerFields>;



