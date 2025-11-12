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
      "This assignment is about helping us know you better and helping you improve your profeciency. Please answer as openly as you feel. (Share only what you feel comfortable sharing). Thank you!",
    coverUrl:
      "https://images.unsplash.com/photo-1632291683263-4a0711d34efe?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "q2_bio",
    type: "textarea",
    title: "Simple Presente and Presente Continuos",
    label: "Tell me about yourself, you family, and what you are passionate about / Cuénteme sobre usted, su familia sobre lo que es apasionado en hacer",
    required: true,
    rows: 5,
  },
  {
    id: "q3_bio",
    type: "textarea",
    title: "Simple Past",
    label: "Tell me about a thing you did you felt the most proud of / Cuénteme sobre algo que hizo usted de lo cual se siente orgullo",
    required: true,
    rows: 5,
  },
  {
    id: "q4_bio",
    type: "textarea",
    title: "Future",
    label: "Tell me about one of your biggest wishes for your future / Cuénteme sobre su mayor deseo en el futuro",
    required: true,
    rows: 5,
  },
  {
    id: "q5_bio",
    type: "textarea",
    title: "Present Perfect",
    label: "What has God been for you? Share your feelings or thoughts with me of what is for you. / ¿Qué ha sido Dios para usted? Comparta conmigo sus sentimientos o pensamientos de lo que es para usted en su experiencia.",
    required: true,
    rows: 5,
  },
  {   
    id: "q1_photo",
    type: "upload",
    title: "Picture",
    label: "Please share a picture with me to know you? / Porfavor comparta una foto conmigo para conocerle mejor?",
    required: true,
    accept: "image/*",
    maxCount: 1,
  },
  {
    id: "consent",
    type: "checkbox",
    title: "Consentimiento para compartir mis respuestas",
    label: "Acepto esta actividad para usar mis respuestas para mejorar el curso, ser correguido y para otros fines educativos colectivos y de uso propio de Titulino para con otros alumnos.",
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

  const validKeys = questions?.map(q => q.id);
  const answers = {};
  const filesMap = {};

  for (const [key, val] of Object.entries(values)) {
    if (!validKeys.includes(key)) continue;
    if (key === "consent") continue;

    // AntD Upload returns an array of items with originFileObj
    if (Array.isArray(val) && val[0]?.originFileObj) {
      const files = val.map(x => x.originFileObj).filter(Boolean);
      filesMap[key] = files;       // <-- normalize to array
      // store only filenames in answers (or whatever you want)
      answers[key] = files.length === 1
        ? { fileName: files[0].name }
        : files.map(f => ({ fileName: f.name }));
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

  setSubmittedKnowMe({ record, filesMap });  // <-- pass normalized map
  setLoading(false);
};


// watch for new submission and push it through Redux
useEffect(() => {
  if (submittedKnowMe) {
    const doUpsert = async () => {      
      const upserted = await onUpsertingKnowMeByChapter(submittedKnowMe, levelTheme, user?.emailId);
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
        <Card bordered style={{ maxWidth: 700, margin: "20px auto", textAlign: "center" }}>
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
