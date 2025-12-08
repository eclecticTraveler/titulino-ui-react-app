import React, { useEffect, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { getUserNativeLanguage, onLoadingUserResourcesByCourseTheme  } from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';
import ProgressDashboardByEmail from 'components/layout-components/ProgressDashboardByEmail';
import ProgressDashboardByEmailV3 from 'components/layout-components/ProgressDashboardByEmailV3';
import EnrolleeCourseProgressTrackingByEmail from 'components/layout-components/EnrolleeCourseProgressTrackingByEmail';
import CountdownDisplay from 'components/layout-components/CountdownDisplay';
import Countdown from 'react-countdown';
import { env } from 'configs/EnvironmentConfig';

const ExternalFormSection = (props) => {
    const { location, nativeLanguage, course, onLoadingUserResourcesByCourseTheme, currentCourseCodeId } = props;
    const [countdownComplete, setCountdownComplete] = useState(false);

    const loadResources = useCallback(() => {        
        const pathInfo = utils.getThemeCourseInfoFromUrl(location?.pathname); 
        onLoadingUserResourcesByCourseTheme(pathInfo?.courseTheme, nativeLanguage?.localizationId, course)
    }, [location, nativeLanguage, course, currentCourseCodeId]);

    const getNextThursday = () => {
        const now = new Date();
        const currentDay = now.getDay(); // We want to know how many days it takes to get to Thursday (represented as 4, since Sunday is 0). 
        const daysUntilThursday = (4 - currentDay + 7) % 7 || 7; // (4 - currentDay + 7) % 7 calculates the difference between the current day and Thursday:
        const targetDate = new Date(); 
        targetDate.setDate(now.getDate() + daysUntilThursday);
        targetDate.setHours(0, 0, 0, 0); // sets the time of targetDate to midnight (00:00:00), so only the date part is relevant.
        return targetDate;
    };

    const getNextMinute = () => {
        const now = new Date();
        const targetDate = new Date(now);
        targetDate.setSeconds(0, 0);  // Set seconds and milliseconds to zero
        targetDate.setMinutes(now.getMinutes() + 1); // Increment minutes by 1
        return targetDate;
    };
    
    const getThursday7th2024 = () => {
        const now = new Date();
        const currentDay = now.getDay(); // Get the current day of the week (0-6)
        
        // Define the specific date (November 7th, 2024)
        const specificDate = new Date("2024-11-07");
    
        // If today's date is after the specific date (i.e., November 7th), don't show the countdown
        if (now > specificDate) {
            return null;  // Return null to indicate no countdown
        }
    
        // If the current day is before November 7th, calculate days until the target date (November 7th)
        const daysUntilTarget = Math.max(0, Math.floor((specificDate - now) / (1000 * 60 * 60 * 24)));
    
        if (daysUntilTarget > 0) {
            return specificDate;  // If the target date is in the future, return the target date
        }
    
        return specificDate; // If it's the target date, return the target date itself
    };
    

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    const pathInfo = utils.getCourseSectionInfoFromUrl(location?.pathname);
    if (pathInfo?.modality === "my-progress") {
        if(env.IS_NEW_PROGRESS_APP_ON){
            return <ProgressDashboardByEmailV3 />; 
        }else{
            return <ProgressDashboardByEmail />;
        }

    } else if (pathInfo?.modality === "test") {
        if(pathInfo?.levelNo === "level-household"){
            return (
                <>
                    <InternalIFrame iFrameUrl="https://docs.google.com/forms/d/e/1FAIpQLSd9jUkxcvfj4j50gvptcwOSOV5bq451beC3B1NvxUB-h0ZrGg/viewform" />
                </>
    
            );
        } else if(pathInfo?.levelNo === "level-work-n-jobs"){
            return (
                <>
                    <InternalIFrame iFrameUrl="https://forms.gle/QWbdyCWEf3NMo7DU9" />
                </>
    
            );
        }else{
            return (
                <>    
                    <InternalIFrame iFrameUrl="https://docs.google.com/forms/d/e/1FAIpQLSfVR9lA1OISsTgs4mvrHrMfqYOGtk7uiK60u8SQY2vfpQamQw/viewform" />
                </>
    
            );
        }

    } else {
        return (
            <>Error</>
        )
    }
};

const mapDispatchToProps = (dispatch) => bindActionCreators({    
    getUserNativeLanguage,
    onLoadingUserResourcesByCourseTheme
}, dispatch);

const mapStateToProps = ({ lrn, theme }) => {
    const { nativeLanguage, currentCourseCodeId } = lrn;
    const { locale, direction, course } = theme;
    return { locale, direction, course, nativeLanguage, currentCourseCodeId };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExternalFormSection);
