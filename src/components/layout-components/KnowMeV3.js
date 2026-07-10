import React, { useState, useEffect, useRef } from "react";
import { App, Form, Button, Card, Spin, Empty, Alert, Typography, Divider } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions, onFetchingKnowMeAiResult } from "redux/actions/Lrn";
import { onSessionTokenExpired } from "redux/actions/Grant";
import useSessionTokenExpiryGuard from "hooks/useSessionTokenExpiryGuard";

const { Title, Paragraph, Text } = Typography;

const AI_POLL_INTERVAL_MS = 10000;
const ACTIVE_STATUSES = new Set(['pending', 'processing']);

const getStorageKey = (levelTheme, chapterNo, emailId) =>
  `knowme_answers_${levelTheme}_${chapterNo}_${emailId}`;

const KnowMeV3 = (props) => {
  const { user, onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions, onFetchingKnowMeAiResult, chapterNo, levelTheme, onSessionTokenExpired } = props;
  const { message } = App.useApp();
  const ensureValidSession = useSessionTokenExpiryGuard(user, onSessionTokenExpired);
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
    if (!ensureValidSession()) return;

    const result = await onFetchingKnowMeAiResult(levelTheme, user?.emailId, chapterNo);
    const fetched = result?.aiResult ?? null;
    setAiResult(fetched);

    // Pre-populate form with saved answers when AI failed so student can resubmit
    if (fetched?.aiStatus === 'failed') {
      try {
        const saved = localStorage.getItem(getStorageKey(levelTheme, chapterNo, user?.emailId));
        if (saved) form.setFieldsValue(JSON.parse(saved));
      } catch {}
    }

    // Clear saved answers once AI review completes successfully
    if (fetched?.aiStatus === 'completed') {
      try { localStorage.removeItem(getStorageKey(levelTheme, chapterNo, user?.emailId)); } catch {}
    }
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

    // Save text answers so they can be restored if AI fails or student navigates away
    try {
      localStorage.setItem(
        getStorageKey(levelTheme, chapterNo, user.emailId),
        JSON.stringify(answers)
      );
    } catch {}

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
      if (!ensureValidSession()) {
        setSubmittedKnowMe(null);
        return;
      }

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
  const isFailed = aiStatus === 'failed';

  return (
    <>
      {/* T27: pending/processing banner — form is hidden while AI works */}
      {isPending && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24, maxWidth: 700, margin: "0 auto 24px" }}
          title="AI Review in Progress"
          description="Your answers have been submitted. The AI is reviewing your essays — this usually takes under a minute. This page will update automatically."
        />
      )}

      {/* failed banner — answers are restored below for resubmission */}
      {isFailed && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 24, maxWidth: 700, margin: "0 auto 24px" }}
          message="AI Review Failed"
          description="The AI could not process your submission. Your answers have been restored below — please review and resubmit."
        />
      )}

      {/* T28/T43: completed result view */}
      {isCompleted && (
        <div style={{ maxWidth: 700, margin: "0 auto 32px" }}>
          <Alert
            type="success"
            showIcon
            description="AI Review Complete"
            style={{ marginBottom: 24 }}
          />
          {questions
            .filter((q) => q.type === 'textarea' || q.type === 'text')
            .map((q) => {
              const original  = aiResult?.originalEssays?.[q.id];
              const corrected = aiResult?.correctedEssays?.[q.id];
              const feedback  = aiResult?.feedback?.[q.id];
              if (!original && !corrected && !feedback) return null;

              const hasEnFeedback = feedback && (feedback.summary || feedback.grammarNotes?.length > 0 || feedback.vocabularySuggestions?.length > 0);
              const hasNativeFeedback = feedback && (feedback.nativeSummary || feedback.nativeGrammarNotes?.length > 0 || feedback.nativeVocabularySuggestions?.length > 0);

              return (
                <Card key={q.id} style={{ marginBottom: 20 }} variant="outlined">
                  <Title level={5} style={{ marginTop: 0 }}>{q.label || q.id}</Title>

                  {/* Original answer */}
                  {original && (
                    <>
                      <Text type="secondary">Your answer</Text>
                      <Paragraph style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 6, padding: '10px 14px', marginTop: 6 }}>
                        {original}
                      </Paragraph>
                    </>
                  )}

                  {/* Corrected version */}
                  {corrected && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text type="secondary">Corrected version</Text>
                      <Paragraph style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '10px 14px', marginTop: 6 }}>
                        {corrected}
                      </Paragraph>
                    </>
                  )}

                  {/* English feedback */}
                  {hasEnFeedback && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text strong>Feedback</Text>
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

                  {/* Native language feedback */}
                  {hasNativeFeedback && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text strong>Retroalimentación</Text>
                      {feedback.nativeSummary && (
                        <Paragraph style={{ marginTop: 6 }}>{feedback.nativeSummary}</Paragraph>
                      )}
                      {feedback.nativeGrammarNotes?.length > 0 && (
                        <>
                          <Text type="secondary" style={{ fontSize: 12 }}>Notas de gramática</Text>
                          <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                            {feedback.nativeGrammarNotes.map((note, i) => (
                              <li key={i}><Paragraph style={{ margin: 0 }}>{note}</Paragraph></li>
                            ))}
                          </ul>
                        </>
                      )}
                      {feedback.nativeVocabularySuggestions?.length > 0 && (
                        <>
                          <Text type="secondary" style={{ fontSize: 12 }}>Sugerencias de vocabulario</Text>
                          <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                            {feedback.nativeVocabularySuggestions.map((s, i) => (
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

      {/* Show form only when not pending (AI working) and not completed */}
      {!isCompleted && !isPending && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <DynamicFormRenderer questions={questions} />
          <Card variant="outlined" style={{ maxWidth: 700, margin: "20px auto", textAlign: "center" }}>
            <Button type="primary" size="large" htmlType="submit" loading={loading}>
              {isFailed ? 'Resubmit' : 'Submit'}
            </Button>
          </Card>
        </Form>
      )}
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ onUpsertingKnowMeByChapter, onFetchingKnowMeSurveyQuestions, onFetchingKnowMeAiResult, onSessionTokenExpired }, dispatch);
}

const mapStateToProps = ({ grant }) => {
  const { user } = grant;
  return { user };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMeV3);
