import React from 'react';
import { Badge, Card, Button, Space, Typography } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, EnvironmentOutlined, SoundOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { AUTH_PREFIX_PATH } from 'configs/AppConfig';
import Flag from 'react-world-flags';
import langData from 'assets/data/language.data.json';

const { Text } = Typography;

const langById = new Map(langData.map(l => [l.langId, l]));
const langByName = new Map(langData.map(l => [l.langName.toLowerCase(), l]));

const CourseStatusTile = ({ course, isEnrolled, enrollPath }) => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  const details = course?.CourseDetails || {};
  const courseName = details.course;
  const coursePath = details.coursePath;
  const whatsAppLink = details.whatsAppLink;
  const imageUrl = details.imageUrl;
  const gatheringDay = details.gatheringDay;
  const gatheringTime = details.gatheringTime;
  const location = details.location;
  const targetAudienceNativeLanguage = details.targetAudienceNativeLanguage;

  const nativeLangEntry = langById.get(course?.NativeLanguageId);
  const targetLangEntry = langById.get(course?.TargetLanguageId);
  const audienceLangEntry = targetAudienceNativeLanguage
    ? langByName.get(targetAudienceNativeLanguage.toLowerCase())
    : null;

  const resolvedEnrollPath = enrollPath || `${AUTH_PREFIX_PATH}/enroll`;

  const ribbonText = isEnrolled
    ? formatMessage({ id: 'landing.ribbon.enrolled' })
    : formatMessage({ id: 'landing.ribbon.open' });

  const ribbonColor = isEnrolled ? '#e79547' : '#52c41a';

  const speakerLangEntry = audienceLangEntry || targetLangEntry;

  return (
    <Badge.Ribbon text={ribbonText} color={ribbonColor}>
      <Card
        style={{ height: '100%' }}
        cover={
          imageUrl ? (
            <img
              alt={courseName}
              src={imageUrl}
              style={{ height: 140, objectFit: 'cover' }}
            />
          ) : null
        }
      >
        <Card.Meta title={courseName} />

        <div style={{ marginTop: 10, marginBottom: 12 }}>
          {(speakerLangEntry || nativeLangEntry) && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {speakerLangEntry && (
                <>
                  <SoundOutlined style={{ fontSize: 12, color: '#72849a' }} />
                  <Flag code={speakerLangEntry.icon} title={speakerLangEntry.langName} style={{ width: 20, verticalAlign: 'middle' }} />
                </>
              )}
              {nativeLangEntry && (
                <>
                  <BookOutlined style={{ fontSize: 12, color: '#72849a' }} />
                  <Flag code={nativeLangEntry.icon} title={nativeLangEntry.langName} style={{ width: 20, verticalAlign: 'middle' }} />
                </>
              )}
            </div>
          )}

          {gatheringDay && (
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {gatheringDay}
              </Text>
            </div>
          )}

          {gatheringTime && (
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {gatheringTime}
              </Text>
            </div>
          )}

          {location && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {location}
              </Text>
            </div>
          )}
        </div>

        <Space direction="vertical" style={{ width: '100%' }}>
          {isEnrolled && coursePath && (
            <Button type="primary" block onClick={() => navigate(coursePath)}>
              {formatMessage({ id: 'landing.cta.go.course' })}
            </Button>
          )}
          {isEnrolled && whatsAppLink && (
            <Button block onClick={() => window.open(whatsAppLink, '_blank', 'noopener,noreferrer')}>
              {formatMessage({ id: 'landing.cta.whatsapp' })}
            </Button>
          )}
          {!isEnrolled && (
            <Button type="primary" block onClick={() => navigate(resolvedEnrollPath)}>
              {formatMessage({ id: 'landing.cta.enroll' })}
            </Button>
          )}
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

export default CourseStatusTile;
