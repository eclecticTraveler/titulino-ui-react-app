import React from 'react';
import { Badge, Card, Button, Typography, Divider } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, EnvironmentOutlined, SoundOutlined, BookOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { AUTH_PREFIX_PATH } from 'configs/AppConfig';
import Flag from 'react-world-flags';
import langData from 'assets/data/language.data.json';

const { Text } = Typography;

const WhatsAppSvg = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'text-bottom', marginRight: 6 }}>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

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
        hoverable
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

        <div style={{ width: '100%' }}>
          {isEnrolled && coursePath && (
            <Button type="primary" block icon={<ArrowRightOutlined />} onClick={() => navigate(coursePath)}>
              {formatMessage({ id: 'landing.cta.go.course' })}
            </Button>
          )}
          {isEnrolled && whatsAppLink && (
            <>
              {coursePath && (
                <Divider plain style={{ margin: '8px 0', fontSize: 11, color: '#adb8c4' }}>
                  {formatMessage({ id: 'landing.cta.or.visit' })}
                </Divider>
              )}
              <Button
                block
                style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff' }}
                onClick={() => window.open(whatsAppLink, '_blank', 'noopener,noreferrer')}
              >
                <WhatsAppSvg />
                {formatMessage({ id: 'landing.cta.whatsapp' })}
              </Button>
            </>
          )}
          {!isEnrolled && (
            <Button type="primary" block onClick={() => navigate(resolvedEnrollPath)}>
              {formatMessage({ id: 'landing.cta.enroll' })}
            </Button>
          )}
        </div>
      </Card>
    </Badge.Ribbon>
  );
};

export default CourseStatusTile;
