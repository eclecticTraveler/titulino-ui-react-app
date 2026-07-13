import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useIntl } from 'react-intl';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { env } from 'configs/EnvironmentConfig';

const { TextArea } = Input;

const ContactFormModal = ({ visible, onClose }) => {
  const { formatMessage } = useIntl();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const recaptchaToken = executeRecaptcha
        ? await executeRecaptcha('contact_submit')
        : '';

      const response = await fetch(`${env.TITULINO_NET_API}/v1/lrn/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, captchaToken: recaptchaToken }),
      });

      if (response.ok) {
        message.success(formatMessage({ id: 'floating.contact.success' }));
        form.resetFields();
        onClose();
      } else {
        message.error(formatMessage({ id: 'floating.contact.error' }));
      }
    } catch {
      message.error(formatMessage({ id: 'floating.contact.error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={formatMessage({ id: 'floating.contact.modal.title' })}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={formatMessage({ id: 'floating.contact.field.name' })}
          rules={[{ required: true, message: formatMessage({ id: 'floating.contact.field.name.required' }) }]}
        >
          <Input maxLength={100} />
        </Form.Item>

        <Form.Item
          name="subject"
          label={formatMessage({ id: 'floating.contact.field.subject' })}
          rules={[{ required: true, message: formatMessage({ id: 'floating.contact.field.subject.required' }) }]}
        >
          <Input maxLength={200} />
        </Form.Item>

        <Form.Item
          name="message"
          label={formatMessage({ id: 'floating.contact.field.message' })}
          rules={[{ required: true, message: formatMessage({ id: 'floating.contact.field.message.required' }) }]}
        >
          <TextArea rows={4} maxLength={1000} showCount />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            {formatMessage({ id: 'floating.contact.cancel' })}
          </Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {formatMessage({ id: 'floating.contact.send' })}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContactFormModal;
