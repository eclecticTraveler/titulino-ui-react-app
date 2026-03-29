import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {getAllLanguageOptions, setUserLanguageConfiguration, setSelectedContentLanguage, setUserBaseLanguage, onUserSelectingContentLanguage}  from 'redux/actions/Lrn';
import IconAdapter from 'components/util-components/IconAdapter';
import { withRouter } from "utils/routerCompat";
import { onLocaleChange, onContentLanguageChange } from 'redux/actions/Theme'
import IntlMessage from "components/util-components/IntlMessage";
import { 
	ArrowRightOutlined
} from '@ant-design/icons';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import Flag from "react-world-flags";
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeItem = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const questionContainer = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.2 } }
};

// Step 1: 3 questions — smaller offset so they don't appear too low
// y keyframes: [startPosition, holdPosition, finalPosition]
//   "5vh"  = start 5% of viewport height below final position
//   "5vh"  = hold at that position while user reads (times[1] = 0.6 means hold for 60% of duration)
//   "0vh"  = slide up to final resting position
// delay: 1.3s = wait for stagger fade-in of individual questions to finish before sliding
// duration: 0.8s = total slide animation time (the hold + move phases)
// ease: cubic-bezier for a smooth, gentle deceleration
const questionSlideStep1 = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		y: ["5vh", "5vh", "0vh"],
		transition: {
			y: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.6, 1], delay: 1.3 },
			opacity: { duration: 0.01 }
		}
	}
};

// Step 2: 2 questions — larger offset for a more dramatic centered entrance
// Same keyframe pattern as Step 1 but with bigger vertical offset
const questionSlideStep2 = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		y: ["10vh", "12vh", "0vh"],
		transition: {
			y: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.6, 1], delay: 1.3 },
			opacity: { duration: 0.01 }
		}
	}
};

// Options: hidden with opacity 0 so children don't flash before the questions slide up
// delayChildren: waits for questionSlide to finish (1.3s delay + 0.8s duration ≈ 2.1s)
// staggerChildren: each flag option fades in 0.1s after the previous one
const optionsStagger = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { delayChildren: 2.0, staggerChildren: 0.1, opacity: { delay: 2.0 } } }
};

class CourseSelection extends Component {

	setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	}	

    componentDidMount() {
		this.props.getAllLanguageOptions();
	}

	processSelectedContentLanguage = (contentLanguage) => {			
		
		if(this.props.baseLanguage){		
			console.log("------>Course-selection", contentLanguage)
			this.props.onContentLanguageChange(contentLanguage?.contentLanguageCode);
			this.props.setSelectedContentLanguage(contentLanguage);
			this.props.onUserSelectingContentLanguage(contentLanguage);
			
		}
					
	}

	processUserBaseLanguage = (language) => {		
		this.props.setUserBaseLanguage(language);
		this.props.onLocaleChange(language?.localeCode);
	}

	goBackToBaseLanguageSelection = () => {
		this.props.setUserBaseLanguage(null);
	}

	render(){ 
		// TITULINO: Check if null is a good move previous to map line 26, also change class names and adjust flag sizes 
		const locale = true;
		let listOfBasedLanguages = null;
		let listOfContentLanguagesByBaseLanguage = null;
		if(this.props.languageOptions?.length > 0 ){
				listOfBasedLanguages =  this.props.languageOptions.map((language, i) =>	{
					return language?.isAvailable && (
						<motion.div key={i} className="single-web-account" variants={fadeItem} onClick={() => this.processUserBaseLanguage(language)}>
						<div>
							<div className='antd-icon-arrow'>
								<ArrowRightOutlined />
							</div>
							<div className="course">
								<div className="course-flag course-selection-flag">
									<Flag code={language.flagCodeName} />
								</div>
								<h5 className="course-name">{language.baseLanguageName}</h5>
							</div>
						</div>
					</motion.div>	
					)
				}			
			)	

			if(this.props.baseLanguage){	
					listOfContentLanguagesByBaseLanguage =  this.props.baseLanguage?.contentLanguages?.map((contentLang, j) => 
					{
						return contentLang?.isAvailable && (
							<motion.div key={j} className="single-web-account" variants={fadeItem} onClick={() => this.processSelectedContentLanguage(contentLang)}>
								<div>
									<div className='antd-icon-arrow'>
										<ArrowRightOutlined />
									</div>
									<div className="course">
										<div className="course-flag course-selection-flag">
											<Flag code={contentLang.contentLanguageFlagCode} />
										</div>
										<h5 className="course-name">{contentLang.contentLanguageName}</h5>
									</div>
								</div>
							</motion.div>
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
					<div style={{ overflow: 'hidden' }}>
					<AnimatePresence mode="wait">
						{
							(!this.props.baseLanguage) && 
							<motion.div
								key="base-language-step"
								id="course-selection-section"
								initial="hidden"
								animate="visible"
								exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
							>
								<motion.div className="information" variants={questionSlideStep1} initial="hidden" animate="visible">
									<motion.div variants={questionContainer} initial="hidden" animate="visible">
										<motion.h3 variants={fadeItem}><Flag code='ar' style={{ width: 20, marginRight: 10 }} />¿Qué idioma habla usted?</motion.h3>
										<motion.h3 variants={fadeItem}><Flag code='br' style={{ width: 20, marginRight: 10 }} />Qual idioma você fala?</motion.h3>
										<motion.h3 variants={fadeItem}><Flag code='us' style={{ width: 20, marginRight: 10 }} />What language do you speak?</motion.h3>
									</motion.div>
								</motion.div>
								<motion.div variants={optionsStagger} initial="hidden" animate="visible">
								{listOfBasedLanguages}
								</motion.div>
							</motion.div>
						}

						{
						(this.props.baseLanguage) &&
							<motion.div
								key="content-language-step"
								id="native-language-selection-modal"
								initial="hidden"
								animate="visible"
								exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
							>
								<motion.div className="information-account" variants={questionSlideStep2} initial="hidden" animate="visible">
									<motion.div variants={questionContainer} initial="hidden" animate="visible">
										<motion.h2 variants={fadeItem}>{this.setLocale(locale, "select.course.modal.title")}</motion.h2>
										<motion.h4 variants={fadeItem}>{this.setLocale(locale, "select.course.modal.subtitle")}</motion.h4>
									</motion.div>
								</motion.div>
								<motion.div variants={optionsStagger} initial="hidden" animate="visible">
								{listOfContentLanguagesByBaseLanguage}
								<motion.div variants={fadeItem}>
									<button className="go-back-btn" onClick={() => this.goBackToBaseLanguageSelection()}>
										<img className="go-back-img" src="/img/others/angle-double-left-solid.svg" alt="" />
										<span className="go-back-text">{this.setLocale(locale, "select.course.go.back")}</span>
									</button>
								</motion.div>
								</motion.div>
							</motion.div>
						}
					</AnimatePresence>
					</div>
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
		)
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		setUserLanguageConfiguration: setUserLanguageConfiguration,
		getAllLanguageOptions: getAllLanguageOptions,
		setSelectedContentLanguage: setSelectedContentLanguage,
		onContentLanguageChange: onContentLanguageChange,
		setUserBaseLanguage: setUserBaseLanguage,
		onLocaleChange: onLocaleChange,
		onUserSelectingContentLanguage: onUserSelectingContentLanguage
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {languageOptions, baseLanguage, isLanguageConfigured} = lrn;
	return {languageOptions, baseLanguage, isLanguageConfigured} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CourseSelection));
