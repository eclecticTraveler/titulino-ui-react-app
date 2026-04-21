import React, { useState, useEffect, useMemo } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Tabs, Input, Select, message } from 'antd';
import { useIntl } from 'react-intl';
import IntlMessage from 'components/util-components/IntlMessage';
import { faPieChart, faMapPin, faPersonHiking, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { SearchOutlined } from '@ant-design/icons';
import IconAdapter from "components/util-components/IconAdapter";
import { onLoadingFacilitadorDashboardContents, onSubmittingAdminEnrolleeProgress } from "redux/actions/Analytics";
import CounterDisplay from 'components/layout-components/CounterDisplay';
import DoubleCounterDisplay from 'components/layout-components/DoubleCounterDisplay';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import ProgressDashboardByEmailV4 from 'components/layout-components/ProgressDashboardByEmailV4';
import GoogleService from 'services/GoogleService';
import Flag from 'react-world-flags';

const coverUrl = 'https://images.unsplash.com/photo-1561089489-f13d5e730d72?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const FacilitadorsLandingDashboard = (props) => {
  const {
    courseCodeId,
    showMyProgressTab,
    onLoadingFacilitadorDashboardContents,
    onSubmittingAdminEnrolleeProgress,
    overviewDashboardData,
    overviewProgressDashboardData,
    demographicDashboardData,
    progressDemographicDashboardData,
    enrolleesCourseProgressData,
    selectedCourseCodeId,
    user
  } = props;

  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const [activeTabKey, setActiveTabKey] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDemoCountry, setSelectedDemoCountry] = useState(null);
  const [drillMapJson, setDrillMapJson] = useState(null);
  const [drillDemographicData, setDrillDemographicData] = useState(null);

  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  // Load dashboard data on mount
  useEffect(() => {
    if (courseCodeId && user?.emailId) {
      setLoading(true);
      onLoadingFacilitadorDashboardContents(courseCodeId, user.emailId)
        ?.finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseCodeId, user?.emailId]);

  // Sync combined table when data changes
  useEffect(() => {
    if (enrolleesCourseProgressData?.tableData) {
      setFilteredData(enrolleesCourseProgressData.tableData);
    }
  }, [enrolleesCourseProgressData]);

  // Merged demographics: general in consistent color, progress in distinct colors
  const mergedDemographicData = useMemo(() => {
    const generalArr = demographicDashboardData?.transformedArrays?.transformedResidencyArray || [];
    const progressArr = progressDemographicDashboardData?.transformedArrays?.transformedResidencyArray || [];
    const progressCountryIds = new Set(progressArr.map(p => p.countryId));
    const noProgressColor = '#B0BEC5';

    return generalArr.map((entry) => {
      const hasProgress = progressCountryIds.has(entry.countryId);
      const progressEntry = progressArr.find(p => p.countryId === entry.countryId);
      return {
        ...entry,
        color: hasProgress ? (progressEntry?.color || entry.color) : noProgressColor
      };
    });
  }, [demographicDashboardData, progressDemographicDashboardData]);

  // Countries that have progress (for the drill-down dropdown)
  const progressCountryOptions = useMemo(() => {
    const progressArr = progressDemographicDashboardData?.transformedArrays?.transformedResidencyArray || [];
    return progressArr.map(p => ({ value: p.countryId, label: (<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Flag code={p.countryId} style={{ width: 20 }} />{p.name || p.countryId}</span>) }));
  }, [progressDemographicDashboardData]);

  // Handle drill-down country selection
  const handleDemoCountryChange = async (countryId) => {
    setSelectedDemoCountry(countryId);
    if (!countryId) {
      setDrillMapJson(null);
      setDrillDemographicData(null);
      return;
    }
    const mapJson = await GoogleService.getGeoMapResource(countryId, 'facilitadorDemoDrillDown');
    setDrillMapJson(mapJson);

    const progressArr = progressDemographicDashboardData?.transformedArrays?.transformedResidencyArray || [];
    const generalArr = demographicDashboardData?.transformedArrays?.transformedResidencyArray || [];
    const countryEntry = progressArr.find(p => p.countryId === countryId) || generalArr.find(g => g.countryId === countryId);
    setDrillDemographicData(countryEntry ? [countryEntry] : []);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchValue(value);
    if (enrolleesCourseProgressData?.tableData) {
      const filtered = enrolleesCourseProgressData.tableData.filter((item) =>
        Object.values(item).join(' ').toLowerCase().includes(value)
      );
      setFilteredData(filtered);
    }
  };

  const handleAdminProgressSubmit = async (formattedData) => {
    try {
      await onSubmittingAdminEnrolleeProgress(formattedData, selectedCourseCodeId, user?.emailId);
      message.success(t('admin.progressEditable.saveProgress'));
      if (courseCodeId && user?.emailId) {
        setLoading(true);
        onLoadingFacilitadorDashboardContents(courseCodeId, user.emailId)
          ?.finally(() => setLoading(false));
      }
    } catch (error) {
      console.error("Error submitting progress:", error);
      message.error("Error saving progress.");
    }
  };

  const handleEmailChange = (contactInternalId, email, progress) => {
    setFilteredData(prev => prev.map(row => {
      if (row.contactInternalId === contactInternalId) {
        return {
          ...row,
          selectedEmail: email,
          participationPercent: progress?.participationPercent ?? row.participationPercent,
          goldenPercent: progress?.goldenPercent ?? row.goldenPercent
        };
      }
      return row;
    }));
  };

  if (user?.emailId && !user?.yearOfBirth) {
    return (
      <div id="unathenticated-landing-page-margin">
        <EmailYearSearchForm />
      </div>
    );
  }

  // ─── Tab 1: General View ────────────────────────────────
  const renderOverview = () => {
    const data = overviewDashboardData;
    const progressData = overviewProgressDashboardData;
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={8}>
          <DoubleCounterDisplay
            localizedTitle={"facilitador.dashboard.enrolledVsProgressing"}
            firstCount={data?.totalEnrollees}
            secondCount={progressData?.totalEnrollees}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8}>
          <BarGraph localizedTitle={"admin.dashboard.insights.overview.totalMalesVsFemales"} graphData={data?.genderCount} passedValue={"count"} passedType={"sex"} />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8}>
          <CounterDisplay localizedTitle={"admin.dashboard.insights.overview.averageAge"} count={data?.averageGeneralAge} />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8}>
          <BarGraph localizedTitle={"admin.dashboard.insights.overview.agesGroups"} graphData={data?.agesPercentages} passedValue={"count"} passedType={"label"} />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8}>
          <BarGraph localizedTitle={"admin.dashboard.insights.overview.enrolleeType"} graphData={data?.enrolleeTypes} passedValue={"percentage"} passedType={"type"} symbol={"%"} />
        </Col>
      </Row>
    );
  };

  // ─── Tab 2: Enrollee List (combined table) ──────────────
  const renderEnrolleeList = () => {
    const progressExpandableWithDelegate =
      enrolleesCourseProgressData?.expandable
        ? {
            ...enrolleesCourseProgressData.expandable,
            expandedRowRender: (record) =>
              enrolleesCourseProgressData.expandable.expandedRowRender(
                record,
                handleAdminProgressSubmit,
                handleEmailChange
              )
          }
        : undefined;

    return (
      <Row gutter={16}>
        <Col span={24}>
          <Input
            placeholder={intl.formatMessage({ id: "admin.dashboard.insights.search.placeholder" })}
            value={searchValue}
            onChange={handleSearch}
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24}>
          {filteredData.length > 0 ? (
            <AbstractTable
              tableData={filteredData}
              tableColumns={enrolleesCourseProgressData?.columns}
              tableExpandables={progressExpandableWithDelegate}
              isAllowedToEditTableData={false}
              isToRenderActionButton={false}
            />
          ) : (
            <p>{setLocale(locale, "admin.dashboard.insights.progress.noMatchingRecords")}</p>
          )}
        </Col>
      </Row>
    );
  };

  // ─── Tab 3: Demographics ────────────────────────────────
  const renderDemographics = () => {
    const isDrillDown = !!selectedDemoCountry;
    const mapSource = isDrillDown ? drillMapJson : demographicDashboardData?.mapJson;
    const mapType = isDrillDown ? selectedDemoCountry : (demographicDashboardData?.mapType || 'world');
    const regionData = isDrillDown ? drillDemographicData : mergedDemographicData;

    return (
      <Row gutter={16}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <h3>{setLocale(locale, 'facilitador.dashboard.progressByRegion')}</h3>
          <Select
            allowClear
            placeholder={t('facilitador.dashboard.selectCountry')}
            value={selectedDemoCountry}
            onChange={handleDemoCountryChange}
            style={{ width: 300, marginBottom: 16 }}
            options={progressCountryOptions}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24}>
          {(regionData || mapSource) && (
            <EnrolleeByRegionWidget
              enrolleeRegionData={regionData}
              mapSource={mapSource}
              mapType={mapType}
            />
          )}
        </Col>
      </Row>
    );
  };

  // ─── Tab 4: My Progress (conditional) ───────────────────
  const renderMyProgress = () => <ProgressDashboardByEmailV4 />;

  // ─── Tabs Config ────────────────────────────────────────
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, 'facilitador.dashboard.overview')}
        </span>
      ),
      children: renderOverview()
    },
    {
      key: 'enrollees',
      label: (
        <span>
          <IconAdapter icon={faListCheck} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, 'facilitador.dashboard.enrollees')}
        </span>
      ),
      children: renderEnrolleeList()
    },
    {
      key: 'demographics',
      label: (
        <span>
          <IconAdapter icon={faMapPin} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, 'facilitador.dashboard.demographics')}
        </span>
      ),
      children: renderDemographics()
    },
    ...(showMyProgressTab ? [{
      key: 'myProgress',
      label: (
        <span>
          <IconAdapter icon={faPersonHiking} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, 'facilitador.dashboard.myProgress')}
        </span>
      ),
      children: renderMyProgress()
    }] : [])
  ];

  return (
    <div className="container customerName">
      <Card
        variant="outlined"
        cover={
          <img
            alt="facilitador"
            src={coverUrl}
            style={{ height: 100, objectFit: 'cover' }}
          />
        }
      >
        <h1 style={{ marginBottom: '10px', textAlign: 'left' }}>
          {setLocale(locale, 'facilitador.dashboard.title')}
        </h1>
      </Card>
      <Card loading={loading} variant="outlined">
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onLoadingFacilitadorDashboardContents,
    onSubmittingAdminEnrolleeProgress
  }, dispatch);
}

const mapStateToProps = ({ analytics, grant }) => {
  const { user } = grant;
  const {
    selectedCourseCodeId,
    overviewDashboardData,
    overviewProgressDashboardData,
    demographicDashboardData,
    progressDemographicDashboardData,
    enrolleDashboardData,
    enrolleesCourseProgressData
  } = analytics;
  return {
    selectedCourseCodeId,
    overviewDashboardData,
    overviewProgressDashboardData,
    demographicDashboardData,
    progressDemographicDashboardData,
    enrolleDashboardData,
    enrolleesCourseProgressData,
    user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FacilitadorsLandingDashboard);
