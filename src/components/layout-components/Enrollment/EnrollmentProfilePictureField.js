import React, { useEffect, useMemo, useState } from "react";
import { App, Card, Form, Spin, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import IntlMessage from "components/util-components/IntlMessage";
import LrnManager from "managers/LrnManager";
import { env } from "configs/EnvironmentConfig";

const PROFILE_PICTURE_FIELD_NAME = "profilePictureUpload";
const ACCEPTED_PROFILE_PICTURE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/x-png", "image/webp", "image/gif"]);
const ACCEPTED_PROFILE_PICTURE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const PROFILE_PICTURE_EXTENSION_BY_TYPE = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/x-png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

const normalizeDobOrYob = (value) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value?.format === "function") return value.format("YYYY-MM-DD");
  return null;
};

const getValueFromUploadEvent = (event) => (
  Array.isArray(event) ? event : event?.fileList
);

const fileNameHasAcceptedImageExtension = (fileName = "") => (
  ACCEPTED_PROFILE_PICTURE_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension))
);

const getExtensionFromFileName = (fileName = "") => {
  const match = fileName.match(/(\.[^.]+)$/);
  return match ? match[1].toLowerCase() : "";
};

const sanitizeProfilePictureFileName = (file) => {
  const originalName = file?.name || "profile_picture";
  const originalExtension = getExtensionFromFileName(originalName);
  const derivedExtension = originalExtension || PROFILE_PICTURE_EXTENSION_BY_TYPE[file?.type] || "";
  const baseName = originalExtension
    ? originalName.slice(0, -originalExtension.length)
    : originalName;

  const sanitizedBaseName = baseName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const finalFileName = `${sanitizedBaseName || "profile_picture"}${derivedExtension}`;

  if (finalFileName === originalName) {
    return file;
  }

  return new File([file], finalFileName, {
    type: file?.type || "application/octet-stream",
    lastModified: file?.lastModified || Date.now()
  });
};

const getLocalPreviewDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const beforeUploadProfilePicture = (file, intl, message) => {
  const isImage = ACCEPTED_PROFILE_PICTURE_TYPES.has(file.type) || fileNameHasAcceptedImageExtension(file.name);
  if (!isImage) {
    message.error(intl.formatMessage({ id: "enrollment.form.profilePictureInvalidType" }));
    return Upload.LIST_IGNORE;
  }

  const isUnderThreeMb = file.size / 1024 / 1024 <= 3;
  if (!isUnderThreeMb) {
    message.error(intl.formatMessage({ id: "enrollment.form.profilePictureTooLarge" }));
    return Upload.LIST_IGNORE;
  }

  return sanitizeProfilePictureFileName(file);
};

const logEnrollmentProfilePictureFieldDebug = (message, payload) => {
  if (env.ENVIROMENT !== "prod") {
    console.log(`[EnrollmentProfilePictureField] ${message}`, payload ?? "");
  }
};

export default function EnrollmentProfilePictureField({
  emailId,
  dobOrYob,
  contactInternalId,
  token,
  enrollmentStyle,
  submittingLoading,
  isEnabled = true,
  skipExistingProfileLookup = false
}) {
  const intl = useIntl();
  const { message } = App.useApp();
  const locale = true;
  const [requirement, setRequirement] = useState({
    checked: false,
    loading: false,
    requiresUpload: false,
    profileUrl: null
  });
  const form = Form.useFormInstance();

  const normalizedDobOrYob = useMemo(
    () => normalizeDobOrYob(dobOrYob),
    [dobOrYob]
  );

  const setLocale = (isLocaleOn, localeKey) => (
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString()
  );

  useEffect(() => {
    let isActive = true;

    logEnrollmentProfilePictureFieldDebug("effect:start", {
      isEnabled,
      emailId: emailId || null,
      normalizedDobOrYob: normalizedDobOrYob || null,
      contactInternalId: contactInternalId || null,
      hasToken: !!token,
      forceProfilePictureUpload: !!env.IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD,
      skipExistingProfileLookup
    });

    if (!isEnabled || !emailId || (!normalizedDobOrYob && !contactInternalId)) {
      logEnrollmentProfilePictureFieldDebug("effect:skippingLookup", {
        isEnabled,
        hasEmailId: !!emailId,
        hasDobOrYob: !!normalizedDobOrYob,
        hasContactInternalId: !!contactInternalId
      });

      setRequirement({
        checked: false,
        loading: false,
        requiresUpload: false,
        profileUrl: null
      });
      if (form) {
        form.setFieldsValue({ [PROFILE_PICTURE_FIELD_NAME]: [] });
      }
      return () => {
        isActive = false;
      };
    }

    setRequirement((previous) => ({
      ...previous,
      checked: false,
      loading: true
    }));

    logEnrollmentProfilePictureFieldDebug("effect:requestingRequirement", {
      emailId,
      normalizedDobOrYob,
      contactInternalId,
      hasToken: !!token
    });

    LrnManager.getEnrollmentProfilePictureRequirement({
      emailId,
      dobOrYob: normalizedDobOrYob,
      contactInternalId,
      token,
      skipExistingProfileLookup
    }).then((result) => {
      if (!isActive) return;

      logEnrollmentProfilePictureFieldDebug("effect:requirementResolved", result);

      setRequirement({
        checked: true,
        loading: false,
        requiresUpload: !!result?.requiresUpload,
        profileUrl: result?.profileUrl || null
      });

      if (!result?.requiresUpload && form) {
        form.setFieldsValue({ [PROFILE_PICTURE_FIELD_NAME]: [] });
      }
    }).catch((error) => {
      console.error("Failed to resolve enrollment profile picture requirement", error);
      logEnrollmentProfilePictureFieldDebug("effect:requirementFailed", {
        message: error?.message || "Unknown error"
      });
      if (!isActive) return;
      setRequirement({
        checked: true,
        loading: false,
        requiresUpload: true,
        profileUrl: null
      });
    });

    return () => {
      isActive = false;
    };
  }, [isEnabled, emailId, normalizedDobOrYob, contactInternalId, token, form, skipExistingProfileLookup]);

  if (!isEnabled) return null;

  if (requirement.checked && !requirement.requiresUpload && requirement.profileUrl) {
    logEnrollmentProfilePictureFieldDebug("render:hidingFieldBecauseProfileExists", {
      profileUrl: requirement.profileUrl
    });
    return null;
  }

  // isChecking covers both: initial state (not yet triggered) and in-flight lookup.
  // The Form.Item is always rendered so its validator is always registered with the form.
  // During checking the Form.Item is hidden (display:none) but still mounted, so
  // form.validateFields() will correctly reject if the user somehow triggers submit early.
  const isChecking = requirement.loading || !requirement.checked;

  logEnrollmentProfilePictureFieldDebug("render:showingUploadField", { ...requirement, isChecking });

  return (
    <Card
      style={enrollmentStyle}
      title={setLocale(locale, "enrollment.form.profilePictureCardTitle")}
      loading={submittingLoading}
      variant="outlined"
    >
      {isChecking ? (
        <Spin style={{ display: "block", margin: "16px auto" }} />
      ) : (
        <p style={{ marginBottom: 12 }}>
          {intl.formatMessage({ id: "enrollment.form.profilePictureCardDescription" })}
        </p>
      )}

      <Form.Item
        name={PROFILE_PICTURE_FIELD_NAME}
        valuePropName="fileList"
        getValueFromEvent={getValueFromUploadEvent}
        preserve={false}
        style={isChecking ? { display: "none" } : undefined}
        rules={[
          {
            validator: (_, fileList) => (
              fileList && fileList.length > 0
                ? Promise.resolve()
                : Promise.reject(new Error(intl.formatMessage({ id: "enrollment.form.profilePictureRequiredError" })))
            )
          }
        ]}
      >
        <Upload
          listType="picture-card"
          accept="image/*"
          beforeUpload={(file) => beforeUploadProfilePicture(file, intl, message)}
          previewFile={getLocalPreviewDataUrl}
          customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
          maxCount={1}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>
              {setLocale(locale, "enrollment.form.profilePictureUploadCta")}
            </div>
          </div>
        </Upload>
      </Form.Item>
    </Card>
  );
}

export { PROFILE_PICTURE_FIELD_NAME };
