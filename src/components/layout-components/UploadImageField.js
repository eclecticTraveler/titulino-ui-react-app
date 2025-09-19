import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Upload, Modal, message } from "antd";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function UploadImageField({ maxCount = 1 }) {
  const [fileList, setFileList] = useState([]);

  const beforeUpload = (file) => {
    const isImage =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      file.type === "image/gif";

    if (!isImage) {
      message.error("You can only upload JPG/PNG/WebP/GIF files!");
      return Upload.LIST_IGNORE; // ignore invalid file
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }

    return false; // 🚨 prevent auto-upload but keep in fileList
  };

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await getBase64(file.originFileObj);
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      beforeUpload={beforeUpload}
      onChange={onChange}
      onPreview={onPreview}
      maxCount={maxCount} // ✅ enforce 1 file if you want
    >
      {fileList.length >= maxCount ? null : uploadButton}
    </Upload>
  );
}
