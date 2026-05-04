import React, { useState, useEffect, useMemo } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Tabs, Input, Select, message } from 'antd';
import { useIntl } from 'react-intl';
import IntlMessage from 'components/util-components/IntlMessage';
import { faPieChart, faMapPin, faPersonHiking, faListCheck, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { SearchOutlined } from '@ant-design/icons';
import IconAdapter from "components/util-components/IconAdapter";
import {
  onLoadingFacilitadorDashboardContents,
  onSubmittingAdminEnrolleeProgress,
  onLoadingFacilitadorDrillDownDemographics,
  onHydratingAnalyticsAvatars,
  onLoadingFacilitadorOverviewCardOrder,
  onSavingFacilitadorOverviewCardOrder
} from "redux/actions/Analytics";
import CounterDisplay from 'components/layout-components/CounterDisplay';
import DoubleCounterDisplayV2 from 'components/layout-components/DoubleCounterDisplayV2';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import PieGraph from 'components/layout-components/Graphs/PieGraph';
import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
import TimelineTrendGraph from 'components/layout-components/Graphs/TimelineTrendGraph';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import ProgressDashboardByEmailV4 from 'components/layout-components/ProgressDashboardByEmailV4';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import DraggableDashboardGrid from 'components/shared-components/DraggableDashboardGrid';
import Flag from 'react-world-flags';

const normalizeContactInternalId = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const hasAvatarResolution = (avatarUrlMap = {}, contactInternalId) => (
  Object.prototype.hasOwnProperty.call(avatarUrlMap || {}, normalizeContactInternalId(contactInternalId))
);

const tableModelHasMissingAvatarResolutions = (tableModel, avatarUrlMap = {}) => (
  (tableModel?.tableData || []).some(row => (
    row?.contactInternalId && !hasAvatarResolution(avatarUrlMap, row.contactInternalId)
  ))
);

const coverUrl = 'https://images.unsplash.com/photo-1561089489-f13d5e730d72?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const defaultOverviewCardOrder = [
  'enrolledVsProgressing',
  'genderPercentages',
  'averageAge',
  'languageProficiency',
  'enrolleeType'
];

const FacilitatorsLandingDashboard = (props) => {
  const {
    courseCodeId,
    showMyProgressTab,
    ebookUrl,
    onLoadingFacilitadorDashboardContents,
    onSubmittingAdminEnrolleeProgress,
    onLoadingFacilitadorDrillDownDemographics,
    overviewDashboardData,
    overviewProgressDashboardData,
    demographicDashboardData,
    progressDemographicDashboardData,
    drillDownMapJson,
    drillDownDemographicData,
    facilitadorEnrolleeData,
    selectedCourseCodeId,
    user,
    onHydratingAnalyticsAvatars,
    avatarUrlMap,
    facilitadorOverviewCardOrder,
    onLoadingFacilitadorOverviewCardOrder,
    onSavingFacilitadorOverviewCardOrder
  } = props;

  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const [activeTabKey, setActiveTabKey] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDemoCountry, setSelectedDemoCountry] = useState(null);
  const [localOverviewCardOrder, setLocalOverviewCardOrder] = useState(defaultOverviewCardOrder);

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

  useEffect(() => {
    setLocalOverviewCardOrder(defaultOverviewCardOrder);

    if (!courseCodeId || !user?.emailId) {
      return;
    }

    onLoadingFacilitadorOverviewCardOrder(
      user.emailId,
      courseCodeId,
      defaultOverviewCardOrder
    )?.catch((error) => console.error("Error loading facilitador overview card order:", error));
  }, [courseCodeId, user?.emailId, onLoadingFacilitadorOverviewCardOrder]);

  useEffect(() => {
    if (facilitadorOverviewCardOrder?.length) {
      setLocalOverviewCardOrder(facilitadorOverviewCardOrder);
    }
  }, [facilitadorOverviewCardOrder]);

  // Sync combined table when data changes
  useEffect(() => {    
    if (facilitadorEnrolleeData?.tableData) {
      setFilteredData(facilitadorEnrolleeData.tableData);
    }
  }, [facilitadorEnrolleeData]);

  useEffect(() => {
    if (
      activeTabKey !== 'enrollees' ||
      !user?.emailId ||
      !tableModelHasMissingAvatarResolutions(facilitadorEnrolleeData, avatarUrlMap)
    ) {
      return;
    }

    onHydratingAnalyticsAvatars(user.emailId, avatarUrlMap, {
      facilitadorEnrolleeData
    });
  }, [activeTabKey, facilitadorEnrolleeData, user?.emailId, avatarUrlMap, onHydratingAnalyticsAvatars]);

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

  // Handle drill-down country selection — dispatches Redux action
  const handleDemoCountryChange = (countryId) => {
    setSelectedDemoCountry(countryId);
    if (!countryId) {
      onLoadingFacilitadorDrillDownDemographics(null, null, null);
      return;
    }
    onLoadingFacilitadorDrillDownDemographics(courseCodeId, countryId, user?.emailId);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchValue(value);
    if (facilitadorEnrolleeData?.tableData) {
      const filtered = facilitadorEnrolleeData.tableData.filter((item) =>
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

  const handleOverviewCardOrderChange = (nextCardOrder) => {
    setLocalOverviewCardOrder(nextCardOrder);

    onSavingFacilitadorOverviewCardOrder(
      user?.emailId,
      courseCodeId,
      nextCardOrder,
      defaultOverviewCardOrder
    )?.catch((error) => console.error("Error saving facilitador overview card order:", error));
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
    const generalData = overviewDashboardData;
    const progressData = overviewProgressDashboardData;
    const overviewCards = [
      {
        key: 'enrolledVsProgressing',
        content: (
          <DoubleCounterDisplayV2
            localizedTitle={"facilitador.dashboard.enrolledVsProgressing"}
            firstCount={generalData?.totalEnrollees}
            secondCount={progressData?.totalEnrollees}
            firstLabelKey={"facilitador.dashboard.totalEnrolled"}
            secondLabelKey={"facilitador.dashboard.totalWithProgress"}
          />
        )
      },
      {
        key: 'genderPercentages',
        content: (
          <PieGraph localizedTitle={"admin.dashboard.insights.overview.genderPercentages"} graphData={generalData?.genderPercentages} passedValue={"percentage"} passedType={"sex"} />
        )
      },
      {
        key: 'averageAge',
        content: (
          <CounterDisplay localizedTitle={"admin.dashboard.insights.overview.averageAge"} count={generalData?.averageGeneralAge} />
        )
      },
      {
        key: 'languageProficiency',
        content: (
          <ColumnBar localizedTitle={"admin.dashboard.insights.overview.languageProficiency"} graphData={generalData?.enrolleeProficiencyGroups} passedValue={"count"} passedType={"type"} symbol={""} />
        )
      },
      {
        key: 'enrolleeType',
        content: (
          <BarGraph localizedTitle={"admin.dashboard.insights.overview.enrolleeType"} graphData={generalData?.enrolleeTypes} passedValue={"percentage"} passedType={"type"} symbol={"%"} />
        )
      }
    ];
    return (
      <DraggableDashboardGrid
        cards={overviewCards}
        cardOrder={localOverviewCardOrder}
        onCardOrderChange={handleOverviewCardOrderChange}
        gutter={[16, 16]}
        colProps={{ xs: 24, sm: 24, md: 24, lg: 8 }}
      />
    );
  };

  // ─── Tab 2: Enrollee List (combined table) ──────────────
  const renderEnrolleeList = () => {
    const progressExpandableWithDelegate =
      facilitadorEnrolleeData?.expandable
        ? {
            ...facilitadorEnrolleeData.expandable,
            expandedRowRender: (record) =>
              facilitadorEnrolleeData.expandable.expandedRowRender(
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
              tableColumns={facilitadorEnrolleeData?.columns}
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
    const mapSource = isDrillDown ? drillDownMapJson : demographicDashboardData?.mapJson;
    const mapType = isDrillDown ? selectedDemoCountry : (demographicDashboardData?.mapType || 'world');
    const regionData = isDrillDown ? drillDownDemographicData : mergedDemographicData;

    return (
      <Row gutter={16}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <h3>{setLocale(locale, 'facilitador.dashboard.progressByRegion')}</h3>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>
            {setLocale(locale, 'facilitador.dashboard.dropdownHint')}
          </p>
          <Select
            allowClear
            placeholder={t('facilitador.dashboard.selectCountry')}
            value={selectedDemoCountry}
            onChange={handleDemoCountryChange}
            style={{ width: 300, marginBottom: 8 }}
            options={[{ value: null, label: t('facilitador.dashboard.allCountries') }, ...progressCountryOptions]}
          />
          <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#B0BEC5', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />
            {setLocale(locale, 'facilitador.dashboard.legendNoProgress')}
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'linear-gradient(135deg, #3e82f7, #04d182, #ffc542, #ff6b72, #a461d8)', borderRadius: 2, marginLeft: 16, marginRight: 6, verticalAlign: 'middle' }} />
            {setLocale(locale, 'facilitador.dashboard.legendWithProgress')}
          </p>
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
    {
      key: 'trends',
      label: (
        <span>
          <IconAdapter icon={faChartLine} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, 'facilitador.dashboard.trends')}
        </span>
      ),
        children: <TimelineTrendGraph localizedTitle="facilitador.dashboard.trends.progressOverTime" dates={facilitadorEnrolleeData?.progressDates} lineColor="#e35aff" enableGradientArea />
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
    }] : []),
    // eBook tab (always last if ebookUrl is present)
    ...(ebookUrl ? [{
      key: 'ebook',
      label: (
        <span>
          <IconAdapter icon={faBook} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, 'facilitador.dashboard.ebookTab')}
        </span>
      ),
      children: (<div id="unathenticated-landing-page-margin"><InternalIFrame iFrameUrl={ebookUrl} className={"none"} /></div>)
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
    onSubmittingAdminEnrolleeProgress,
    onLoadingFacilitadorDrillDownDemographics,
    onHydratingAnalyticsAvatars,
    onLoadingFacilitadorOverviewCardOrder,
    onSavingFacilitadorOverviewCardOrder
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
    drillDownMapJson,
    drillDownDemographicData,
    enrolleDashboardData,
    facilitadorEnrolleeData,
    avatarUrlMap,
    facilitadorOverviewCardOrder
  } = analytics;
  return {
    selectedCourseCodeId,
    overviewDashboardData,
    overviewProgressDashboardData,
    demographicDashboardData,
    progressDemographicDashboardData,
    drillDownMapJson,
    drillDownDemographicData,
    enrolleDashboardData,
    facilitadorEnrolleeData,
    avatarUrlMap,
    facilitadorOverviewCardOrder,
    user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FacilitatorsLandingDashboard);
