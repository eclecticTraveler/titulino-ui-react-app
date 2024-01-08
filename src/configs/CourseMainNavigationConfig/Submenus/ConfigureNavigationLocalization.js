export const getLocalizedConfig = (lang) => {
	// spell  || flashcards -> Resources || Match --> play|| Learn --> pratica|| Test
	let localization = {
		chapter: "chapter",
		class: "class",
		listening: "listening",
		resources: "resources",
		level: "level",
		practice: "practice",
		test: "test",
		play:"play",
		spell:"spell",
		modality: "modality"

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
			return localization;        
		default:
			return localization;
		}		  	
}

