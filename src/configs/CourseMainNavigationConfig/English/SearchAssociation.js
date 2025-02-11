// ['class', '1', '1', 'course', 'learning', 'vegetables', 'produce', 'groceries', 'class intro', 'lesson basics']
const localizedKeywords = {
	eng: {
		themeKeywords: {
		  class: ['lecture', 'classroom', 'learning'],
		  1: ['vegetables', 'produce', 'groceries'],
		  2: ['meat', 'seafood'],
		},
		lessonKeywords: {
		  class: {
			1: ['class intro', 'lesson basics'],
			2: ['advanced lecture']
		  },
		  supermarket: {
			1: ['fruits', 'vegetables'],
			2: ['poultry', 'meat']
		  }
		}
	  },
	es: {
	  themeKeywords: {
		1: ['verduras', 'productos', 'víveres'],
		2: ['carne', 'mariscos'],
		supermarket: ['mercado', 'compras'],
		household: ['suministros de limpieza', 'mantenimiento del hogar']
	  },
	  lessonKeywords: {
		supermarket: {
		  1: ['frutas', 'verduras'],
		  2: ['aves de corral', 'carne']
		},
		household: {
		  1: ['detergente', 'jabón para platos'],
		  2: ['herramientas', 'ferretería']
		}
	  }
	},
	pt: {
	  themeKeywords: {
		1: ['vegetais', 'produtos', 'mantimentos'],
		2: ['carne', 'frutos do mar'],
		supermarket: ['mercado', 'compras'],
		household: ['suprimentos de limpeza', 'manutenção doméstica']
	  },
	  lessonKeywords: {
		supermarket: {
		  1: ['frutas', 'vegetais'],
		  2: ['aves', 'carne']
		},
		household: {
		  1: ['detergente', 'sabão para pratos'],
		  2: ['ferramentas', 'hardware']
		}
	  }
	}
  };
  

  const generateSearchKeywords = (lang, levelNo, chapterNo, type) => {
	const localizedConfig = localizedKeywords?.[lang] || {};
  
	// Fetch specific lesson keywords
	const chapterSpecificKeywords = localizedConfig.lessonKeywords?.[type]?.[chapterNo] || [];
  
	// Fallback to theme-level keywords if no lesson-specific keywords
	const customKeywords = chapterSpecificKeywords.length
	  ? []
	  : localizedConfig.themeKeywords?.[levelNo] || localizedConfig.themeKeywords?.[type] || [];
  
	return [
	  type,
	  levelNo,
	  chapterNo,
	  'course',
	  'learning',
	  ...chapterSpecificKeywords,
	  ...customKeywords
	];
  };
  
  



  

const englishCoursesAssociatedSearchKeywords = {
	generateSearchKeywords
}

export default englishCoursesAssociatedSearchKeywords;



  

  

