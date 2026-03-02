import { useState } from "react";
import { message } from "antd";

export const useUserProgressLogic = ({
  categories,
  courseCodeId,
  emailId,
  contactId,
  onSubmit,
  existingProgressRows // ✅ NEW: pass raw progress rows here
}) => {
  const [selectedLessons, setSelectedLessons] = useState({});

  const selectionKey = (categoryId, classNumber) => `${categoryId}-${classNumber}`;

  const handleCheckboxChange = (categoryId, classNumber) => {
    const key = selectionKey(categoryId, classNumber);

    setSelectedLessons((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { categoryId, classNumber, participationTypeId: null };
      return next;
    });
  };

  const handleParticipationTypeChange = (categoryId, classNumber, participationTypeId) => {
    const key = selectionKey(categoryId, classNumber);
    setSelectedLessons((prev) => ({
      ...prev,
      [key]: { ...prev[key], participationTypeId }
    }));
  };

  const handleSubmit = () => {
    if (!contactId) {
      message.error("Missing contactId (ContactInternalId). Cannot submit.");
      return;
    }
    if (!emailId) {
      message.error("Please select an email before submitting.");
      return;
    }

    // Validate dropdown-required selections
    const missingSelections = Object.values(selectedLessons).some((item) => {
      const cat = categories?.find((c) => c.categoryId === item.categoryId);
      return item.participationTypeId === null && (cat?.participationIds?.length ?? 0) > 1;
    });

    if (missingSelections) {
      message.error("Please select participation type.");
      return;
    }

    // Build an index of what's ALREADY saved for this email
    // Keyed by `${CategoryId}-${ClassNumber}` -> ParticipationTypeId
    const existingIndex = {};
    (existingProgressRows ?? [])
      .filter((p) => p?.EmailId === emailId)
      .forEach((p) => {
        existingIndex[selectionKey(p.CategoryId, p.ClassNumber)] = p.ParticipationTypeId ?? null;
      });

    // Build payload for currently selected lessons
    const fullPayload = Object.values(selectedLessons).map(
      ({ categoryId, classNumber, participationTypeId }) => {
        const cat = categories?.find((c) => c.categoryId === categoryId);
        const finalParticipationTypeId =
          participationTypeId ?? cat?.participationIds?.[0]?.participationTypeId ?? null;

        return {
          contactId,                 // ✅ now not undefined
          ContactInternalId: contactId, // ✅ optional if your API expects this name
          classNumber,
          categoryId,
          participationTypeId: finalParticipationTypeId,
          createdAt: new Date().toISOString(),
          courseCodeId,
          emailId
        };
      }
    );

    // ✅ DELTA FILTER:
    // Only send if:
    // - not in existingIndex, OR
    // - participationTypeId changed
    const deltaPayload = fullPayload.filter((row) => {
      const key = selectionKey(row.categoryId, row.classNumber);
      const existingType = existingIndex[key];

      // brand new check
      if (existingType === undefined) return true;

      // changed dropdown selection
      return String(existingType) !== String(row.participationTypeId);
    });

    if (deltaPayload.length === 0) {
      message.info("No changes to save.");
      return;
    }

    // Send only deltas
    if (onSubmit) onSubmit(deltaPayload);
  };

  return {
    selectedLessons,
    setSelectedLessons,
    handleCheckboxChange,
    handleParticipationTypeChange,
    handleSubmit
  };
};