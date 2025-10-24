import React, { useState, useEffect } from "react";
import { Form, Button, message, Card } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DynamicFormRenderer from "./DynamicFormRenderer";
import {
  onUpsertingKnowMeByChapter,
} from "redux/actions/Lrn"; // your redux action

export const KnowMeV2 = (props) => {
  const { user, onUpsertingKnowMeByChapter, chapterNo, levelTheme } = props;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [submittedKnowMe, setSubmittedKnowMe] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);

    const validKeys = props.questions.map((q) => q.id); // make questions dynamic
    const answers = {};
    const filesMap = {};

    for (const [key, val] of Object.entries(values)) {
      if (!validKeys.includes(key)) continue;
      if (key === "consent") continue;

      if (Array.isArray(val) && val[0]?.originFileObj) {
        // upload question
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
    if (submittedKnowMe) {
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
    }
  }, [submittedKnowMe]);

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <DynamicFormRenderer questions={props.questions} />
      <Card bordered style={{ maxWidth: 700, margin: "20px auto", textAlign: "center" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Card>
    </Form>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ onUpsertingKnowMeByChapter }, dispatch);
}

const mapStateToProps = ({ grant }) => {
  const { user } = grant;
  return { user };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMeV2);
