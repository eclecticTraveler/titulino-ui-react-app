import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import Iframe from 'react-iframe';
import IntlMessage from "components/util-components/IntlMessage";

const OverviewLesson = () => {
    const locale = true;
    const setLocale = (isLocaleOn, localeKey) => {
        return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
    };

    const temporalURL = `https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fbusiness.facebook.com%2Ftitulinoingles%2Fvideos%2F8908980605885374%2F&show_text=false&width=560&t=0`;

    // Manage iframe height dynamically
    const [iframeHeight, setIframeHeight] = useState("325px");

    useEffect(() => {
        const updateHeight = () => {
            const newHeight = Math.max(150, Math.min(325, window.innerHeight * 0.4));
            setIframeHeight(`${newHeight}px`);
        };

        updateHeight(); // Set initial height
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    return (
        <div>
            <Card bordered={true} title={setLocale(locale, "unauthenticated.dashboard.courseOverview")}>
                <Iframe 
                    url={temporalURL} 
                    width="100%" 
                    height={iframeHeight} 
                    id="internalIFrame"
                />                           
            </Card>	
        </div>
    );
};

export default OverviewLesson;
