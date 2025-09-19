import React from "react";
import { Form, Input, Checkbox, Card, Spin } from "antd";
import UploadImageField from "./UploadImageField";
import IntlMessage from "components/util-components/IntlMessage";

export default function DynamicFormRenderer({ questions, locale = false, loading = false }) {
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <>
      {questions.map((q) => {
        if (q.type === "intro") {
          return (
            <Card
              key={q.id}
              title={q.title}
              cover={
                q.coverUrl ? (
                  <img
                    alt={q.title}
                    src={q.coverUrl}
                    style={{ height: 120, objectFit: "cover" }}
                  />
                ) : null
              }
              bordered
              style={{ maxWidth: 700, margin: "20px auto" }}
            >
              {q.description && <p>{q.description}</p>}
            </Card>
          );
        }

        return (
          <Card
            key={q.id}
            bordered
            style={{ maxWidth: 700, margin: "20px auto" }}
          >
            <Spin spinning={loading}>
              <Form.Item
                name={q.id}
                label={setLocale(locale, q.label)}
                valuePropName={
                  q.type === "checkbox"
                    ? "checked"
                    : q.type === "upload"
                    ? "fileList"
                    : undefined
                }
                getValueFromEvent={
                  q.type === "upload" ? (e) => e && e.fileList : undefined
                }
                rules={
                  q.type === "checkbox"
                    ? [
                        {
                          validator: (_, v) =>
                            q.required && !v
                              ? Promise.reject("You must consent")
                              : Promise.resolve(),
                        },
                      ]
                    : q.type === "upload"
                    ? [
                        {
                          required: q.required,
                          message: "Please upload an image",
                        },
                      ]
                    : [
                        {
                          required: q.required,
                          message: "This field is required",
                        },
                      ]
                }
              >
                {q.type === "upload" && (
                  <UploadImageField maxCount={q.maxCount} />
                )}

                {q.type === "textarea" && (
                  <Input.TextArea rows={q.rows || 3} />
                )}

                {q.type === "checkbox" && (
                  <Checkbox>{setLocale(locale, q.label)}</Checkbox>
                )}
              </Form.Item>
            </Spin>
          </Card>
        );
      })}
    </>
  );
}
