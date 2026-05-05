import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload
} from 'antd';
import { PlusOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import Flag from 'react-world-flags';
import dayjs from 'dayjs';
import IntlMessage from 'components/util-components/IntlMessage';
import ContactProfileEditorLob from 'lob/ContactProfileEditor';

const PROFILE_PICTURE_FIELD_NAME = 'profilePictureUpload';
const ACCEPTED_PROFILE_PICTURE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/x-png', 'image/webp', 'image/gif']);

const getUploadValueFromEvent = (event) => (
  Array.isArray(event) ? event : event?.fileList
);

const getDateValue = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const getDivisionOptions = (divisions = [], initialValue) => {
  const options = (divisions || []).map((division) => ({
    value: division?.CountryDivisionId,
    searchText: division?.CountryDivisionName || '',
    label: (
      <>
        <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
        {division?.CountryDivisionName || division?.CountryDivisionId}
      </>
    )
  }));

  if (
    initialValue &&
    !options.some(option => option.value === initialValue || option.label === initialValue)
  ) {
    options.unshift({
      value: initialValue,
      searchText: String(initialValue),
      label: String(initialValue)
    });
  }

  return options;
};

const ContactProfileEditor = ({
  open,
  contact,
  countries = [],
  selfLanguageLevel = [],
  languageData = [],
  submitting = false,
  canEdit = true,
  onClose,
  onSubmit,
  onRequestingGeographicalDivision
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [residencyDivisions, setResidencyDivisions] = useState([]);
  const [birthDivisions, setBirthDivisions] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  const t = (id) => intl.formatMessage({ id });
  const initialValues = useMemo(
    () => ContactProfileEditorLob.buildInitialContactProfileValues(contact),
    [contact]
  );
  const languageRows = useMemo(
    () => ContactProfileEditorLob.buildEditableLanguageRows(contact, languageData),
    [contact, languageData]
  );
  const countryOptions = useMemo(() => (
    (countries || []).map((country) => ({
      value: country?.CountryId,
      searchText: `${country?.NativeCountryName || ''} | ${country?.CountryName || ''}`,
      label: (
        <>
          <Flag code={country?.CountryId} style={{ width: 20, marginRight: 10 }} />
          {`${country?.NativeCountryName || country?.CountryId} | ${country?.CountryName || country?.CountryId}`}
        </>
      )
    }))
  ), [countries]);
  const languageLevelOptions = useMemo(() => {
    const currentLevelValues = new Set(
      (languageRows || [])
        .map(row => row.languageLevelAbbreviation)
        .filter(Boolean)
    );
    const options = (selfLanguageLevel || []).map((level) => {
      const value = level?.LevelAbbreviation;
      if (value) currentLevelValues.delete(value);

      return {
        value,
        searchText: level?.LocalizationKey
          ? intl.formatMessage({
              id: level.LocalizationKey,
              defaultMessage: level?.LocalizationDescription || value
            })
          : (level?.LocalizationDescription || value || ''),
        label: level?.LocalizationKey
          ? <IntlMessage id={level.LocalizationKey} />
          : (level?.LocalizationDescription || value)
      };
    }).filter(option => option.value);

    currentLevelValues.forEach((value) => {
      options.push({
        value,
        searchText: String(value).toUpperCase(),
        label: String(value).toUpperCase()
      });
    });

    return options;
  }, [intl, languageRows, selfLanguageLevel]);
  const residencyDivisionOptions = useMemo(
    () => getDivisionOptions(residencyDivisions, initialValues.countryDivisionOfResidence),
    [residencyDivisions, initialValues.countryDivisionOfResidence]
  );
  const birthDivisionOptions = useMemo(
    () => getDivisionOptions(birthDivisions, initialValues.countryDivisionOfBirth),
    [birthDivisions, initialValues.countryDivisionOfBirth]
  );

  const filterOption = (input, option) => (
    (option?.searchText || option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      ...initialValues,
      dateOfBirth: getDateValue(initialValues.dateOfBirth),
      [PROFILE_PICTURE_FIELD_NAME]: []
    });
  }, [form, initialValues, open]);

  useEffect(() => {
    if (!open || !initialValues.countryOfResidence || !onRequestingGeographicalDivision) return;

    onRequestingGeographicalDivision(initialValues.countryOfResidence)
      ?.then((result) => {
        setResidencyDivisions(Array.isArray(result?.countryDivisions) ? result.countryDivisions : []);
      })
      ?.catch(() => setResidencyDivisions([]));
  }, [initialValues.countryOfResidence, onRequestingGeographicalDivision, open]);

  useEffect(() => {
    if (!open || !initialValues.countryOfBirth || !onRequestingGeographicalDivision) return;

    onRequestingGeographicalDivision(initialValues.countryOfBirth)
      ?.then((result) => {
        setBirthDivisions(Array.isArray(result?.countryDivisions) ? result.countryDivisions : []);
      })
      ?.catch(() => setBirthDivisions([]));
  }, [initialValues.countryOfBirth, onRequestingGeographicalDivision, open]);

  const handleResidencyCountryChange = async (countryId) => {
    form.setFieldsValue({ countryDivisionOfResidence: null });
    if (!countryId || !onRequestingGeographicalDivision) {
      setResidencyDivisions([]);
      return;
    }

    const result = await onRequestingGeographicalDivision(countryId);
    setResidencyDivisions(Array.isArray(result?.countryDivisions) ? result.countryDivisions : []);
  };

  const handleBirthCountryChange = async (countryId) => {
    form.setFieldsValue({ countryDivisionOfBirth: null });
    if (!countryId || !onRequestingGeographicalDivision) {
      setBirthDivisions([]);
      return;
    }

    const result = await onRequestingGeographicalDivision(countryId);
    setBirthDivisions(Array.isArray(result?.countryDivisions) ? result.countryDivisions : []);
  };

  const beforeUpload = (file) => {
    if (!ACCEPTED_PROFILE_PICTURE_TYPES.has(file.type)) {
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const buildUpdateContext = (values) => {
    const normalizedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      profilePictureUpload: values[PROFILE_PICTURE_FIELD_NAME] || []
    };
    const payload = ContactProfileEditorLob.buildUpsertEnrolleeListPayload({
      values: normalizedValues,
      contact,
      countries,
      residencyDivisions,
      birthDivisions
    });
    const patch = ContactProfileEditorLob.buildContactProfilePatch({
      values: normalizedValues,
      contact,
      countries,
      residencyDivisions,
      birthDivisions
    });
    const changeSummary = ContactProfileEditorLob.buildContactProfileChangeSummary({
      initialValues,
      values: normalizedValues,
      countries,
      residencyDivisions,
      birthDivisions,
      languageRows
    });

    return {
      values: normalizedValues,
      payload,
      patch,
      changeSummary,
      filesMap: {
        [PROFILE_PICTURE_FIELD_NAME]: normalizedValues.profilePictureUpload
      }
    };
  };

  const handleReview = async () => {
    const values = await form.validateFields();
    const updateContext = buildUpdateContext(values);
    setPendingUpdate(updateContext);
    setReviewOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingUpdate || !onSubmit) return;
    await onSubmit(pendingUpdate);
    setReviewOpen(false);
  };

  const handleClose = () => {
    setReviewOpen(false);
    setPendingUpdate(null);
    onClose?.();
  };

  const handleAfterOpenChange = (isOpen) => {
    if (isOpen) return;

    form.resetFields();
    setReviewOpen(false);
    setPendingUpdate(null);
  };

  useEffect(() => {
    const handleResizeObserverLoopError = (event) => {
      const message = event?.message || '';
      const isResizeObserverLoopError =
        message === 'ResizeObserver loop completed with undelivered notifications.' ||
        message === 'ResizeObserver loop limit exceeded';

      if (isResizeObserverLoopError) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('error', handleResizeObserverLoopError, true);

    return () => {
      window.removeEventListener('error', handleResizeObserverLoopError, true);
    };
  }, []);

  const reviewColumns = [
    {
      title: t('admin.tools.profileEditor.field'),
      dataIndex: 'label',
      key: 'label'
    },
    {
      title: t('admin.tools.profileEditor.before'),
      dataIndex: 'before',
      key: 'before'
    },
    {
      title: t('admin.tools.profileEditor.after'),
      dataIndex: 'after',
      key: 'after'
    }
  ];

  return (
    <>
      <Drawer
        title={(
          <span>
            <UserOutlined style={{ marginRight: 8 }} />
            <IntlMessage id="admin.tools.profileEditor.title" />
          </span>
        )}
        open={open}
        size={760}
        onClose={handleClose}
        afterOpenChange={handleAfterOpenChange}
        extra={(
          <Space>
            <Button onClick={handleClose}>
              <IntlMessage id="admin.tools.course.btn.cancel" />
            </Button>
            <Button type="primary" icon={<SaveOutlined />} loading={submitting} disabled={!canEdit} onClick={handleReview}>
              <IntlMessage id="admin.tools.course.btn.save" />
            </Button>
          </Space>
        )}
      >
        {!canEdit && (
          <Alert
            type="warning"
            showIcon
            title={<IntlMessage id="admin.tools.profileEditor.notAllowed" />}
            style={{ marginBottom: 16 }}
          />
        )}

        <Descriptions size="small" bordered column={1} style={{ marginBottom: 16 }}>
          <Descriptions.Item label={<IntlMessage id="admin.tools.label.internalId" />}>
            {initialValues.contactInternalId || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={<IntlMessage id="admin.tools.label.externalId" />}>
            {initialValues.contactExternalId || '—'}
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical" disabled={!canEdit}>
          <Divider titlePlacement="left"><IntlMessage id="admin.tools.profileEditor.identity" /></Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="names"
                label={<IntlMessage id="admin.tools.label.name" />}
                rules={[{ required: true, message: t('admin.tools.profileEditor.required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="lastNames"
                label={<IntlMessage id="admin.tools.label.lastName" />}
                rules={[{ required: true, message: t('admin.tools.profileEditor.required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="dateOfBirth"
                label={<IntlMessage id="admin.tools.label.dateOfBirth" />}
                rules={[{ required: true, message: t('admin.tools.profileEditor.required') }]}
              >
                <DatePicker style={{ width: '100%' }} disabledDate={current => current && current > dayjs().endOf('day')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="sex" label={<IntlMessage id="admin.tools.label.sex" />}>
                <Select
                  options={[
                    { value: 'F', label: 'F' },
                    { value: 'M', label: 'M' }
                  ]}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left"><IntlMessage id="admin.tools.profileEditor.communication" /></Divider>
          <Form.Item
            name="emails"
            label={<IntlMessage id="admin.tools.label.email" />}
            rules={[{ required: true, message: t('admin.tools.profileEditor.required') }]}
          >
            <Select mode="tags" tokenSeparators={[',', ' ']} />
          </Form.Item>

          <Divider titlePlacement="left"><IntlMessage id="admin.tools.label.geography" /></Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="countryOfBirth" label={<IntlMessage id="admin.tools.label.birthLocation" />}>
                <Select
                  showSearch
                  filterOption={filterOption}
                  options={countryOptions}
                  onChange={handleBirthCountryChange}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="countryDivisionOfBirth" label={<IntlMessage id="admin.tools.profileEditor.birthRegion" />}>
                <Select
                  showSearch
                  filterOption={filterOption}
                  options={birthDivisionOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="countryOfResidence" label={<IntlMessage id="admin.tools.label.residencyLocation" />}>
                <Select
                  showSearch
                  filterOption={filterOption}
                  options={countryOptions}
                  onChange={handleResidencyCountryChange}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="countryDivisionOfResidence" label={<IntlMessage id="admin.tools.profileEditor.residencyRegion" />}>
                <Select
                  showSearch
                  filterOption={filterOption}
                  options={residencyDivisionOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          {languageRows.length > 0 && (
            <>
              <Divider titlePlacement="left"><IntlMessage id="admin.tools.label.languageHistory" /></Divider>
              <Row gutter={16}>
                {languageRows.map((row) => (
                  <Col xs={24} md={12} key={row.languageId}>
                    <Form.Item
                      name={['languageProficiencies', row.languageId]}
                      label={(
                        <span>
                          {row.languageIcon && <Flag code={row.languageIcon} style={{ width: 20, marginRight: 8 }} />}
                          {row.languageName}
                        </span>
                      )}
                    >
                      <Select
                        showSearch
                        filterOption={filterOption}
                        options={languageLevelOptions}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </>
          )}

          <Divider titlePlacement="left"><IntlMessage id="admin.tools.profileEditor.profileImage" /></Divider>
          <Form.Item
            name={PROFILE_PICTURE_FIELD_NAME}
            valuePropName="fileList"
            getValueFromEvent={getUploadValueFromEvent}
          >
            <Upload
              listType="picture-card"
              accept="image/*"
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}><IntlMessage id="enrollment.form.profilePictureUploadCta" /></div>
              </div>
            </Upload>
          </Form.Item>
          <Tag color="default"><IntlMessage id="admin.tools.profileEditor.notificationNote" /></Tag>
        </Form>
      </Drawer>

      <Modal
        title={<IntlMessage id="admin.tools.profileEditor.reviewTitle" />}
        open={reviewOpen}
        okText={t('admin.tools.confirmYes')}
        cancelText={t('admin.tools.confirmNo')}
        confirmLoading={submitting}
        onCancel={() => setReviewOpen(false)}
        onOk={handleConfirm}
      >
        <Alert
          type="warning"
          showIcon
          title={<IntlMessage id="admin.tools.profileEditor.reviewWarning" />}
          style={{ marginBottom: 12 }}
        />
        <Table
          size="small"
          pagination={false}
          columns={reviewColumns}
          dataSource={pendingUpdate?.changeSummary || []}
          rowKey="key"
          locale={{ emptyText: t('admin.tools.profileEditor.noChanges') }}
        />
      </Modal>
    </>
  );
};

export { PROFILE_PICTURE_FIELD_NAME };
export default ContactProfileEditor;
