import React from 'react';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  InputNumber,
  Row,
  Select,
  Tooltip
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import IntlMessage from 'components/util-components/IntlMessage';

const renderFilterTooltip = (t, tooltipKey, child) => (
  <Tooltip title={t(tooltipKey)} placement="topLeft">
    <div>{child}</div>
  </Tooltip>
);

const renderLocationRow = ({
  t,
  labelKey,
  country,
  region,
  exclude,
  countryOptions,
  regionOptions,
  countryLoading,
  regionLoading,
  onCountryChange,
  onRegionChange,
  onExcludeChange
}) => (
  <Row gutter={[12, 8]} align="middle" style={{ marginBottom: 8 }}>
    <Col xs={24} md={3} lg={3}>
      <span style={{ fontWeight: 500, opacity: country ? 1 : 0.45 }}>{t(labelKey)}</span>
    </Col>
    <Col xs={24} md={6} lg={6}>
      <Select
        allowClear
        showSearch
        value={country}
        placeholder={t('admin.tools.messaging.countryPlaceholder')}
        options={countryOptions}
        optionFilterProp="searchText"
        onChange={value => onCountryChange(value || null)}
        loading={countryLoading}
        style={{ width: '100%' }}
      />
    </Col>
    <Col xs={24} md={6} lg={6}>
      <Select
        mode="multiple"
        allowClear
        showSearch
        disabled={!country}
        value={region || []}
        placeholder={t('admin.tools.messaging.regionPlaceholder')}
        options={regionOptions}
        optionFilterProp="searchText"
        onChange={values => onRegionChange(values?.length ? values : null)}
        loading={regionLoading}
        style={{ width: '100%' }}
      />
    </Col>
    <Col xs={24} md={4} lg={4}>
      <Select
        disabled={!country}
        value={exclude ? 'exclude' : 'include'}
        options={[
          { value: 'include', label: 'Include' },
          { value: 'exclude', label: 'Exclude' }
        ]}
        onChange={value => onExcludeChange(value === 'exclude')}
        style={{ width: '100%' }}
      />
    </Col>
  </Row>
);

// Shared, controlled contact-filter form used by both Access Management's
// Advanced Search and Messaging's Audience tab. Both bottom out in the same
// AdminToolsManager.getContactSegment/buildContactSegmentPayload shape; only
// the filter *form* is unified here — each caller keeps owning its own
// apply/reload data flow (Redux vs local state).
const ContactFilterPanel = ({
  filters,
  onFieldChange,
  onResidencyCountryChange,
  onBirthCountryChange,
  onExcludeCategoryChange,
  onApply,
  onReset,
  applyLoading = false,
  metadataLoading = false,
  residencyDivisionsLoading = false,
  birthDivisionsLoading = false,
  options = {},
  renderCourseTag,
  showSearch = true,
  showGenderAge = true,
  showDemographics = true,
  showCoursesAndSignals = true,
  showPaging = false
}) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);

  const {
    sex: sexOptions = [],
    residencyCountries = [],
    birthCountries = [],
    residencyRegions = [],
    birthRegions = [],
    languages = [],
    languageLevels = [],
    courses = [],
    communicationCategories = [],
    limits = [10, 20, 50, 100, 250]
  } = options;

  return (
    <div>
      {showSearch && (
        <Card
          size="small"
          title={<IntlMessage id="admin.tools.messaging.filterSection.search" />}
          style={{ marginBottom: 12 }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.search', (
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder={t('admin.tools.messaging.searchPlaceholder')}
                  value={filters.searchText}
                  onChange={event => onFieldChange('searchText', event.target.value)}
                />
              ))}
            </Col>
          </Row>
        </Card>
      )}

      {showGenderAge && (
        <Card
          size="small"
          title={<IntlMessage id="admin.tools.messaging.filterSection.searchAndPaging" />}
          style={{ marginBottom: 12 }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={8} lg={4}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.sex', (
                <Select
                  value={filters.sex}
                  options={sexOptions}
                  onChange={value => onFieldChange('sex', value)}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
            <Col xs={12} sm={8} lg={3}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.minAge', (
                <InputNumber
                  min={0}
                  max={120}
                  value={filters.minAge}
                  onChange={value => onFieldChange('minAge', value)}
                  placeholder={t('admin.tools.messaging.minAge')}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
            <Col xs={12} sm={8} lg={3}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.maxAge', (
                <InputNumber
                  min={0}
                  max={120}
                  value={filters.maxAge}
                  onChange={value => onFieldChange('maxAge', value)}
                  placeholder={t('admin.tools.messaging.maxAge')}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
            {showPaging && (
              <>
                <Col xs={12} sm={8} lg={4}>
                  <Select
                    value={filters.limit}
                    options={limits.map(value => ({ value, label: String(value) }))}
                    onChange={value => onFieldChange('limit', value)}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <InputNumber
                    min={0}
                    step={filters.limit}
                    value={filters.offset}
                    onChange={value => onFieldChange('offset', Number(value || 0))}
                    placeholder={t('admin.tools.messaging.offset')}
                    style={{ width: '100%' }}
                  />
                </Col>
              </>
            )}
          </Row>
        </Card>
      )}

      {showDemographics && (
        <Card
          size="small"
          title={<IntlMessage id="admin.tools.messaging.filterSection.demographics" />}
          style={{ marginBottom: 12 }}
        >
          {!filters.residencyCountry && !filters.birthCountry && (
            <Row style={{ marginBottom: 8 }}>
              <Col>
                <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>
                  {t('admin.tools.messaging.allLocations')}
                </span>
              </Col>
            </Row>
          )}

          {renderLocationRow({
            t,
            labelKey: 'admin.tools.messaging.option.residency',
            country: filters.residencyCountry,
            region: filters.residencyRegion,
            exclude: filters.residencyExclude,
            countryOptions: residencyCountries,
            regionOptions: residencyRegions,
            countryLoading: metadataLoading,
            regionLoading: residencyDivisionsLoading,
            onCountryChange: onResidencyCountryChange,
            onRegionChange: value => onFieldChange('residencyRegion', value),
            onExcludeChange: value => onFieldChange('residencyExclude', value)
          })}

          {renderLocationRow({
            t,
            labelKey: 'admin.tools.messaging.option.birth',
            country: filters.birthCountry,
            region: filters.birthRegion,
            exclude: filters.birthExclude,
            countryOptions: birthCountries,
            regionOptions: birthRegions,
            countryLoading: metadataLoading,
            regionLoading: birthDivisionsLoading,
            onCountryChange: onBirthCountryChange,
            onRegionChange: value => onFieldChange('birthRegion', value),
            onExcludeChange: value => onFieldChange('birthExclude', value)
          })}

          <Row gutter={[12, 8]}>
            <Col xs={24} md={3} lg={3} />
            <Col xs={24} md={6} lg={6}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.language', (
                <Select
                  allowClear
                  showSearch
                  value={filters.languageId}
                  placeholder={t('admin.tools.messaging.languagePlaceholder')}
                  options={[
                    { value: 'all', label: t('admin.tools.messaging.option.all') },
                    ...languages
                  ]}
                  optionFilterProp="searchText"
                  onChange={value => onFieldChange('languageId', value || 'all')}
                  loading={metadataLoading}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
            <Col xs={24} md={6} lg={6}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.languageLevel', (
                <Select
                  allowClear
                  showSearch
                  value={filters.languageLevel}
                  placeholder={t('admin.tools.messaging.languageLevelPlaceholder')}
                  options={[
                    { value: 'all', label: t('admin.tools.messaging.option.all') },
                    ...languageLevels
                  ]}
                  optionFilterProp="searchText"
                  onChange={value => onFieldChange('languageLevel', value || 'all')}
                  loading={metadataLoading}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
          </Row>
        </Card>
      )}

      {showCoursesAndSignals && (
        <Card
          size="small"
          title={<IntlMessage id="admin.tools.messaging.filterSection.coursesAndSignals" />}
          style={{ marginBottom: 12 }}
        >
          <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
            <Col xs={24} lg={10}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.includeCourses', (
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  value={filters.courseCodeIds}
                  placeholder={t('admin.tools.messaging.includeCoursesPlaceholder')}
                  options={courses}
                  optionFilterProp="searchText"
                  onChange={value => onFieldChange('courseCodeIds', value || [])}
                  loading={metadataLoading}
                  maxTagCount={3}
                  tagRender={renderCourseTag}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
            <Col xs={24} lg={10}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.excludeCourses', (
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  value={filters.excludeCourseCodeIds}
                  placeholder={t('admin.tools.messaging.excludeCoursesPlaceholder')}
                  options={courses}
                  optionFilterProp="searchText"
                  onChange={value => onFieldChange('excludeCourseCodeIds', value || [])}
                  loading={metadataLoading}
                  maxTagCount={3}
                  tagRender={renderCourseTag}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
            <Col xs={24} lg={4} style={{ display: 'flex', alignItems: 'center' }}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.matchAllCourses', (
                <Checkbox
                  checked={filters.matchAllCourses}
                  onChange={event => onFieldChange('matchAllCourses', event.target.checked)}
                >
                  <IntlMessage id="admin.tools.messaging.matchAllCourses" />
                </Checkbox>
              ))}
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '4px 0 10px', fontSize: 12, color: '#8c8c8c' }}>
            {t('admin.tools.messaging.filterSection.engagementSignals')}
          </Divider>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={6}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.progress', (
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 3 }}>{t('admin.tools.messaging.signal.progress')}</div>
                  <Select
                    value={filters.hasProgress}
                    options={[
                      { value: 'all', label: t('admin.tools.messaging.option.any') },
                      { value: 'with', label: t('admin.tools.messaging.option.withProgress') },
                      { value: 'without', label: t('admin.tools.messaging.option.withoutProgress') }
                    ]}
                    onChange={value => onFieldChange('hasProgress', value)}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </Col>
            <Col xs={24} md={6}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.certifications', (
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 3 }}>{t('admin.tools.messaging.signal.certifications')}</div>
                  <Select
                    value={filters.hasCertifications}
                    options={[
                      { value: 'all', label: t('admin.tools.messaging.option.any') },
                      { value: 'with', label: t('admin.tools.messaging.option.withCertification') },
                      { value: 'without', label: t('admin.tools.messaging.option.withoutCertification') }
                    ]}
                    onChange={value => onFieldChange('hasCertifications', value)}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </Col>
            <Col xs={24} md={6}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.purchases', (
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 3 }}>{t('admin.tools.messaging.signal.purchases')}</div>
                  <Select
                    value={filters.hasPurchases}
                    options={[
                      { value: 'all', label: t('admin.tools.messaging.option.any') },
                      { value: 'with', label: t('admin.tools.messaging.option.withAccess') },
                      { value: 'without', label: t('admin.tools.messaging.option.withoutAccess') }
                    ]}
                    onChange={value => onFieldChange('hasPurchases', value)}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </Col>
            <Col xs={12} md={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={applyLoading}
                onClick={onApply}
                block
                style={{ marginTop: 20 }}
              >
                <IntlMessage id="admin.tools.messaging.applyFilters" />
              </Button>
            </Col>
            <Col xs={12} md={3}>
              <Button
                icon={<ReloadOutlined />}
                onClick={onReset}
                block
                style={{ marginTop: 20 }}
              >
                <IntlMessage id="admin.tools.messaging.clearFilters" />
              </Button>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '4px 0 10px', fontSize: 12, color: '#8c8c8c' }}>
            {t('admin.tools.messaging.filterSection.deduplication')}
          </Divider>
          <Row gutter={[12, 12]} style={{ marginBottom: 4 }}>
            <Col xs={24} md={8}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.excludeCategory', (
                <Select
                  value={filters.excludeCategoryId ?? undefined}
                  placeholder={t('admin.tools.messaging.excludeCategoryPlaceholder')}
                  options={communicationCategories}
                  onChange={onExcludeCategoryChange}
                  style={{ width: '100%' }}
                  allowClear
                />
              ))}
            </Col>
            <Col xs={24} md={8}>
              {renderFilterTooltip(t, 'admin.tools.messaging.tooltip.excludeCourseCodeId', (
                <Select
                  allowClear
                  showSearch
                  disabled={!filters.excludeCategoryId}
                  value={filters.excludeCourseCodeId || undefined}
                  placeholder={
                    filters.excludeCategoryId
                      ? t('admin.tools.messaging.excludeCourseCodeIdPlaceholder')
                      : t('admin.tools.messaging.excludeCourseCodeIdDisabledPlaceholder')
                  }
                  options={courses}
                  optionFilterProp="searchText"
                  onChange={value => onFieldChange('excludeCourseCodeId', value || '')}
                  loading={metadataLoading}
                  style={{ width: '100%' }}
                />
              ))}
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col xs={24} md={16}>
              <div style={{ fontSize: 11, color: '#8c8c8c', paddingLeft: 2 }}>
                {t('admin.tools.messaging.deduplication.hint')}
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default ContactFilterPanel;
