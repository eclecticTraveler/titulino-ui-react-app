import React, { useState } from "react";
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
      "https://images.unsplash.com/photo-1535515384173-d74166f26820?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "q2_bio",
    type: "textarea",
    label: "Tell me about yourself, your passions, hopes, family...",
    required: true,
    rows: 5,
  },
  {
    id: "q1_photo",
    type: "upload",
    label: "Would you share a picture with me to know you better?",
    required: true,
    accept: "image/*",
    maxCount: 1,
  },
  {
    id: "q3_god",
    type: "textarea",
    label: "What has God been for you? Share your feelings of belief.",
    required: true,
    rows: 5,
  },
  {
    id: "consent",
    type: "checkbox",
    label: "Reconozco y acepto que al mandar esta actividad...",
    required: true,
  },
];



export const KnowMeV1 = (props) => {
  const { user, onUpsertingKnowMeByChapter } = props;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Upload photo (if exists)
      let photoPath = null;
      const file = values.q1_photo?.file?.originFileObj;
      if (file) {
        const path = `knowme/${user.contactInternalId}/${Date.now()}-${file.name}`;
        // const { error } = await supabase.storage
        //   .from("student-uploads") // private bucket
        //   .upload(path, file, { upsert: false });
        // if (error) throw error;
        photoPath = path;
      }

      // Build JSON answers
      const answers = {
        ...values,
        q1_photo: photoPath,
      };

      // Call Redux action to upsert
      await onUpsertingKnowMeByChapter({
        contactId: user.contactInternalId,
        emailId: user.emailId,
        answers: answers,
      });

      message.success("Thank you! Your submission has been saved.");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Submission failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

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
