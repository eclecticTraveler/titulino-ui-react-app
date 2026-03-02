import { useState } from "react";
import { message } from "antd";

export const useUserProgressLogic = ({
  categories,
  courseCodeId,
  emailId,
  contactId,
  onSubmit
}) => {

  const [selectedLessons, setSelectedLessons] = useState({});

  const handleCheckboxChange = (categoryId, classNumber) => {
    const key = `${categoryId}-${classNumber}`;

    setSelectedLessons(prev => {
      const newSelections = { ...prev };

      if (newSelections[key]) {
        delete newSelections[key];
      } else {
        newSelections[key] = {
          categoryId,
          classNumber,
          participationTypeId: null
        };
      }

      return newSelections;
    });
  };

  const handleParticipationTypeChange = (
    categoryId,
    classNumber,
    participationTypeId
  ) => {
    const key = `${categoryId}-${classNumber}`;

    setSelectedLessons(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        participationTypeId
      }
    }));
  };

  const handleSubmit = () => {

    const missingSelections = Object.values(selectedLessons).some(
      (item) =>
        item.participationTypeId === null &&
        categories?.find(c => c.categoryId === item.categoryId)
          ?.participationIds?.length > 1
    );

    if (missingSelections) {
      message.error("Please select participation type.");
      return;
    }

    const formattedData = Object.values(selectedLessons).map(
      ({ categoryId, classNumber, participationTypeId }) => ({
        contactId,
        classNumber,
        categoryId,
        participationTypeId:
          participationTypeId ||
          categories?.find(c => c.categoryId === categoryId)
            ?.participationIds?.[0]?.participationTypeId,
        createdAt: new Date().toISOString(),
        courseCodeId,
        emailId
      })
    );

    if (onSubmit) {
      onSubmit(formattedData);
    }
  };

  return {
    selectedLessons,
    setSelectedLessons,
    handleCheckboxChange,
    handleParticipationTypeChange,
    handleSubmit
  };
};