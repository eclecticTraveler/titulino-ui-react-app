import SearchIndexService from 'services/SearchIndexService';

// Static keywords that supplement the data-driven index.
// The data-driven index (SearchIndexService) auto-extracts chapter titles,
// PDF titles, and vocabulary words from the JSON data files.
const localizedKeywords = {
	en: {
		themeKeywords: {
		  class: ['lecture', 'classroom', 'learning'],
		},
	  },
	es: {
	  themeKeywords: {
		supermarket: ['mercado', 'compras'],
		household: ['suministros de limpieza', 'mantenimiento del hogar'],
		'work-n-jobs': ['trabajo', 'empleos'],
	  },
	},
	pt: {
	  themeKeywords: {
		supermarket: ['mercado', 'compras'],
		household: ['suprimentos de limpeza', 'manutenção doméstica'],
		'work-n-jobs': ['trabalho', 'empregos'],
	  },
	}
  };
  

  const generateSearchKeywords = (lang, levelNo, chapterNo, type) => {
	const localizedConfig = localizedKeywords?.[lang] || {};
  
	// Static theme-level keywords (language-specific)
	const staticKeywords = localizedConfig.themeKeywords?.[levelNo] || localizedConfig.themeKeywords?.[type] || [];

	// Data-driven keywords from chapter-book-data, pdf-data, speaking-practice-data
	const dataKeywords = SearchIndexService.getKeywordsForChapter(levelNo, chapterNo);
  
	return [
	  type,
	  levelNo,
	  String(chapterNo),
	  'course',
	  'learning',
	  ...staticKeywords,
	  ...dataKeywords,
	];
  };
  
  



  

const englishCoursesAssociatedSearchKeywords = {
	generateSearchKeywords
}

export default englishCoursesAssociatedSearchKeywords;



  

  

