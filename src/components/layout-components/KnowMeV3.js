import React, { useState, useEffect, useRef } from "react";
import { App, Form, Button, Card, Spin, Empty, Alert, Typography, Divider } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions, onFetchingKnowMeAiResult } from "redux/actions/Lrn";

const { Title, Paragraph, Text } = Typography;

const AI_POLL_INTERVAL_MS = 10000;
const ACTIVE_STATUSES = new Set(['pending', 'processing']);

const KnowMeV3 = (props) => {
  const { user, onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions, onFetchingKnowMeAiResult, chapterNo, levelTheme } = props;
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questions, setQuestions] = useState(null);
  const [form] = Form.useForm();
  const [submittedKnowMe, setSubmittedKnowMe] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const pollRef = useRef(null);

  // Fetch survey questions
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

  // Fetch AI result on mount (T26)
  useEffect(() => {
    if (!levelTheme || !chapterNo || !user?.emailId) return;
    fetchAiResult();
  }, [levelTheme, chapterNo, user?.emailId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAiResult = async () => {
    const result = await onFetchingKnowMeAiResult(levelTheme, user?.emailId, chapterNo);
    setAiResult(result?.aiResult ?? null);
  };

  // Poll while AI is in progress (T27)
  useEffect(() => {
    const isPending = aiResult && ACTIVE_STATUSES.has(aiResult?.aiStatus);

    if (isPending) {
      pollRef.current = setInterval(fetchAiResult, AI_POLL_INTERVAL_MS);
    } else {
      clearInterval(pollRef.current);
    }

    return () => clearInterval(pollRef.current);
  }, [aiResult?.aiStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Submit handler
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

  // After form state is ready, send to backend
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
        message.success("Thank you! Your answers have been submitted and are now being reviewed by AI.");
        form.resetFields();
        // Optimistically mark as pending (T27) — polling will update once AI completes
        setAiResult({ aiStatus: 'pending', correctedEssays: null, feedback: null });
      } else {
        message.error("Submission failed, please try again.");
      }
      setSubmittedKnowMe(null);
    };

    doUpsert();
  }, [submittedKnowMe]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // T26: if completed, hide the form and show result view
  const aiStatus = aiResult?.aiStatus;
  const isCompleted = aiStatus === 'completed';
  const isPending = ACTIVE_STATUSES.has(aiStatus);

  return (
    <>
      {/* T27: pending/processing banner */}
      {isPending && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24, maxWidth: 700, margin: "0 auto 24px" }}
          title="AI Review in Progress"
          description="Your answers have been submitted. The AI is reviewing your essays — this usually takes under a minute. This page will update automatically."
        />
      )}

      {/* T28: completed result view */}
      {isCompleted && (
        <div style={{ maxWidth: 700, margin: "0 auto 32px" }}>
          <Alert
            type="success"
            showIcon
            title="AI Review Complete"
            style={{ marginBottom: 24 }}
          />
          {questions
            .filter((q) => q.type === 'textarea' || q.type === 'text')
            .map((q) => {
              const corrected = aiResult?.correctedEssays?.[q.id];
              const feedback  = aiResult?.feedback?.[q.id];
              if (!corrected && !feedback) return null;
              return (
                <Card key={q.id} style={{ marginBottom: 20 }} variant="outlined">
                  <Title level={5} style={{ marginTop: 0 }}>{q.label || q.id}</Title>
                  {corrected && (
                    <>
                      <Text type="secondary">Corrected version</Text>
                      <Paragraph style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '10px 14px', marginTop: 6 }}>
                        {corrected}
                      </Paragraph>
                    </>
                  )}
                  {feedback && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text type="secondary">AI Feedback</Text>
                      {feedback.summary && (
                        <Paragraph style={{ marginTop: 6 }}>{feedback.summary}</Paragraph>
                      )}
                      {feedback.grammarNotes?.length > 0 && (
                        <>
                          <Text type="secondary" style={{ fontSize: 12 }}>Grammar notes</Text>
                          <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                            {feedback.grammarNotes.map((note, i) => (
                              <li key={i}><Paragraph style={{ margin: 0 }}>{note}</Paragraph></li>
                            ))}
                          </ul>
                        </>
                      )}
                      {feedback.vocabularySuggestions?.length > 0 && (
                        <>
                          <Text type="secondary" style={{ fontSize: 12 }}>Vocabulary suggestions</Text>
                          <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                            {feedback.vocabularySuggestions.map((s, i) => (
                              <li key={i}><Paragraph style={{ margin: 0 }}>{s}</Paragraph></li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
        </div>
      )}

      {/* Hide form when completed; always show when not */}
      {!isCompleted && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <DynamicFormRenderer questions={questions} />
          <Card variant="outlined" style={{ maxWidth: 700, margin: "20px auto", textAlign: "center" }}>
            <Button type="primary" size="large" htmlType="submit" loading={loading} disabled={isPending}>
              Submit
            </Button>
          </Card>
        </Form>
      )}
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions, onFetchingKnowMeAiResult }, dispatch);
}

const mapStateToProps = ({ grant }) => {
  const { user } = grant;
  return { user };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMeV3);
