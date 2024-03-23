import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {getAllLanguageCourses, setUserCourseConfiguration, setUserSelectedCourse, setUserNativeLanguage}  from 'redux/actions/Lrn';
import IconAdapter from 'components/util-components/IconAdapter';
import { withRouter } from "react-router-dom";
import { onLocaleChange, onCourseChange } from 'redux/actions/Theme'
import IntlMessage from "components/util-components/IntlMessage";
import { 
	ArrowRightOutlined
} from '@ant-design/icons';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

class CourseSelection extends Component {

	setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	}	

    componentDidMount() {
		this.props.getAllLanguageCourses();
	}

	processSelectedCourse = (course) => {		
		if(this.props.nativeLanguage){		
			this.props.onCourseChange(course?.courseAbbreviation);
			this.props.setUserSelectedCourse(course);
			this.props.history.push('/');
		}
					
	}

	processUserNativeLanguage = (language) => {			
		this.props.setUserNativeLanguage(language);
		this.props.onLocaleChange(language?.localizationId);
	}

	goBackToNativeLanguageSelection = () => {
		this.props.setUserNativeLanguage(null);
	}

	render(){ 
		// TITULINO: Check if null is a good move previous to map line 26, also change class names and adjust flag sizes 
		const locale = true;
		let listOfBasedLanguages = null;
		let listOfCoursesBySelectedNativeLanguage = null;
		if(this.props.languageCourses?.length > 0 ){
			listOfBasedLanguages =  this.props.languageCourses.map((language, i) =>	{
				return language?.isAvailable && (
					<div key={i} className="single-web-account" onClick={() => this.processUserNativeLanguage(language)}>
					<div>
						<div className='antd-icon-arrow'>
							<ArrowRightOutlined />
						</div>
						<div className="course">
							<img className="course-flag" src={language.flag} alt={language.flag}/>
							<h5 className="course-name">{language.basedlanguage}</h5>
						</div>
					</div>
				</div>	
				)
			}			
			)	

			if(this.props.nativeLanguage){	
				listOfCoursesBySelectedNativeLanguage =  this.props.nativeLanguage?.courses?.map((course, i) => 
				{
					return course?.isAvailable && (
						<div key={i} className="single-web-account" onClick={() => this.processSelectedCourse(course)}>
							<div>
								<div className='antd-icon-arrow'>
									<ArrowRightOutlined />
								</div>
								<div className="course">
									<img  className="course-flag" src={course.courseFlag} alt={course.courseFlag}/>
									<h5 className="course-name">{course.courseTitle}</h5>
								</div>
							</div>
						</div>
					)
				}
	

				)
			}

		}
		
        return(	
			<div>
				<div className="single-web-account-modal">
				<div className="single-web-account-modal-content">
				<IconAdapter icon={"/img/titulino-logo-1.png"} iconType={ICON_LIBRARY_TYPE_CONFIG.hostedSvg}/>
					<div>
						{
							(!this.props.nativeLanguage) && 
							<div id="course-selection-section">
								<div className="information">
									<h2>Select your native language below TESTING5</h2>
									<p>Seleccione abajo su idioma nativo / Selecione embaixo o seu idioma nativo</p>
								</div>
								<div>
								{listOfBasedLanguages}
								</div>
							</div>
						}

						{
						(this.props.nativeLanguage) && 						
							<div id="native-language-selection-modal">
								<div className="information-account">
									<h2>{this.setLocale(locale, "select.course.modal.title")}</h2>
									<h4>{this.setLocale(locale, "select.course.modal.subtitle")}</h4>
								</div>
								<div>													
								{listOfCoursesBySelectedNativeLanguage}
								</div>
								<div>
									<button className="go-back-btn" onClick={() => this.goBackToNativeLanguageSelection()}>
										{/* // Set locale for this wording */}
										<img className="go-back-img" src="/img/others/angle-double-left-solid.svg" alt="" />
										<span className="go-back-text">{this.setLocale(locale, "select.course.go.back")}</span>
									</button>
								</div>
							</div>
						}
						<br />
						<br />
						<div>
						{this.setLocale(locale, "select.course.footer.question")}<br />Email <a href="mailto:titulinoingles@gmail.com">titulinoingles@gmail.com</a> 
							<br />
							{this.setLocale(locale, "select.course.footer.find.us")}<a href="https://www.facebook.com/titulinoingles" target="_blank" rel="noreferrer"> facebook</a>
						</div>
					</div>						
				</div>
				</div>
			</div>
		)
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		setUserCourseConfiguration: setUserCourseConfiguration,
		getAllLanguageCourses: getAllLanguageCourses,
		setUserSelectedCourse: setUserSelectedCourse,
		onCourseChange: onCourseChange,
		setUserNativeLanguage: setUserNativeLanguage,
		onLocaleChange: onLocaleChange
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {languageCourses, nativeLanguage} = lrn;
	return {languageCourses, nativeLanguage} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CourseSelection));
