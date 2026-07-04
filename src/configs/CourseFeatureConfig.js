
export const COURSE_FEATURE_FLAGS = {
	meditaciones: {
		hasGrammarClass: false,
		hasQuizletAndExercises: false,
	}
};

export const getCourseFeatureFlags = (theme) => ({
	hasGrammarClass: true,
	hasQuizletAndExercises: true,
	...(COURSE_FEATURE_FLAGS[theme] || {})
});
