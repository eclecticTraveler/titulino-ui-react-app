import React, { useState, useEffect } from "react";
import { Checkbox, Select, Button, Divider, Row, Col, Card, Tag } from "antd";
import { useUserProgressLogic } from "hooks/useUserProgressLogic";

const { Option } = Select;

const AdminProgressEditable = ({
  categories,
  progressData,
  contactId,
  emails,
  courseCodeId,
  onSubmit
}) => {

  const [selectedEmail, setSelectedEmail] = useState(
    emails?.length ? emails[0] : null
  );

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
    onSubmit
  });

  // ✅ Pre-select based on progressData
  useEffect(() => {

    if (!progressData || !selectedEmail) return;

    const preSelected = {};

    progressData
      ?.filter(p => p.EmailId === selectedEmail)
      ?.forEach(p => {
        const key = `${p.CategoryId}-${p.ClassNumber}`;
        preSelected[key] = {
          categoryId: p.CategoryId,
          classNumber: p.ClassNumber,
          participationTypeId: p.ParticipationTypeId
        };
      });

    setSelectedLessons(preSelected);

  }, [progressData, selectedEmail]);

return (
  <Card
    title={`Progress for ${selectedEmail}`}
    style={{ background: "#fafafa" }}
  >

    {/* Email Selector */}
    {emails?.length > 0 && (
      <>
        <div style={{ marginBottom: 6 }}>
          <strong>Emails</strong>
          <Tag
            color={emails.length > 1 ? "geekblue" : "green"}
            style={{ marginLeft: 8 }}
          >
            {emails.length}
          </Tag>
        </div>

        <Select
          value={selectedEmail}
          style={{ width: 350, marginBottom: 16 }}
          onChange={(value) => setSelectedEmail(value)}
        >
          {emails.map(email => (
            <Option key={email} value={email}>
              {email}
            </Option>
          ))}
        </Select>

        <Divider />
      </>
    )}

    {/* Categories Grid */}
    <Row gutter={[16, 16]}>
      {categories?.map(category => {

        if (!category.isToDisplay) return null;

        return (
          <Col xs={24} sm={24} lg={8} key={category.categoryId}>
            <Card size="small" title={category.name}>

              {category.lessons
                ?.filter(l => l.isToDisplay)
                ?.map(lesson => {

                  const key = `${category.categoryId}-${lesson.classNumber}`;
                  const isSelected = selectedLessons[key];
                  const requiresDropdown =
                    category.participationIds.length > 1;

                  return (
                    <div key={key} style={{ marginBottom: 8 }}>

                      <Checkbox
                        checked={!!isSelected}
                        onChange={() =>
                          handleCheckboxChange(
                            category.categoryId,
                            lesson.classNumber
                          )
                        }
                      >
                        Class {lesson.classNumber} – {lesson.title}
                      </Checkbox>

                      {requiresDropdown && isSelected && (
                        <Select
                          style={{ width: "100%", marginTop: 6 }}
                          value={isSelected?.participationTypeId}
                          onChange={(value) =>
                            handleParticipationTypeChange(
                              category.categoryId,
                              lesson.classNumber,
                              value
                            )
                          }
                        >
                          {category.participationIds.map(p => (
                            <Option
                              key={p.participationTypeId}
                              value={p.participationTypeId}
                            >
                              {p.localizationKey}
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

    <Button
      type="primary"
      onClick={handleSubmit}
      style={{ marginTop: 20 }}
    >
      Save Progress
    </Button>

  </Card>
);
};

export default AdminProgressEditable;