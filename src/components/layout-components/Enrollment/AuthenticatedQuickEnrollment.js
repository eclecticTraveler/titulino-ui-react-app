import React, { useState, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  onRenderingCourseRegistration,
  onSearchingForAlreadyEnrolledContact,
  onRequestingGeographicalDivision,
  onSubmittingAuthenticatedEnrollee,
  onResetSubmittingEnrollee,
  onSelectingEnrollmentCourses
} from "redux/actions/Lrn";
import { Form, Select, Button, Card, Row, Col, Radio, Space, Tabs } from "antd";
import Flag from "react-world-flags";
import CourseDetails from "./CourseDetails";
import EnrollmentProfilePictureField, { PROFILE_PICTURE_FIELD_NAME } from "./EnrollmentProfilePictureField";
import { useIntl } from "react-intl";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import IntlMessage from "components/util-components/IntlMessage";
import getLocaleText from "components/util-components/IntString";
import TermsModal from "./TermsModal";
import EnrollmentModal from "./EnrollmentModal";
import { env } from "configs/EnvironmentConfig";
import EmailYearSearchForm from "components/layout-components/EmailYearSearchForm";

export const AuthenticatedQuickEnrollment = (props) => {
  const {
    availableCourses,
    onSearchingForAlreadyEnrolledContact,
    onRequestingGeographicalDivision,
    baseLanguage,
    passedSubmitBtnEnabled,
    onSubmittingAuthenticatedEnrollee,
    selfLanguageLevel,
    countries,
    user,
    token,
    selectedCoursesToEnroll,
    onSelectingEnrollmentCourses
  } = props;
  const [form] = Form.useForm();
  const [, setConfirmVisible] = useState(false);
  const [isGeographyInfoVisible, setGeographyInfoVisible] = useState(false);
  const [selectedCountryOfResidence, setSelectedCountryOfResidence] = useState(null);
  const [selectedBirthCountry, setSelectedBirthCountry] = useState(null);
  const [residencyDivisions, setDivisions] = useState([]);
  const [birthDivisions, setBirthDivisions] = useState([]);
  const [isSubmitEnabled, setSubmitEnabled] = useState(passedSubmitBtnEnabled ?? false);
  const [, setLoading] = useState(false);
  const [returningEnrolleeCountryDivisionInfo, setReturningEnrolleeCountryDivisionInfo] = useState(null);
  const [, setEnrolleeResidencyDivision] = useState("");
  const [, setEnrolleeBirthDivision] = useState("");
  const [isEnrollmentModalVisible, setIsEnrollmentModalVisible] = useState(false);
  const [submittingLoading, setSubmittingLoading] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const intl = useIntl();
  const locale = true;
  const termsVersionLabel = "v2.1";
  const hasAuthenticatedEnrollmentProfile = !!user?.contactId && !!user?.emailId;
  const profilePictureToken = user?.innerToken || null;
  const profilePictureContactInternalId = user?.contactInternalId || returningEnrolleeCountryDivisionInfo?.contactInternalId || null;

  const setLocale = (isLocaleOn, localeKey) => (
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString()
  );

  const setLocaleString = (isLocaleOn, localeKey, defaultMessage = "") => (
    isLocaleOn
      ? getLocaleText(localeKey, defaultMessage)
      : localeKey.toString()
  );

  const filterOption = (input, option) => (
    (option?.searchText || "").toLowerCase().includes(input.toLowerCase())
  );

  const countryOptions = useMemo(() => (
    (countries || []).map((country) => ({
      value: country.CountryId,
      searchText: `${country?.NativeCountryName} | ${country?.CountryName}`,
      label: (
        <>
          <Flag code={country.CountryId} style={{ width: 20, marginRight: 10 }} />
          {`${country?.NativeCountryName} | ${country?.CountryName}`}
        </>
      )
    }))
  ), [countries]);

  const residencyDivisionOptions = useMemo(() => (
    (residencyDivisions || []).map((division) => ({
      value: division?.CountryDivisionId,
      searchText: division?.CountryDivisionName || "",
      label: (
        <>
          <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
          {division?.CountryDivisionName}
        </>
      )
    }))
  ), [residencyDivisions]);

  const birthDivisionOptions = useMemo(() => (
    (birthDivisions || []).map((division) => ({
      value: division?.CountryDivisionId,
      searchText: division?.CountryDivisionName || "",
      label: (
        <>
          <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
          {division?.CountryDivisionName}
        </>
      )
    }))
  ), [birthDivisions]);

  useEffect(() => {
    if (!pendingSubmission?.records?.length) return;

    const upsertFormattedData = async () => {
      const { records, filesMap, recaptchaToken } = pendingSubmission;
      const upsertedRecords = await onSubmittingAuthenticatedEnrollee(records, filesMap, user, recaptchaToken);
      const wasSuccessful = upsertedRecords?.wasSubmittingEnrolleeSucessful;

      if (wasSuccessful === true) {
        setIsEnrollmentModalVisible(true);
      } else if (wasSuccessful === false) {
        console.log("wasSuccessful", wasSuccessful);
        setIsEnrollmentModalVisible(false);
      }

      setSubmittingLoading(false);
    };

    upsertFormattedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSubmission]);

  const handleCloseModal = () => {
    setIsEnrollmentModalVisible(false);
    resetQuickEnrollmentInputValues();
  };

  useEffect(() => {
    const checkFormValidity = async () => {
      try {
        await form.validateFields();
      } catch (error) {
        console.log("Form invalid", error);
      }
    };

    checkFormValidity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  useEffect(() => {
    if (returningEnrolleeCountryDivisionInfo?.countryOfResidencyId) {
      setSelectedCountryOfResidence(returningEnrolleeCountryDivisionInfo?.countryOfResidencyId);
    }

    if (returningEnrolleeCountryDivisionInfo?.countryOfBirthId) {
      setSelectedBirthCountry(returningEnrolleeCountryDivisionInfo?.countryOfBirthId);
    }

    setConfirmVisible(true);
  }, [returningEnrolleeCountryDivisionInfo]);

  useEffect(() => {
    if (selectedCountryOfResidence) {
      const fetchDivisions = async () => {
        const divisions = await onRequestingGeographicalDivision(selectedCountryOfResidence);
        const divisionList = Array.isArray(divisions?.countryDivisions) ? divisions?.countryDivisions : [];
        setDivisions(divisionList);

        if (divisionList?.length === 0) {
          form.setFieldsValue({ countryDivisionOfResidence: null });
        }
      };
      fetchDivisions();
    } else {
      setDivisions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryOfResidence]);

  useEffect(() => {
    if (selectedBirthCountry) {
      const fetchBirthDivisions = async () => {
        const birthCountryDivisions = await onRequestingGeographicalDivision(selectedBirthCountry);
        const divisionList = Array.isArray(birthCountryDivisions?.countryDivisions) ? birthCountryDivisions?.countryDivisions : [];
        setBirthDivisions(divisionList);

        if (divisionList?.length === 0) {
          form.setFieldsValue({ countryDivisionOfBirth: null });
        }
      };
      fetchBirthDivisions();
    } else {
      setBirthDivisions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBirthCountry]);

  useEffect(() => {
    if (token && user?.contactId) {
      const onFindMe = async () => {
        setSubmitEnabled(false);
        setLoading(true);
        const year = user?.yearOfBirth;
        const email = user?.emailId;

        if (year && email) {
          try {
            const enrolleeInformation = await onSearchingForAlreadyEnrolledContact(email, year);
            setReturningEnrolleeCountryDivisionInfo(enrolleeInformation?.returningEnrollee ?? null);

            if (enrolleeInformation?.returningEnrollee?.contactExternalId) {
              setGeographyInfoVisible(true);
              setSubmitEnabled(true);
            } else if (hasAuthenticatedEnrollmentProfile) {
              setGeographyInfoVisible(true);
              setSubmitEnabled(true);
            }
          } catch (error) {
            console.error("Error searching for enrollee:", error);
            setReturningEnrolleeCountryDivisionInfo(null);
            if (hasAuthenticatedEnrollmentProfile) {
              setGeographyInfoVisible(true);
              setSubmitEnabled(true);
            }
          }
        }

        setLoading(false);
      };

      onFindMe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.contactId, hasAuthenticatedEnrollmentProfile]);

  useEffect(() => {
    if (env.ENVIROMENT !== "prod" && isGeographyInfoVisible && isSubmitEnabled) {
      console.log("[AuthenticatedQuickEnrollment] profilePictureContext", {
        emailId: user?.emailId || null,
        yearOfBirth: user?.yearOfBirth || null,
        contactInternalId: profilePictureContactInternalId,
        hasUserInnerToken: !!user?.innerToken,
        hasAuthToken: !!token,
        isUsingProfilePictureToken: !!profilePictureToken
      });
    }
  }, [
    isGeographyInfoVisible,
    isSubmitEnabled,
    user?.emailId,
    user?.yearOfBirth,
    user?.innerToken,
    token,
    profilePictureContactInternalId,
    profilePictureToken
  ]);

  const formatSubmissionData = (
    values,
    {
      baseLanguage,
      enrolledCourses,
      countries
    },
    matchedEnrolleeInfo,
    userInfo
  ) => {
    const {
      lastNames,
      names,
      sex,
      countryOfResidence,
      countryOfBirth,
      languageLevelAbbreviation, // eslint-disable-line no-unused-vars
      countryDivisionOfResidence,
      countryDivisionOfBirth,
      termsAndConditionsVersion
    } = values;

    const matchedInfo = matchedEnrolleeInfo || {};

    const birthCountryName = countries
      ?.find((country) => country.CountryId === countryOfBirth)
      ?.CountryName || null;

    const residencyCountryName = countries
      ?.find((country) => country.CountryId === countryOfResidence)
      ?.CountryName || null;

    let enrolleeDob;
    const submittedYear = userInfo?.yearOfBirth || null;
    const matchedYearOfBirth = matchedInfo?.dateOfBirth
      ? new Date(matchedInfo.dateOfBirth).getUTCFullYear()
      : null;
    if (submittedYear === matchedYearOfBirth) {
      enrolleeDob = matchedInfo?.dateOfBirth;
    }

    const selectedCourseCodeIds = (enrolledCourses || []).map((course) => course?.CourseCodeId);

    const selectedCourseObjects = enrolledCourses || [];

    const distinctLanguageTargets = new Set(
      selectedCourseObjects
        ?.map((course) => course?.TargetLanguageId)
        .filter(Boolean)
    );

    const languageProficiencies = [
      {
        languageId: baseLanguage?.localeCode || "na",
        languageLevelAbbreviation: "na"
      },
      ...Array.from(distinctLanguageTargets).map((languageId) => {
        const formKey =
          distinctLanguageTargets.size === 1
            ? "languageLevelAbbreviation"
            : `languageLevelAbbreviation_${languageId}`;

        return {
          languageId,
          languageLevelAbbreviation: values[formKey] || "ba"
        };
      })
    ];

    const formattedData = {
      contactExternalId: userInfo?.contactId ?? matchedInfo?.contactExternalId ?? null,
      emailAddress: userInfo?.emailId ?? (matchedInfo?.email || null),
      lastNames: lastNames ?? (matchedInfo?.lastNames || null),
      names: names ?? (matchedInfo?.names || null),
      sex: sex ?? (matchedInfo?.sex || null),
      dateOfBirth: enrolleeDob || null,
      countryOfResidence: residencyCountryName ?? (matchedInfo.countryOfResidencyName || null),
      countryDivisionOfResidence: countryDivisionOfResidence ?? (matchedInfo.countryDivisionIdResidency || null),
      countryOfBirth: birthCountryName ?? (matchedInfo.countryOfBirthName || null),
      countryDivisionOfBirth: countryDivisionOfBirth ?? (matchedInfo.countryDivisionIdBirth || null),
      termsVersion: termsAndConditionsVersion || "2.1",
      coursesCodeIds: selectedCourseCodeIds.map((id) => ({
        courseCodeId: id
      })),
      languageProficiencies: languageProficiencies
    };

    const recordsToSubmit = formattedData ? [formattedData] : [];
    console.log("recordsToSubmit", recordsToSubmit);
    return recordsToSubmit;
  };

  const onFormSubmit = async (values) => {
    try {
      await form.validateFields();
      const enrolledCourses = selectedCoursesToEnroll?.length > 0
        ? availableCourses?.filter((course) => selectedCoursesToEnroll?.includes(course?.CourseCodeId))
        : availableCourses;

      const formattedDatatoSubmit = formatSubmissionData(
        values,
        {
          baseLanguage,
          enrolledCourses,
          countries
        },
        returningEnrolleeCountryDivisionInfo,
        user
      );

      const filesMap = {};
      const profilePicList = values?.[PROFILE_PICTURE_FIELD_NAME];
      if (Array.isArray(profilePicList) && profilePicList[0]?.originFileObj) {
        filesMap[PROFILE_PICTURE_FIELD_NAME] = [profilePicList[0].originFileObj];
      }

      setSubmittingLoading(true);
      if (!executeRecaptcha) {
        console.warn("reCAPTCHA not ready");
        setSubmittingLoading(false);
        alert("reCAPTCHA not ready. Please try again.");
        return;
      }
      const recaptchaToken = await executeRecaptcha("enrollment_submit");
      if (!recaptchaToken) {
        setSubmittingLoading(false);
        alert("Could not verify reCAPTCHA. Please try again.");
        return;
      }
      setPendingSubmission({
        records: formattedDatatoSubmit,
        filesMap,
        recaptchaToken
      });
      console.log("formattedDatatoSubmit", formattedDatatoSubmit);
    } catch (error) {
      console.log("Form invalid", error);
      alert("Form is invalid. Please check the fields.");
    }
  };

  const resetQuickEnrollmentInputValues = async () => {
    form?.resetFields();
    setConfirmVisible(false);
    setGeographyInfoVisible(false);
    setSelectedCountryOfResidence(null);
    setSelectedBirthCountry(null);
    setDivisions([]);
    setBirthDivisions([]);
    setSubmitEnabled(false);
    setLoading(false);
    setReturningEnrolleeCountryDivisionInfo(null);
    setEnrolleeResidencyDivision("");
    setEnrolleeBirthDivision("");
    onResetSubmittingEnrollee(undefined);
    setSubmittingLoading(false);
    setPendingSubmission(null);
    onSelectingEnrollmentCourses([]);
  };

  const handleGoBackSelection = () => {
    onSelectingEnrollmentCourses([]);
  };

  const getLanguageName = (id) => {
    const map = {
      en: "English",
      es: "EspaÃ±ol",
      pt: "PortuguÃªs"
    };
    return map[id] || id;
  };

  const quickEnrollmentStyle = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "20px"
  };

  const coursesToDisplay =
    availableCourses?.length === 1
      ? availableCourses
      : availableCourses?.filter((course) =>
          selectedCoursesToEnroll?.includes(course.CourseCodeId)
        );

  console.log("coursesToDisplay", coursesToDisplay, availableCourses, selectedCoursesToEnroll);
  const titleOfEnrollment = setLocale(locale, "enrollment.quickEnrollment");
  const converUrl = "https://images.unsplash.com/photo-1655800466797-8ab2598b4274?q=80&w=1690&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const enrollmentVersion = "v3.0";

  if (user?.emailId && !user?.yearOfBirth) {
    return (
      <div id="unathenticated-landing-page-margin">
        <EmailYearSearchForm />
      </div>
    );
  }

  return (
    <div className="container customerName">
      {isEnrollmentModalVisible && (
        <EnrollmentModal
          closeEnrollmentModal={handleCloseModal}
          visibleModal={isEnrollmentModalVisible}
          courses={coursesToDisplay}
        />
      )}

      <Form
        form={form}
        onFinish={onFormSubmit}
        layout="vertical"
      >
        <Row gutter={24}>
          <Col lg={24}>
            <Card style={quickEnrollmentStyle} loading={submittingLoading} variant="outlined"
              cover={(
                <img
                  alt={titleOfEnrollment}
                  src={converUrl}
                  style={{ height: 100, objectFit: "cover" }}
                />
              )}
            >
              <h1 style={{ marginBottom: "10px", textAlign: "left" }}>
                {titleOfEnrollment} - {user?.communicationName} - ({enrollmentVersion})
              </h1>
            </Card>

            {coursesToDisplay?.length > 1 ? (
              <Card
                style={quickEnrollmentStyle}
                variant="outlined"
                title={setLocale(locale, "enrollment.courseDetails")}
                loading={submittingLoading}
              >
                <h2>
                  {setLocale(locale, "enrollment.numOfCoursesEnrolled")}{" "}
                  {coursesToDisplay?.length}
                </h2>

                <Tabs tabPlacement="top" type="line"
                  items={coursesToDisplay?.map((course, index) => ({
                    key: course?.CourseCodeId || index,
                    label: course?.CourseDetails?.course || `Course ${index + 1}`,
                    children: (
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} lg={12}>
                          <img
                            src={
                              course?.CourseDetails?.imageUrl ||
                              process.env.PUBLIC_URL + "/img/avatars/tempProfile.jpg"
                            }
                            alt={`${course?.CourseDetails?.course} profile`}
                            style={{
                              width: 200,
                              height: 200,
                              borderRadius: "5%",
                              marginBottom: "10px"
                            }}
                          />
                        </Col>
                        <Col xs={24} sm={24} lg={12}>
                          <CourseDetails course={course} />
                        </Col>
                      </Row>
                    )
                  }))}
                />

                {selectedCoursesToEnroll?.length > 0 && (
                  <Button
                    type="dashed"
                    block
                    onClick={handleGoBackSelection}
                    disabled={selectedCoursesToEnroll?.length === 0}
                    style={{ marginTop: 16 }}
                  >
                    {setLocale(locale, "enrollment.form.goBackToCourseSelection")}
                  </Button>
                )}
              </Card>
            ) : (
              coursesToDisplay?.map((course, index) => (
                <Card
                  key={course.id || index}
                  style={quickEnrollmentStyle}
                  variant="outlined"
                  title={setLocale(locale, "enrollment.courseDetails")}
                  loading={submittingLoading}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} lg={12}>
                      <img
                        src={
                          course?.CourseDetails?.imageUrl ||
                          process.env.PUBLIC_URL + "/img/avatars/tempProfile.jpg"
                        }
                        alt={`${course?.CourseDetails?.course} profile`}
                        style={{
                          width: 200,
                          height: 200,
                          borderRadius: "5%",
                          marginBottom: "10px"
                        }}
                      />
                    </Col>
                    <Col xs={24} sm={24} lg={12}>
                      <CourseDetails course={course} />
                    </Col>
                  </Row>

                  {selectedCoursesToEnroll?.length > 0 && (
                    <Button
                      type="dashed"
                      block
                      onClick={handleGoBackSelection}
                      disabled={selectedCoursesToEnroll?.length === 0}
                      style={{ marginTop: 16 }}
                    >
                      {setLocale(locale, "enrollment.form.goBackToCourseSelection")}
                    </Button>
                  )}
                </Card>
              ))
            )}

            {user?.contactId && returningEnrolleeCountryDivisionInfo?.personalCommunicationName && (
              <>
                {isGeographyInfoVisible && (
                  <Card style={quickEnrollmentStyle} title={setLocale(locale, "enrollment.form.confirmProfileGeography")} loading={submittingLoading} variant="outlined">
                    <Form.Item
                      name="countryOfResidence"
                      label={setLocale(locale, "enrollment.form.countryOfResidency")}
                      rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfResidence") }]}
                      initialValue={returningEnrolleeCountryDivisionInfo?.countryOfResidencyId ?? undefined}
                    >
                      <Select
                        showSearch={{ optionFilterProp: "searchText", filterOption }}
                        placeholder={intl.formatMessage({ id: "enrollment.form.selectCountryOfResidence" })}
                        onChange={(value) => {
                          setSelectedCountryOfResidence(value);
                          setDivisions([]);
                          form.setFieldsValue({ countryDivisionOfResidence: null });
                        }}
                        options={countryOptions}
                      />
                    </Form.Item>

                    {selectedCountryOfResidence && residencyDivisions?.length > 0 && (
                      <Form.Item
                        name="countryDivisionOfResidence"
                        label={setLocale(locale, "enrollment.form.stateOrRegion")}
                        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegion") }]}
                        initialValue={returningEnrolleeCountryDivisionInfo?.countryDivisionIdResidency ?? undefined}
                      >
                        <Select
                          showSearch={{ optionFilterProp: "searchText", filterOption }}
                          placeholder={intl.formatMessage({ id: "enrollment.form.selectStateOrRegion" })}
                          onChange={(value) => {
                            setEnrolleeResidencyDivision(value);
                          }}
                          options={residencyDivisionOptions}
                        />
                      </Form.Item>
                    )}

                    {(
                      !returningEnrolleeCountryDivisionInfo?.countryOfBirthId ||
                      !returningEnrolleeCountryDivisionInfo?.countryDivisionIdBirth
                    ) && (
                      <>
                        <Form.Item
                          name="countryOfBirth"
                          label={setLocale(locale, "enrollment.form.countryOfNationalityOfBirth")}
                          rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfBirth") }]}
                          initialValue={returningEnrolleeCountryDivisionInfo?.countryOfBirthId ?? undefined}
                        >
                          <Select
                            showSearch={{ optionFilterProp: "searchText", filterOption }}
                            placeholder={intl.formatMessage({ id: "enrollment.form.selectCountryOfBirth" })}
                            onChange={(value) => {
                              setSelectedBirthCountry(value);
                              setBirthDivisions([]);
                              form.setFieldsValue({ countryDivisionOfBirth: null });
                            }}
                            options={countryOptions}
                          />
                        </Form.Item>

                        {selectedBirthCountry && birthDivisions?.length > 0 && (
                          <Form.Item
                            name="countryDivisionOfBirth"
                            label={setLocale(locale, "enrollment.form.stateOrRegionOfBirth")}
                            rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegionOfBirth") }]}
                            initialValue={returningEnrolleeCountryDivisionInfo?.countryDivisionIdBirth ?? undefined}
                          >
                            <Select
                              showSearch={{ optionFilterProp: "searchText", filterOption }}
                              placeholder={intl.formatMessage({ id: "enrollment.form.selectStateOrRegionOfBirth" })}
                              onChange={(value) => {
                                setEnrolleeBirthDivision(value);
                              }}
                              options={birthDivisionOptions}
                            />
                          </Form.Item>
                        )}
                      </>
                    )}
                  </Card>
                )}
              </>
            )}

            {(() => {
              const distinctTargetLanguages = Array.from(
                new Set(
                  (selectedCoursesToEnroll?.length > 0
                    ? availableCourses.filter((course) =>
                        selectedCoursesToEnroll?.includes(course.CourseCodeId)
                      )
                    : availableCourses)?.map((course) => course?.TargetLanguageId).filter(Boolean)
                )
              );

              if (!hasAuthenticatedEnrollmentProfile || !isGeographyInfoVisible) {
                return null;
              }

              return (
                <>
                  {distinctTargetLanguages?.map((langId) => (
                    <Card
                      key={langId}
                      style={quickEnrollmentStyle}
                      title={
                        distinctTargetLanguages?.length > 1
                          ? <p>{setLocale(locale, "enrollment.form.languageLevelForCourseIn")} {getLanguageName(langId)}?</p>
                          : setLocale(locale, "enrollment.form.languageLevelForCourse")
                      }
                      loading={submittingLoading}
                      variant="outlined"
                    >
                      <Form.Item
                        name={
                          distinctTargetLanguages?.length === 1
                            ? "languageLevelAbbreviation"
                            : `languageLevelAbbreviation_${langId}`
                        }
                        rules={[
                          {
                            required: true,
                            message: setLocaleString(locale, "enrollment.form.selectLanguageLevelForCourse")
                          }
                        ]}
                      >
                        <Radio.Group>
                          <Space direction="vertical">
                            {selfLanguageLevel?.map((level) => (
                              <Radio key={level?.LevelAbbreviation} value={level?.LevelAbbreviation}>
                                {setLocale(locale, level.LocalizationKey)}
                              </Radio>
                            ))}
                          </Space>
                        </Radio.Group>
                      </Form.Item>
                    </Card>
                  ))}
                </>
              );
            })()}

            {isGeographyInfoVisible && isSubmitEnabled && (
              <EnrollmentProfilePictureField
                isEnabled={!!user?.emailId}
                emailId={user?.emailId}
                dobOrYob={user?.yearOfBirth}
                contactInternalId={profilePictureContactInternalId}
                token={profilePictureToken}
                enrollmentStyle={quickEnrollmentStyle}
                submittingLoading={submittingLoading}
              />
            )}

            <Card style={quickEnrollmentStyle} loading={submittingLoading} variant="outlined">
              <p>
                {setLocale(locale, "enrollment.form.byProceedingTermsAndConditions")} - {termsVersionLabel} -
                <TermsModal />{" "}
                - {setLocale(locale, "enrollment.form.ofUseAndPrivacyPolicy")}
              </p>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={!isSubmitEnabled}
              >
                {setLocale(locale, "enrollment.form.submit")}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onRenderingCourseRegistration,
    onSearchingForAlreadyEnrolledContact,
    onRequestingGeographicalDivision,
    onSubmittingAuthenticatedEnrollee,
    onResetSubmittingEnrollee,
    onSelectingEnrollmentCourses
  }, dispatch);
}

const mapStateToProps = ({ lrn, grant, auth }) => {
  const { availableCourses, selfLanguageLevel, countries, baseLanguage, wasSubmittingEnrolleeSucessful, selectedCoursesToEnroll } = lrn;
  const { user } = grant;
  const { token } = auth;
  return { availableCourses, selfLanguageLevel, countries, baseLanguage, wasSubmittingEnrolleeSucessful, user, token, selectedCoursesToEnroll };
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticatedQuickEnrollment);
