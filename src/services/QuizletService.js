import quizletPracticeData from '../assets/data/quizlet-pratice-data.json';
import CentralCourseThemeService from 'services/CentralCourseThemeService';

const loadQuizletData = async() => {
  const quizletData = quizletPracticeData;
  return quizletData;
}

const loadRequestedModule = async(levelNo, nativeLanguage, course) => {
  const rawQuizletData = await loadQuizletData();
  const rawRequestedModule = rawQuizletData?.folders.find(q => (q.level === CentralCourseThemeService.getThemeMappedLevelNo(levelNo) && q.nativeLanguage === nativeLanguage && q.course === course ));
  return rawRequestedModule;
}

const loadChapter = async(rawRequestedModule, chapterNo) => {
  const chapterId = rawRequestedModule?.courses[chapterNo - 1]
  return chapterId;
}

const getQuizletKeyWord = async(keyword) => {
    switch(keyword) {
      case "play":
      case "joga":
      case "juega":
        return "match";
      case "listening":
      case "comprensión":	
      case "compreensão":
      case "review":
      case "revisão":
      case "repaso":
        return "learn";
      case "spell":
      case "escreve":
      case "redacta":
        return "spell";
      case "resources":
      case "recursos":
      case "quizlet":
        return "flashcards";
      case "test":
      case "teste":
      case "examen":
        return "test";
      default:
        return "test";
  }
}

export const getEmbeddableUrl = async(modality, chapterNo, levelNo, nativeLanguage, course) => {
  const rawRequestedModule = await loadRequestedModule(levelNo, nativeLanguage, course);
  const chapter = await loadChapter(rawRequestedModule, chapterNo);
  const mod = await getQuizletKeyWord(modality);
  const embeddableUrl = (chapter.id && rawRequestedModule) ? `https://quizlet.com/${chapter?.id}/${mod}/embed?${quizletPracticeData?.generalId}` : ""; 

  return embeddableUrl;
}

const QuizletService = {
  getEmbeddableUrl
};

export default QuizletService;
