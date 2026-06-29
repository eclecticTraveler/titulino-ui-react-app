import React, { useState, useEffect } from "react";
import { App, Form, Button, Card, Spin, Empty } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions } from "redux/actions/Lrn";

const KnowMeV3 = (props) => {
  const { user, onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions, chapterNo, levelTheme } = props;
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questions, setQuestions] = useState(null);
  const [form] = Form.useForm();
  const [submittedKnowMe, setSubmittedKnowMe] = useState(null);

  useEffect(() => {
    if (!levelTheme || !chapterNo) return;
    let cancelled = false;

    const fetchQuestions = async () => {
      setQuestionsLoading(true);
      const result = await onFetchingKnowMeSurveyQuestions(levelTheme, chapterNo);
      if (!cancelled) {
        setQuestions(result?.questions ?? null);
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
    return () => { cancelled = true; };
  }, [levelTheme, chapterNo]);

  const onFinish = async (values) => {
    setLoading(true);

    const validKeys = questions.map((q) => q.id);
    const answers = {};
    const filesMap = {};

    for (const [key, val] of Object.entries(values)) {
      if (!validKeys.includes(key)) continue;
      if (key === "consent") continue;

      if (Array.isArray(val) && val[0]?.originFileObj) {
        answers[key] = val.map((f) => ({ fileName: f.originFileObj.name }));
        filesMap[key] = val.map((f) => f.originFileObj);
      } else {
        answers[key] = val;
      }
    }

    const record = {
      contactId: user.contactInternalId,
      emailId: user.emailId,
      classNumber: chapterNo,
      answers,
      consent: values.consent,
    };

    setSubmittedKnowMe({ record, filesMap });
    setLoading(false);
  };

  useEffect(() => {
    if (!submittedKnowMe) return;

    const doUpsert = async () => {
      const upserted = await onUpsertingKnowMeByChapter(
        submittedKnowMe,
        levelTheme,
        user?.emailId
      );
      const success = upserted && !upserted.error;
      if (success) {
        message.success("Thank you! Your submission has been saved.");
        form.resetFields();
      } else {
        message.error("Submission failed, please try again.");
      }
      setSubmittedKnowMe(null);
    };

    doUpsert();
  }, [submittedKnowMe]);

  if (questionsLoading) {
    return <Spin size="large" style={{ display: "block", margin: "60px auto" }} />;
  }

  if (!questions || questions.length === 0) {
    return (
      <Empty
        description="No survey available for this chapter."
        style={{ margin: "60px auto" }}
      />
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <DynamicFormRenderer questions={questions} />
      <Card variant="outlined" style={{ maxWidth: 700, margin: "20px auto", textAlign: "center" }}>
        <Button type="primary" size="large" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Card>
    </Form>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions }, dispatch);
}

const mapStateToProps = ({ grant }) => {
  const { user } = grant;
  return { user };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMeV3);
