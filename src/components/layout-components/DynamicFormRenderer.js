import React from "react";
import { Form, Input, Checkbox, Card, Spin, Upload, message } from "antd";
import IntlMessage from "components/util-components/IntlMessage";
import ConsentModal from "components/layout-components/Enrollment/ConsentModal";
import { PlusOutlined } from "@ant-design/icons";

export default function DynamicFormRenderer({ questions, locale = false, loading = false }) {
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <>
      {questions?.map((q) => {
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

      if (q.type === "upload") {
        return (
          <Card key={q.id} title={q?.title} bordered style={{ maxWidth: 700, margin: "20px auto" }}>
            <Form.Item
              name={q.id}
              label={q.label}
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              rules={[
                {
                  validator: (_, fileList) =>
                    fileList && fileList.length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Please upload an image")),
                },
              ]}
            >
              <Upload
                listType="picture-card"
                accept="image/*" // ✅ only images selectable
                beforeUpload={(file) => {
                  const isImage = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
                  if (!isImage) {
                    message.error("You can only upload JPG/PNG/WebP/GIF files!");
                    return Upload.LIST_IGNORE;
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error("Image must be smaller than 2MB!");
                    return Upload.LIST_IGNORE;
                  }
                  return false; // ✅ block auto upload, keep in list
                }}
                customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)} // fake success
                maxCount={q.maxCount || 1}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Card>
        );
      }


        if (q.type === "textarea") {
          return (
            <Card key={q.id} title={q?.title} bordered style={{ maxWidth: 700, margin: "20px auto" }}>
              <Form.Item
                name={q.id}
                label={q.label}
                rules={[{ required: q.required, message: "This field is required" }]}
              >
                <Input.TextArea rows={q.rows || 3} />
              </Form.Item>
            </Card>
          );
        }

      if (q.type === "checkbox" && q?.id === "consent") {
        return (
          <Card
            key={q.id}
            title={q?.title}
            bordered
            style={{ maxWidth: 700, margin: "20px auto" }}
          >
            <Form.Item
              name={q.id}
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Debe aceptar para continuar")),
                },
              ]}
            >
              <Checkbox>
                I agree with terms and conditions (if in down visitem here) {" - "}
                <ConsentModal label={q.label} title={q.title} />
              </Checkbox>
            </Form.Item>
          </Card>
        );
      }



        return null;
      })}
    </>
  );
}
