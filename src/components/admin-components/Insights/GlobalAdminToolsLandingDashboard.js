import React, { useState, useEffect, useMemo } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Input, Select, Radio, Tag, Button, AutoComplete, message, Descriptions, Empty } from 'antd';
import { SearchOutlined, UserOutlined, BookOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import IntlMessage from 'components/util-components/IntlMessage';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import {
  onLoadingAdminToolsInit,
  onAssigningRoleToCourse,
  onAssigningGlobalRole,
  onClearSelectedContact
} from "redux/actions/AdminTools";

const GlobalAdminToolsLandingDashboard = (props) => {
  const {
    user,
    allCourses,
    allRoles,
    allEnrollees,
    onLoadingAdminToolsInit,
    onAssigningRoleToCourse,
    onAssigningGlobalRole,
    onClearSelectedContact
  } = props;

  const [activeOuterTabKey, setActiveOuterTabKey] = useState('access');
  const [searchText, setSearchText] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [actionType, setActionType] = useState('enroll');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const locale = true;
  const setLocale = (isLocaleOn, localeKey) =>
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

  const emailId = user?.emailId || null;

  useEffect(() => {
    if (emailId) {
      onLoadingAdminToolsInit(emailId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailId]);

  useEffect(() => {
    if (selectedContact?.Emails?.length > 0) {
      setSelectedEmail(selectedContact.Emails[0].EmailId);
    }
  }, [selectedContact]);

  /* ── Client-side search over pre-loaded enrollees ── */
  const filteredEnrollees = useMemo(() => {
    if (!searchText || searchText.length < 2 || !allEnrollees?.length) return [];
    const lower = searchText.toLowerCase();
    return allEnrollees.filter(e =>
      (e.FullName || '').toLowerCase().includes(lower) ||
      (e.Names || '').toLowerCase().includes(lower) ||
      (e.LastNames || '').toLowerCase().includes(lower) ||
      (e.Emails || []).some(em => (em.EmailId || '').toLowerCase().includes(lower))
    ).slice(0, 20);
  }, [searchText, allEnrollees]);

  if (user?.emailId && !user?.yearOfBirth) {
    return (
      <div id="unathenticated-landing-page-margin">
        <EmailYearSearchForm />
      </div>
    );
  }

  const searchOptions = filteredEnrollees.map(e => ({
    key: e.ContactInternalId,
    value: `${e.FullName || `${e.Names} ${e.LastNames}`} — ${e.Emails?.[0]?.EmailId || ''}`,
    label: (
      <div>
        <strong>{e.FullName || `${e.Names} ${e.LastNames}`}</strong>
        <br />
        <small style={{ color: '#888' }}>{(e.Emails || []).map(em => em.EmailId).join(', ')}</small>
      </div>
    ),
  }));

  const handleSearchChange = (value) => setSearchText(value);

  const handleContactSelect = (value, option) => {
    const found = (allEnrollees || []).find(e => e.ContactInternalId === option.key);
    setSelectedContact(found || null);
  };

  const handleClearContact = () => {
    onClearSelectedContact();
    setSelectedContact(null);
    setSearchText('');
    setSelectedCourse(null);
    setSelectedRole(null);
    setSelectedEmail(null);
  };

  const handleSubmit = async () => {
    if (!selectedContact) {
      message.warning('Please select a contact first.');
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'enroll') {
        if (!selectedCourse || !selectedRole) {
          message.warning('Please select a course and a role.');
          setSubmitting(false);
          return;
        }
        await onAssigningRoleToCourse(
          selectedContact.ContactInternalId,
          selectedCourse,
          selectedRole,
          selectedEmail,
          emailId
        );
        message.success('Role assigned to course successfully.');
      } else {
        if (!selectedRole) {
          message.warning('Please select a role.');
          setSubmitting(false);
          return;
        }
        await onAssigningGlobalRole(
          selectedContact.ContactInternalId,
          selectedRole,
          emailId
        );
        message.success('Global role assigned successfully.');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      message.error('Error assigning role.');
    }
    setSubmitting(false);
  };

  const courseSelectOptions = (allCourses || []).map(c => ({
    key: c.value,
    value: c.value,
    label: c.name || c.value
  }));

  const roleSelectOptions = (allRoles || []).map(r => ({
    key: r.UserRoleId,
    value: r.UserRoleId,
    label: r.UserRoleId
  }));

  const renderContactSummary = () => {
    if (!selectedContact) return null;

    const emails = (selectedContact.Emails || []).map(e => e.EmailId);
    const roles = selectedContact.UserCourseRoles || [];
    const courses = selectedContact.CoursesHistory || [];

    return (
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered>
          <Descriptions.Item label="Name">
            {selectedContact.FullName || `${selectedContact.Names} ${selectedContact.LastNames}`}
          </Descriptions.Item>
          <Descriptions.Item label="Contact ID">
            {selectedContact.ContactExternalId || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {emails.length > 1 ? (
              <Select
                value={selectedEmail}
                onChange={setSelectedEmail}
                style={{ minWidth: 200 }}
                size="small"
                options={emails.map(e => ({ value: e, label: e }))}
              />
            ) : (
              <span>{emails[0] || '—'}</span>
            )}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 12 }}>
          <strong>Roles: </strong>
          {roles.length > 0
            ? roles.map((r, i) => (
                <Tag color="blue" key={i}>
                  {r.UserRoleId}{r.CourseCodeId ? ` (${r.CourseCodeId})` : ''}
                </Tag>
              ))
            : <span style={{ color: '#999' }}>None</span>
          }
        </div>

        <div style={{ marginTop: 8 }}>
          <strong>Courses: </strong>
          {courses.length > 0
            ? courses.map((c, i) => (
                <Tag color="green" key={i}>
                  {c.CourseDetails?.course || c.CourseCodeId}
                </Tag>
              ))
            : <span style={{ color: '#999' }}>None</span>
          }
        </div>

        <Button type="link" danger onClick={handleClearContact} style={{ padding: 0, marginTop: 8 }}>
          Clear selection
        </Button>
      </Card>
    );
  };

  const renderAccessManagement = () => (
    <>
      {/* Step 1: Search Contact */}
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          Search Contact
        </h4>
        <AutoComplete
          style={{ width: '100%' }}
          options={searchOptions}
          value={searchText}
          onSearch={handleSearchChange}
          onChange={handleSearchChange}
          onSelect={handleContactSelect}
          placeholder="Search by name or email..."
          filterOption={false}
        >
          <Input prefix={<SearchOutlined />} size="large" />
        </AutoComplete>
      </Card>

      {/* Step 2: Contact Summary */}
      {renderContactSummary()}

      {/* Step 3: Action Form */}
      {selectedContact && (
        <Card variant="outlined" size="small">
          <h4 style={{ marginBottom: 12 }}>
            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
            Assign Access
          </h4>

          <Radio.Group
            value={actionType}
            onChange={(e) => { setActionType(e.target.value); setSelectedRole(null); setSelectedCourse(null); }}
            style={{ marginBottom: 16 }}
          >
            <Radio.Button value="enroll">Enroll to Course</Radio.Button>
            <Radio.Button value="global">Assign Global Role</Radio.Button>
          </Radio.Group>

          <Row gutter={16}>
            {actionType === 'enroll' && (
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: 8 }}><strong>Course</strong></div>
                <Select
                  showSearch
                  placeholder="Select course"
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  style={{ width: '100%' }}
                  options={courseSelectOptions}
                  filterOption={(input, option) =>
                    (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Col>
            )}
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8 }}><strong>Role</strong></div>
              <Select
                showSearch
                placeholder="Select role"
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: '100%' }}
                options={roleSelectOptions}
                filterOption={(input, option) =>
                  (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Col>
            {actionType === 'enroll' && (
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: 8 }}><strong>Email</strong></div>
                {(selectedContact.Emails || []).length > 1 ? (
                  <Select
                    value={selectedEmail}
                    onChange={setSelectedEmail}
                    style={{ width: '100%' }}
                    options={(selectedContact.Emails || []).map(e => ({ value: e.EmailId, label: e.EmailId }))}
                  />
                ) : (
                  <Input value={selectedEmail || ''} readOnly />
                )}
              </Col>
            )}
          </Row>

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            style={{ marginTop: 16 }}
            disabled={!selectedRole || (actionType === 'enroll' && !selectedCourse)}
          >
            {actionType === 'enroll' ? 'Assign to Course' : 'Assign Global Role'}
          </Button>
        </Card>
      )}

      {!selectedContact && !searchText && (
        <Empty description="Search for a contact to get started" style={{ marginTop: 40 }} />
      )}
    </>
  );

  const renderCourseManagement = () => (
    <Card variant="outlined" size="small">
      <h4 style={{ marginBottom: 12 }}>
        <BookOutlined style={{ marginRight: 8 }} />
        Course Management
      </h4>
      <Empty description="Course management coming soon — Create, edit, and archive courses" />
    </Card>
  );

  const coverUrl = 'https://images.unsplash.com/photo-1593153041370-5ebf6b82886a?q=80&w=1461&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const outerTabsConfig = [
    { key: 'access', tab: <span><UserOutlined /> Access Management</span> },
    { key: 'courses', tab: <span><BookOutlined /> Course Management</span> }
  ];

  return (
    <div className="container customerName">
      <Card
        variant="outlined"
        cover={<img alt="adminTools" src={coverUrl} style={{ height: 100, objectFit: 'cover' }} />}
      >
        <h1 style={{ marginBottom: '10px', textAlign: 'left' }}>
          {setLocale(locale, 'profile.globalAdminTools')}
        </h1>
      </Card>

      <Card
        variant="outlined"
        tabList={outerTabsConfig}
        activeTabKey={activeOuterTabKey}
        onTabChange={setActiveOuterTabKey}
      >
        {activeOuterTabKey === 'access' && renderAccessManagement()}
        {activeOuterTabKey === 'courses' && renderCourseManagement()}
      </Card>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onLoadingAdminToolsInit,
    onAssigningRoleToCourse,
    onAssigningGlobalRole,
    onClearSelectedContact
  }, dispatch);
}

const mapStateToProps = ({ adminTools, grant }) => {
  const { user } = grant;
  const { allCourses, allRoles, allEnrollees } = adminTools;
  return { user, allCourses, allRoles, allEnrollees };
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalAdminToolsLandingDashboard);
