import React, { useState, useEffect, useMemo } from "react";
import { Checkbox, Select, Button, Divider, Row, Col, Card, Tag } from "antd";
import { useUserProgressLogic } from "hooks/useUserProgressLogic";
import IntlMessage from "components/util-components/IntlMessage";

const { Option } = Select;

const AdminProgressEditable = ({
  categories,
  progressData,
  contactId,
  emails,
  defaultEmail,
  emailProgressMap,
  courseCodeId,
  userProficiency,
  onSubmit,
  onEmailChange
}) => {
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  const [selectedEmail, setSelectedEmail] = useState(
    defaultEmail ?? (emails?.length ? emails[0] : null)
  );

  const handleEmailSelection = (value) => {
    setSelectedEmail(value);
    onEmailChange?.(value);
  };

  const selectionKey = (categoryId, classNumber) => `${categoryId}-${classNumber}`;

  const getLevelFromProficiency = (abbr) => {
    console.log("abbr------", abbr);
    if (!abbr) return 1;
    const basicLevels = ["be", "ba"];
    const advancedLevels = ["in", "na", "ad"];

    if (basicLevels.includes(abbr)) return 1;
    if (advancedLevels.includes(abbr)) return 2;
    return 1;
  };

  const levelToUse = getLevelFromProficiency(userProficiency);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressData, selectedEmail]);

  const emailCount = emails?.length ?? 0;

  const normalizedCategories = useMemo(() => {
    return (categories ?? [])
      .filter((category) => {
        if (!category?.level) return true;
        return category.level === levelToUse;
      })
      .map((c) => ({
        ...c,
        lessons: c?.lessons
          ? [...c.lessons].sort((a, b) => (a?.classNumber ?? 0) - (b?.classNumber ?? 0))
          : []
      }));
  }, [categories, levelToUse]);

  return (
    <Card
      title={
        <span>
          {setLocale(locale, "resources.myprogress.progressFor")} {selectedEmail ?? "-"}
        </span>
      }
    >
      {emailCount > 0 && (
        <>
          <div style={{ marginBottom: 6 }}>
            <strong>{setLocale(locale, "admin.progressEditable.emails")}</strong>
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
            onChange={handleEmailSelection}
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

      <Row gutter={[16, 16]}>
        {normalizedCategories?.map((category, idx) => {
          if (!category?.isToDisplay) return null;

          const categoryReactKey = `category-${category?.categoryId}-${category?.level ?? "na"}-${idx}-${courseCodeId}`;

          return (
            <Col xs={24} sm={24} lg={8} key={categoryReactKey}>
              <Card size="small" title={category?.name}>
                {category?.lessons
                  ?.filter((l) => l?.isToDisplay)
                  ?.map((lesson, lidx) => {
                    const k = selectionKey(category?.categoryId, lesson?.classNumber);

                    const isSelected = selectedLessons?.[k];
                    const requiresDropdown = (category?.participationIds?.length ?? 0) > 1;

                    const lessonReactKey = `lesson-${category?.categoryId}-${category?.level ?? "na"}-${lesson?.classNumber}-${lidx}-${courseCodeId}`;

                    return (
                      <div key={lessonReactKey} style={{ marginBottom: 8 }}>
                        <Checkbox
                          checked={!!isSelected}
                          onChange={() =>
                            handleCheckboxChange(category?.categoryId, lesson?.classNumber)
                          }
                        >
                          {setLocale(locale, "resources.userProgress.class")} {lesson?.classNumber} - {lesson?.title}
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
                                {setLocale(locale, p?.localizationKey)}
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

      <Button type="primary" size="large" onClick={handleSubmit} style={{ marginTop: 20 }}>
        {setLocale(locale, "admin.progressEditable.saveProgress")}
      </Button>
    </Card>
  );
};

export default AdminProgressEditable;
