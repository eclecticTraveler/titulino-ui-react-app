import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Row, Col } from 'antd';
import ContactEnrollment from './ContactEnrollment';
import {toggleCollapsedNav, onMobileNavToggle} from 'redux/actions/Theme';
import { onRenderingCourseRegistration } from "redux/actions/Lrn";
import Loading from "components/shared-components/Loading";
import CourseSelection from "./CourseSelection";
import QuickEnrollment from "./QuickEnrollment";

// [
//     {
//       "EndDate": "2025-03-10T00:00:00",
//       "StartDate": "2024-12-09T00:00:00",
//       "HasStarted": false,
//       "CourseCodeId": "DUMMY_TEST_DEC_2024_COURSE_01",
//       "CourseDetails": {
//         "course": "Dummy",
//         "teacher": "Arellano",
//         "location": "Rexburg, Idaho",
//         "gatheringDay": "Tuesdays",
//         "gatheringTime": "7:00 pm",
//         "courseWeeksLength": 14,
//         "gatheringStartingDate": "December 9, 2024",
//         "targetAudienceNativeLanguage": "Portuguese"
//       }
//     }
//   ]


// FROM QUICK ENROLLMENT
// countryDivisionOfBirth :"MX-BCN"
// countryDivisionOfResidence :  "MX-BCN"
// countryOfBirth : {value: null, label: {…}}
// countryOfResidence : {value: 'MEX', label: {…}}
// dateOfBirth : Moment {_isAMomentObject: true, _isUTC: false, _pf: {…}, _locale: Locale, _d: Wed Nov 06 2024 10:50:01 GMT-0700 (Mountain Standard Time), …}
// emailAddress :"xl_189@yahoo.com.mx"


// FULL ENROLLMENT

// birthDivision : "CO-BOL"
// country : "MX"
// countryOfBirth :  "CO"
// division : "MX-CHP"
// dob : Moment {_isAMomentObject: true, _isUTC: false, _pf: {…}, _locale: Locale, _d: Tue Nov 05 2024 09:37:16 GMT-0700 (Mountain Standard Time), …}
// email : "xl_189@yahoo.com.mx"
// gender : "F"
// languageLevel : "na"
// lastName : "Arellano"
// names : "Alberto"

// IDEAL
// {
//     "contactExternalId": null,
//     "emailAddress": "marthacaballerod@gmail.com",
//     "lastNames": "CABALLERO",
//     "names": "MARTHA",
//     "sex": "F",
//     "dateOfBirth": "11/30/1965",
//     "countryOfResidence": "Colombia",
//     "countryDivisionOfResidence": null,
//     "countryOfBirth": "Colombia",
//     "countryDivisionOfBirth": null,
//     "termsVersion": "0.5",
//     "coursesCodeIds": [
//         {
//             "courseCodeId": "SUPERMARKET_SEP_2024_COURSE_01"
//         }
//     ],
//     "languageProficiencies": [
//         {
//             "languageId": "es",  
//             "languageLevelAbbreviation": "na"
//         },
//         {
//             "languageId": "en",  
//             "languageLevelAbbreviation": "in"
//         }
//     ]
// }

  //        <Option key={country.CountryId} value={country.CountryName}> does not work for now if I dont pass CountryId
 
export const EnrollmentWrapper = (props) => {
	const { mobileNav, onMobileNavToggle, toggleCollapsedNav, navCollapsed, onRenderingCourseRegistration, availableCourses } = props;
    // If you need componentDidMount/componentDidUpdate-like behavior, you can use useEffect:
    useEffect(() => {
        // This runs once on mount (componentDidMount)
        // If you have code that should run on component update, add dependencies to the array.
        onRenderingCourseRegistration()
    }, []); // Empty array ensures this runs only once, similar to componentDidMount.



    if(!availableCourses){
        return (
            <div>
                <Loading cover="content"/>
            </div>
        )
    }else{
        if(availableCourses?.length > 1){
            return (
                <div>
                    
                    {/* <QuickEnrollment/> */}
                     <CourseSelection/>
                     {/* <ContactEnrollment /> */}
                </div>
            );
        }else{
            return (
                <div>
                     <QuickEnrollment/>
                </div>
            );
        }
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		toggleCollapsedNav: toggleCollapsedNav,
		onMobileNavToggle: onMobileNavToggle,
        onRenderingCourseRegistration: onRenderingCourseRegistration
	}, dispatch)
}

const mapStateToProps = ({ theme, lrn }) => {
	const {currentRoute, availableCourses} = lrn;
	const { sideNavTheme, topNavColor, navCollapsed } = theme;
	return { sideNavTheme, topNavColor, currentRoute, navCollapsed, availableCourses };
};

export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentWrapper);