import React, { useEffect } from 'react';
import IntlMessage from '../util-components/IntlMessage';
import Countdown from 'react-countdown';

const CountdownDisplay = ({ countdownDate, completionComponent }) => {

    const setLocale = (isLocaleOn, localeKey) => (
        isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString()
    );

    const countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return completionComponent; // Display the passed component when countdown completes
        } else {
            return (
                <h1>
                    {days}d {hours}h {minutes}m {seconds}s
                </h1>
            );
        }
    };

    
    return (
        <div className="titulino-modal">
            <div className="titulino-modal-content under-construction-modal-content justifyLeft">
                <div className="upperTitleConstruction">
                    {/* Optional Image */}
                </div>
                <svg className="construction constructionIcon" viewBox="0 0 512 512">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M432 304c0 114.9-93.1 208-208 208S16 418.9 16 304c0-104 76.3-190.2 176-205.5V64h-28c-6.6 0-12-5.4-12-12V12c0-6.6 5.4-12 12-12h120c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-28v34.5c37.5 5.8 71.7 21.6 99.7 44.6l27.5-27.5c4.7-4.7 12.3-4.7 17 0l28.3 28.3c4.7 4.7 4.7 12.3 0 17l-29.4 29.4-.6 .6C419.7 223.3 432 262.2 432 304zm-176 36V188.5c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12V340c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12z" />
                    </svg>
                </svg>
                <div className="mainTitle">
                    <strong className="innerPadding">{setLocale(true, "countdown.explanation")}</strong>
                </div>
                <div className="innerColoredContainer underConstructionColoredContainer">
                    <div className="innercolorContainerProfile text-center">
                        <h3>{setLocale(true, "countdown.title")}</h3>
                        <Countdown date={countdownDate} renderer={countdownRenderer} />
                    </div>
                </div>
                <div className="underConstruccion contentTitle innerPadding">
              
                </div>
                <div className="footerInformation">
                    <div className="innerFooterTitle">
                        <div>
                            {setLocale(true, "select.course.footer.question")}
                            <br />
                            Email <a href="mailto:titulinoingles@gmail.com">titulinoingles@gmail.com</a>
                            <br />
                            {setLocale(true, "select.course.footer.find.us")}
                            <a href="https://www.facebook.com/titulinoingles" target="_blank" rel="noreferrer"> facebook</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountdownDisplay;
