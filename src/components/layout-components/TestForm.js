import React, { useState, useEffect } from "react";
import { Form, Button, message, Card } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { onUpsertingKnowMeByChapter, onFetchingUserAuthenticatedProgressForCourse } from "redux/actions/Lrn"; // your redux action


const questions = [
  {
    id: "intro",
    type: "intro",
    title: "Know Me Survey",
    description:
      "This assignment is about helping us know you better. Please answer honestly and openly.",
    coverUrl:
      "https://images.unsplash.com/photo-1632291683263-4a0711d34efe?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "q2_bio",
    type: "textarea",
    label: "Tell me about yourself, your passions, hopes, family... / Cuéntame sobre usted, sus pasiones, esperanzas, familia...",
    required: true,
    rows: 5,
  },
  {
    id: "q3_god",
    type: "textarea",
    label: "What has God been for you? Share your feelings or thoughts with me. / ¿Qué ha sido Dios para usted? Comparta sus sentimientos o pensamientos conmigo.",
    required: true,
    rows: 5,
  },
  {
    id: "consent",
    type: "checkbox",
    label: "Reconozco y acepto que al mandar esta actividad, Titulino podrá usar mis respuestas para mejorar el curso y para otros fines educativos.",
    required: true,
  },
];



export const KnowMeV1 = (props) => {
  const { user, onUpsertingKnowMeByChapter, chapterNo, levelTheme } = props;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [submittedKnowMe, setSubmittedKnowMe] = useState(null);

const onFinish = async (values) => {
  setLoading(true);

  const validKeys = questions.map(q => q.id);
  const answers = {};
  let fileToUpload = null;

  for (const [key, val] of Object.entries(values)) {
    if (!validKeys.includes(key)) continue;
    if (key === "consent") continue;

    if (Array.isArray(val) && val[0]?.originFileObj) {
      fileToUpload = val[0].originFileObj;
      answers[key] = { fileName: fileToUpload.name };
    } else {
      answers[key] = val;
    }
  }


  const record = {
    contactId: user.contactInternalId,
    emailId: user.email,
    classNumber: chapterNo,
    categoryId: 6, // Know Me category in DB
    answers,
    consent: values.consent,
  };

  // store both record + file so useEffect can handle API call
  setSubmittedKnowMe({ record, file: fileToUpload });
  setLoading(false);
};

// watch for new submission and push it through Redux
useEffect(() => {
  if (submittedKnowMe) {
    const doUpsert = async () => {      
      const upserted = await onUpsertingKnowMeByChapter(submittedKnowMe, levelTheme, user?.email);
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
      <DynamicFormRenderer questions={questions} />
        <Card
          bordered
          style={{ maxWidth: 700, margin: "20px auto", textAlign: "center" }}
        >
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Card>
    </Form>
  );
};


function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onUpsertingKnowMeByChapter
  }, dispatch);
}

const mapStateToProps = ({ grant }) => {
  const { user } = grant;
  return { user };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMeV1);
