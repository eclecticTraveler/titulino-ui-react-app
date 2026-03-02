import React, { useState, useEffect, useMemo } from "react";
import { Checkbox, Select, Button, Divider, Row, Col, Card, Tag } from "antd";
import { useUserProgressLogic } from "hooks/useUserProgressLogic";

const { Option } = Select;

const AdminProgressEditable = ({
  categories,
  progressData,   // <-- this is record.rawProgress (rows)
  contactId,
  emails,
  courseCodeId,
  onSubmit
}) => {
  const [selectedEmail, setSelectedEmail] = useState(
    emails?.length ? emails[0] : null
  );

  // ONE canonical key for selection state
  const selectionKey = (categoryId, classNumber) => `${categoryId}-${classNumber}`;

  const {
    selectedLessons,
    setSelectedLessons,
    handleCheckboxChange,
    handleParticipationTypeChange,
    handleSubmit
  } = useUserProgressLogic({
    categories,
    contactId,
    emailId: selectedEmail,
    courseCodeId,
    onSubmit,
    existingProgressRows: progressData
  });

  // ✅ Pre-select based on progressData (per email)
  useEffect(() => {
    if (!progressData || !selectedEmail) return;

    const preSelected = {};

    progressData
      ?.filter((p) => p?.EmailId === selectedEmail)
      ?.forEach((p) => {
        const k = selectionKey(p.CategoryId, p.ClassNumber);
        preSelected[k] = {
          categoryId: p.CategoryId,
          classNumber: p.ClassNumber,
          participationTypeId: p.ParticipationTypeId ?? null
        };
      });

    setSelectedLessons(preSelected);
  }, [progressData, selectedEmail]); // setSelectedLessons comes from hook

  // Optional: show title + count
  const emailCount = emails?.length ?? 0;

  // Sort lessons by classNumber if needed (safe)
  const normalizedCategories = useMemo(() => {
    return (categories ?? []).map((c) => ({
      ...c,
      lessons: c?.lessons ? [...c.lessons].sort((a, b) => (a?.classNumber ?? 0) - (b?.classNumber ?? 0)) : []
    }));
  }, [categories]);

  return (
    <Card title={`Progress for ${selectedEmail ?? "-"}`} style={{ background: "#fafafa" }}>
      {/* Email Selector */}
      {emailCount > 0 && (
        <>
          <div style={{ marginBottom: 6 }}>
            <strong>Emails</strong>
            <Tag
              color={emailCount > 1 ? "geekblue" : "green"}
              style={{ marginLeft: 8 }}
            >
              {emailCount}
            </Tag>
          </div>

          <Select
            value={selectedEmail}
            style={{ width: 350, marginBottom: 16 }}
            onChange={(value) => setSelectedEmail(value)}
          >
            {emails.map((email) => (
              <Option key={`email-${email}`} value={email}>
                {email}
              </Option>
            ))}
          </Select>

          <Divider />
        </>
      )}

      {/* Categories Grid */}
      <Row gutter={[16, 16]}>
        {normalizedCategories?.map((category, idx) => {
          if (!category?.isToDisplay) return null;

          // ✅ React key must be unique even if categoryId repeats across levels
          const categoryReactKey = `category-${category?.categoryId}-${category?.level ?? "na"}-${idx}-${courseCodeId}`;

          return (
            <Col xs={24} sm={24} lg={8} key={categoryReactKey}>
              <Card size="small" title={category?.name}>
                {category?.lessons
                  ?.filter((l) => l?.isToDisplay)
                  ?.map((lesson, lidx) => {
                    // ✅ selection key for state
                    const k = selectionKey(category?.categoryId, lesson?.classNumber);

                    const isSelected = selectedLessons?.[k];
                    const requiresDropdown = (category?.participationIds?.length ?? 0) > 1;

                    // ✅ separate React key for list rendering
                    const lessonReactKey = `lesson-${category?.categoryId}-${category?.level ?? "na"}-${lesson?.classNumber}-${lidx}-${courseCodeId}`;

                    return (
                      <div key={lessonReactKey} style={{ marginBottom: 8 }}>
                        <Checkbox
                          checked={!!isSelected}
                          onChange={() =>
                            handleCheckboxChange(category?.categoryId, lesson?.classNumber)
                          }
                        >
                          Class {lesson?.classNumber} – {lesson?.title}
                        </Checkbox>

                        {requiresDropdown && isSelected && (
                          <Select
                            style={{ width: "100%", marginTop: 6 }}
                            value={isSelected?.participationTypeId}
                            onChange={(value) =>
                              handleParticipationTypeChange(
                                category?.categoryId,
                                lesson?.classNumber,
                                value
                              )
                            }
                          >
                            {category?.participationIds?.map((p) => (
                              <Option
                                key={`ptype-${category?.categoryId}-${category?.level ?? "na"}-${p?.participationTypeId}`}
                                value={p?.participationTypeId}
                              >
                                {p?.localizationKey}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </div>
                    );
                  })}
              </Card>
            </Col>
          );
        })}
      </Row>

      <Button type="primary" onClick={handleSubmit} style={{ marginTop: 20 }}>
        Save Progress
      </Button>
    </Card>
  );
};

export default AdminProgressEditable;