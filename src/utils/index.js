class Utils {

	/**
	 * Get first character from first & last sentences of a username
	 * @param {String} name - Username
	 * @return {String} 2 characters string
	 */
	static getNameInitial(name) {
		let initials = name.match(/\b\w/g) || [];
		return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
	}

	/**
	 * Get current path related object from Navigation Tree
	 * @param {Array} navTree - Navigation Tree from directory 'configs/mainNavigationConfig'
	 * @param {String} path - Location path you looking for e.g '/app/dashboards/analytic'
	 * @return {Object} object that contained the path string
	 */
	static getRouteInfo(navTree, path) {
		if(navTree?.path === path ){
		  return navTree;
		}
		let route; 
		for (let p in navTree) {
		  if( navTree.hasOwnProperty(p) && typeof navTree[p] === 'object' ) {
				route = this.getRouteInfo(navTree[p], path);
				if(route){
					return route;
				}
		  }
		}
		return route;
	}	

	/**
	 * Get current menu object based on url location
	 * @param {Array} dynamicUpperMainNavigation - Navigation Tree from Redux 
	 * @param {String} path - Location path you looking for e.g '/app/dashboards/analytic'
	 * @return {Object} object that contained the path string
	 */
	static getMenuFromDynamicObject(dynamicUpperMainNavigation, pathname){		
		let currentMenu;
		dynamicUpperMainNavigation?.forEach(fullMenu => {
			if(fullMenu.path === pathname){
				// currentMenu = fullMenu;
			//   return currentMenu;
			  return "YESSSSSSSSSSS";
			}
		  });
		  
		  return "Noooooooooopp";
	  }

	/**
	 * getCourseInfoFromUrl
	 * @param {String} path - Location path you looking for e.g '/app/dashboards/analytic'
	 * @return {Object} object that contained the course info string
	 */
	  static getCourseInfoFromUrl(url){
		const pathArray = url?.split('/');
		const levelNo = pathArray[3]?.substring(pathArray[3]?.indexOf('-')+1);
		const chaptNo = pathArray[4]?.substring(pathArray[4]?.indexOf('-')+1);	
		const rawmod = pathArray[5]?.substring(pathArray[5]?.indexOf('-')+1);

		return{
			levelNo: levelNo ?? 0,			
			chapterNo: chaptNo ?? 0,
			modality: rawmod ?? ""
		}
	  }

	  	/**
	 * getCourseInfoFromUrl
	 * @param {String} path - Location path you looking for e.g '/app/dashboards/analytic'
	 * @return {Object} object that contained the course info string
	 */
		  static getThemeCourseInfoFromUrl(url){
			const pathArray = url.split('/');
			const levelNo = pathArray[3]?.substring(pathArray[3]?.indexOf('-')+1);
			const chaptNo = pathArray[4]?.substring(pathArray[4]?.indexOf('-')+1);	
			const rawmod = pathArray[5]?.substring(pathArray[5]?.indexOf('-')+1);
	
			return{
				courseTheme: levelNo ?? "",			
				section: chaptNo ?? "",
				modality: rawmod ?? ""
			}
		  }

	/**
	 * getCourseSectionInfoFromUrl
	 * @param {String} path - Location path you looking for e.g '/app/dashboards/analytic'
	 * @return {Object} object that contained the course info string
	 */
	static getCourseSectionInfoFromUrl(url){
		const pathArray = url.split('/');
		const levelNo = pathArray[3];
		const chaptNo = pathArray[4];	
		const rawmod = pathArray[5];

		return{
			levelNo: levelNo,			
			chapterNo: chaptNo,
			modality: rawmod
		}
	}

	/**
	 * Get Last part of window URL
	 * @return {String} last url path
	 */
	static getLastPathInCurrentUrl = () => {
		const path = window.location.pathname?.split('/');
		return path[path.length - 1];
	  }

	/**
	 * Get URL Path 
	 * @return {String} url path
	 */
		static getPathInCurrentUrl = () => {			
			return window.location.pathname;
		  }  

	/**
	 * Capitalize first letter of string
	 * @param {String} string - any given string
	 * @return {String} capitalized letter
	 */
	static capitalizeFirstLetter(string) {
		return string?.charAt(0).toUpperCase() + string.slice(1);
	  }
	
	/**
	 * Get current path related object from Navigation Tree
	 * @param {Array} navTree - Navigation Tree from directory 'configs/mainNavigationConfig'
	 * @param {String} parentTitle - parent of node title that is within the route obj'
	 * @param {String} routeTitle - node title that is within the route obj'
	 * @return {Object} object that contained the path string
	 */
	static filterSelectedNavigationOptions(parentTitle, routeTitle, navTree){

		 // "lrn" is the root nav node		
		if(routeTitle){
			if(parentTitle === "lrn") {
				return navTree?.find(x => x?.title === routeTitle);
			} 
			else {
				parentTitle = this.capitalizeFirstLetter(parentTitle);
				return navTree?.find(x => x?.title === parentTitle);
			}	
		}
		//return default home submenu
		return navTree?.find(x => x?.title === "Basic");
	 } 

	/**
	 * Capitalize first letter of string
	 * @param {String} path - Location path you looking for e.g '/app/dashboards/analytic'
	 * @return {String} immediate parent location given the path
	 */
	 static getParentSubmenuTitleFromPath(path){
		// TODO: Strip other special characters
		if(path){
			const pathSnippets = path?.split('/').filter(i => i);
			const immediateParent = pathSnippets[pathSnippets.length - 1];
			return immediateParent ? immediateParent : "";
		}
		return "";	
	}

	/**
	 * Get accessible color contrast
	 * @param {String} hex - Hex color code e.g '#3e82f7'
	 * @return {String} 'dark' or 'light'
	 */
	static getColorContrast(hex){
		if(!hex) {
			return 'dark'
		}
		const threshold = 130;
		const hRed = hexToR(hex);
		const hGreen = hexToG(hex);
		const hBlue = hexToB(hex);
		function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
		function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
		function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
		function cutHex(h) {return (h.charAt(0) === '#') ? h.substring(1,7):h}
		const cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
		if (cBrightness > threshold){
			return 'dark'
		} else { 
			return 'light'
		}	
	}

	/**
	 * Darken or lighten a hex color 
	 * @param {String} color - Hex color code e.g '#3e82f7'
	 * @param {Number} percent - Percentage -100 to 100, positive for lighten, negative for darken
	 * @return {String} Darken or lighten color 
	 */
	static shadeColor(color, percent) {
		let R = parseInt(color.substring(1,3),16);
		let G = parseInt(color.substring(3,5),16);
		let B = parseInt(color.substring(5,7),16);
		R = parseInt(R * (100 + percent) / 100);
		G = parseInt(G * (100 + percent) / 100);
		B = parseInt(B * (100 + percent) / 100);
		R = (R<255)?R:255;  
		G = (G<255)?G:255;  
		B = (B<255)?B:255;  
		const RR = ((R.toString(16).length === 1) ? `0${R.toString(16)}` : R.toString(16));
		const GG = ((G.toString(16).length === 1) ? `0${G.toString(16)}` : G.toString(16));
		const BB = ((B.toString(16).length === 1) ? `0${B.toString(16)}` : B.toString(16));
		return `#${RR}${GG}${BB}`; 
	}

	/**
	 * Convert RGBA to HEX 
	 * @param {String} rgba - RGBA color code e.g 'rgba(197, 200, 198, .2)')'
	 * @return {String} HEX color 
	 */
	static rgbaToHex(rgba) {
		const trim = str => (str.replace(/^\s+|\s+$/gm,''))
		const inParts = rgba.substring(rgba.indexOf("(")).split(","),
			r = parseInt(trim(inParts[0].substring(1)), 10),
			g = parseInt(trim(inParts[1]), 10),
			b = parseInt(trim(inParts[2]), 10),
			a = parseFloat(trim(inParts[3].substring(0, inParts[3].length - 1))).toFixed(2);
			const outParts = [
			r.toString(16),
			g.toString(16),
			b.toString(16),
			Math.round(a * 255).toString(16).substring(0, 2)
		];

		outParts.forEach(function (part, i) {
			if (part.length === 1) {
				outParts[i] = '0' + part;
			}
		})
		return (`#${outParts.join('')}`);
	}

	/**
	 * Returns either a positive or negative 
	 * @param {Number} number - number value
	 * @param {any} positive - value that return when positive
	 * @param {any} negative - value that return when negative
	 * @return {any} positive or negative value based on param
	 */
	static getSignNum(number, positive, negative) {
		if (number > 0) {
			return positive
		}
		if (number < 0) {
			return negative
		}
		return null
	}

	/**
	 * Returns either ascending or descending value
	 * @param {Object} a - antd Table sorter param a
	 * @param {Object} b - antd Table sorter param b
	 * @param {String} key - object key for compare
	 * @return {any} a value minus b value
	 */
	static antdTableSorter(a, b, key) {
		if(typeof a[key] === 'number' && typeof b[key] === 'number') {
			return a[key] - b[key]
		}

		if(typeof a[key] === 'string' && typeof b[key] === 'string') {
			a = a[key].toLowerCase();
			b = b[key].toLowerCase();
			return a > b ? -1 : b > a ? 1 : 0;
		}
		return
	}

	/**
	 * Filter array of object 
	 * @param {Array} list - array of objects that need to filter
	 * @param {String} key - object key target
	 * @param {any} value  - value that excluded from filter
	 * @return {Array} a value minus b value
	 */
	static filterArray(list, key, value) {
		let data = list
		if(list) {
			data = list.filter(item => item[key] === value)
		}
		return data
	}

	/**
	 * Remove object from array by value
	 * @param {Array} list - array of objects
	 * @param {String} key - object key target
	 * @param {any} value  - target value
	 * @return {Array} Array that removed target object
	 */
	static deleteArrayRow(list, key, value) {
		let data = list
		if(list) {
			data = list.filter(item => item[key] !== value)
		}
		return data
	}

	/**
	 * Wild card search on all property of the object
	 * @param {Number | String} input - any value to search
	 * @param {Array} list - array for search
	 * @return {Array} array of object contained keyword
	 */
	static wildCardSearch(list, input) {
		const searchText = (item) => {
			for (let key in item) {
				if (item[key] == null) {
					continue;
				}
				if (item[key].toString().toUpperCase().indexOf(input.toString().toUpperCase()) !== -1) {
					return true;
				}
			}
		};
		list = list.filter(value => searchText(value));
		return list;
	}

	/**
   * Retrieves the courseCodeIds the userCourses object.
   * @param {Object} userCourses
   * @returns {array|empty}
   */
	static getAllCourseCodeIdsFromUserCourses(userCourses) {
		if (!userCourses || typeof userCourses !== "object") {
		  console.warn("Invalid userCourses object.");
		  return [];
		}
	  
		return Object.keys(userCourses);
	}
	  


  /**
   * Retrieves the course token from the userCourses object by courseCodeId.
   * @param {Object} userCourses
   * @param {string} courseCodeId
   * @returns {string|null}
   */
	static getCourseTokenFromUserCourses(userCourses, courseCodeId) {
		if (!userCourses || typeof userCourses !== "object") {
		  console.warn("Invalid userCourses object.");
		  return null;
		}
	
		const course = userCourses[courseCodeId];
		return course?.courseToken || null;
	}

	/**
   * Retrieves the course token from the userCourses object by courseCodeId.
   * @param {Object} userCourses
   * @param {string} courseCodeId
   * @returns {string|null}
   */
	static getuserLanguageProficiencyOrderIdForCourse(userCourses, courseCodeId) {
		if (!userCourses || typeof userCourses !== "object") {
		  console.warn("Invalid userCourses object.");
		  return null;
		}
	
		const course = userCourses[courseCodeId];
		return course?.userLanguageProficiencyOrderIdForCourse || null;
	  }

	/**
	 * Get Breakpoint
	 * @param {Object} screens - Grid.useBreakpoint() from antd
	 * @return {Array} array of breakpoint size
	 */
	static getBreakPoint(screens) {
		let breakpoints = []
		for (const key in screens) {
			if (screens.hasOwnProperty(key)) {
				const element = screens[key];
				if (element) {
					breakpoints.push(key)
				}
			}
		}
		return breakpoints
	}
}

export default Utils;