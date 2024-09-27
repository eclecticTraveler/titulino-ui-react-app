export const getLocalizedConfig = (lang) => {
	// spell  || flashcards -> Resources || Match --> play|| Learn --> pratica|| Test
	let localization = {
		chapter: "chapter",
		class: "class",
		listening: "listening",
		resources: "resources",
		test: "test",
		spell:"spell",
		level: "level",
		practice: "practice",
		play:"play",
		modality: "modality",
		module: "module",
		review: "review",
		quizlet: "quizlet",
		book: "book"

	}

	switch (lang) {
		case "eng":      
			return localization;
		case "por":
			localization.chapter = "capitulo";
			localization.class = "classe";
			localization.listening = "compreensão";
			localization.resources = "recursos";
			localization.level = "nivel";
			localization.practice = "pratica";
			localization.test = "teste";
			localization.play = "joga";
			localization.spell = "escreve";
			localization.modality = "modalidade";
			localization.module = "módulo";
			localization.review = "revisão";
			localization.quizlet = "quizlet";
			localization.book = "libro";
			return localization;
		case "spa":
			localization.chapter = "capitulo";
			localization.class = "clase";
			localization.listening = "comprensión";
			localization.resources = "recursos";
			localization.level = "nivel"
			localization.practice = "pratica";
			localization.test = "examen";
			localization.play = "juega";
			localization.spell = "redacta";
			localization.modality = "modalidad";
			localization.module = "módulo";
			localization.review = "repaso";
			localization.quizlet = "quizlet";
			localization.book = "livro";
			return localization;        
		default:
			return localization;
		}		  	
}

