import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { TopPage } from "./pages/TopPage";
import { CategoryPage } from "./pages/CategoryPage";
import { TimetableExamplesPage } from "./pages/TimetableExamplesPage";
import { InstructorListPage } from "./pages/InstructorListPage";
import { InstructorDetailPage } from "./pages/InstructorDetailPage";
import { EnglishInstructorListPage } from "./pages/EnglishInstructorListPage";
import { EnglishInstructorDetailPage } from "./pages/EnglishInstructorDetailPage";
import { JapaneseInstructorListPage } from "./pages/JapaneseInstructorListPage";
import { JapaneseInstructorDetailPage } from "./pages/JapaneseInstructorDetailPage";
import { FoundationCoursesListPage } from "./pages/FoundationCoursesListPage";
import { FoundationCourseDetailPage } from "./pages/FoundationCourseDetailPage";
import { ModernSystemCoursesListPage } from "./pages/ModernSystemCoursesListPage";
import { ModernSystemCourseDetailPage } from "./pages/ModernSystemCourseDetailPage";
import { GeneralEducationListPage } from "./pages/GeneralEducationListPage";
import { GeneralEducationDetailPage } from "./pages/GeneralEducationDetailPage";
import { FirstYearEducationListPage } from "./pages/FirstYearEducationListPage";
import { FirstYearEducationDetailPage } from "./pages/FirstYearEducationDetailPage";
import { CommerceCoursesListPage } from "./pages/CommerceCoursesListPage";
import { CommerceCourseDetailPage } from "./pages/CommerceCourseDetailPage";
import { EngineeringCoursesListPage } from "./pages/EngineeringCoursesListPage";
import { EngineeringCourseDetailPage } from "./pages/EngineeringCourseDetailPage";
import { LawCoursesListPage } from "./pages/LawCoursesListPage";
import { LawCourseDetailPage } from "./pages/LawCourseDetailPage";
import { ScienceCoursesListPage } from "./pages/ScienceCoursesListPage";
import { ScienceCourseDetailPage } from "./pages/ScienceCourseDetailPage";
import { LiteratureCoursesListPage } from "./pages/LiteratureCoursesListPage";
import { LiteratureCourseDetailPage } from "./pages/LiteratureCourseDetailPage";
import { MedicalRehabCoursesListPage } from "./pages/MedicalRehabCoursesListPage";
import { MedicalRehabCourseDetailPage } from "./pages/MedicalRehabCourseDetailPage";
import { NursingCoursesListPage } from "./pages/NursingCoursesListPage";
import { NursingCourseDetailPage } from "./pages/NursingCourseDetailPage";
import { EconomicsCoursesListPage } from "./pages/EconomicsCoursesListPage";
import { EconomicsCourseDetailPage } from "./pages/EconomicsCourseDetailPage";
import { LifeScienceCoursesListPage } from "./pages/LifeScienceCoursesListPage";
import { LifeScienceCourseDetailPage } from "./pages/LifeScienceCourseDetailPage";
import { VeterinaryNoDataPage } from "./pages/VeterinaryNoDataPage";
import { MedicalNoDataPage } from "./pages/MedicalNoDataPage";
import { AgricultureNoDataPage } from "./pages/AgricultureNoDataPage";

type CategorySlug =
  | "general"
  | "second-language"
  | "foundation"
  | "first-year-seminar"
  | "health-sports"
  | "english"
  | "specialized";

type Page =
  | "login"
  | "top"
  | "category"
  | "course-detail"
  | "timetable-examples"
  | "instructor-list"
  | "instructor-detail"
  | "english-instructor-list"
  | "english-instructor-detail"
  | "japanese-instructor-list"
  | "japanese-instructor-detail"
  | "foundation-courses-list"
  | "foundation-course-detail"
  | "modern-system-courses-list"
  | "modern-system-course-detail"
  | "general-education-list"
  | "general-education-detail"
  | "first-year-education-list"
  | "first-year-education-detail"
  | "commerce-courses-list"
  | "commerce-course-detail"
  | "engineering-courses-list"
  | "engineering-course-detail"
  | "law-courses-list"
  | "law-course-detail"
  | "science-courses-list"
  | "science-course-detail"
  | "literature-courses-list"
  | "literature-course-detail"
  | "medical-rehab-courses-list"
  | "medical-rehab-course-detail"
  | "nursing-courses-list"
  | "nursing-course-detail"
  | "economics-courses-list"
  | "economics-course-detail"
  | "life-science-courses-list"
  | "life-science-course-detail"
  | "veterinary-no-data"
  | "medical-no-data"
  | "agriculture-no-data";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("top");
  const [currentCategory, setCurrentCategory] =
    useState<CategorySlug>("general");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("hayashi-yuki");
  const [selectedEnglishInstructorId, setSelectedEnglishInstructorId] = useState<string>("pollock-timothy-wayne");
  const [selectedJapaneseInstructorId, setSelectedJapaneseInstructorId] = useState<string>("ikari-yukio");
  const [selectedFoundationCourseId, setSelectedFoundationCourseId] = useState<string>("calculus-hashimoto");
  const [selectedModernSystemCourseId, setSelectedModernSystemCourseId] = useState<string>("marketing-science");
  const [selectedGeneralEducationId, setSelectedGeneralEducationId] = useState<string>("ge-intensive-001");
  const [selectedFirstYearEducationId, setSelectedFirstYearEducationId] = useState<string>("first-year-seminar-001");
  const [selectedCommerceCourseId, setSelectedCommerceCourseId] = useState<string>("accounting");
  const [selectedEngineeringCourseId, setSelectedEngineeringCourseId] = useState<string>("communication-systems-yamada");
  const [selectedLawCourseId, setSelectedLawCourseId] = useState<string>("law-intro-naka-moriya-kanazawa");
  const [selectedScienceCourseId, setSelectedScienceCourseId] = useState<string>("modern-physics-intro-omnibus");
  const [selectedLiteratureCourseId, setSelectedLiteratureCourseId] = useState<string>("folklore-ono");
  const [selectedMedicalRehabCourseId, setSelectedMedicalRehabCourseId] = useState<string>("morphology-function-1-miyai");
  const [selectedNursingCourseId, setSelectedNursingCourseId] = useState<string>("anatomy-physiology-sawai");
  const [selectedEconomicsCourseId, setSelectedEconomicsCourseId] = useState<string>("econometrics-1-kano");
  const [selectedLifeScienceCourseId, setSelectedLifeScienceCourseId] = useState<string>("basic-cell-biology-kim");

  // カテゴリ名のマッピング（UIとAPIのslugをマッピング）
  const categoryNames: Record<CategorySlug, string> = {
    general: "総合教養科目（般教）",
    "second-language": "第二外国語",
    foundation: "基礎教育科目",
    "first-year-seminar": "初年次教育科目（初ゼミ）",
    "health-sports": "健康・スポーツ科学",
    english: "英語",
    specialized: "専門科目",
  };

  // ページ遷移ハンドラー
  const handleNavigate = (page: Page, category?: CategorySlug) => {
    setCurrentPage(page);
    if (category) {
      setCurrentCategory(category);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              setCurrentPage("top");
            }}
          />
        );
      case "top":
        return (
          <TopPage
            isAuthenticated={isAuthenticated}
          />
        );
      case "category":
        return (
          <CategoryPage
            categoryName={categoryNames[currentCategory]}
            categoryId={currentCategory}
            onNavigateBack={() => setCurrentPage("top")}
            onCourseClick={(courseId) =>
              setCurrentPage("course-detail")
            }
          />
        );
      case "course-detail":
        // Generic course-detail route: fall back to top for now (no generic CourseDetailPage in src/pages)
        return (
          <TopPage isAuthenticated={isAuthenticated} />
        );
      case "timetable-examples":
        return (
          <TimetableExamplesPage
            onNavigateBack={() => setCurrentPage("top")}
          />
        );
      case "instructor-list":
        return (
          <InstructorListPage
            isAuthenticated={isAuthenticated}
            onInstructorClick={(instructorId) => {
              setSelectedInstructorId(instructorId);
              setCurrentPage("instructor-detail");
            }}
          />
        );
      case "instructor-detail":
        return (
          <InstructorDetailPage
            instructorId={selectedInstructorId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "english-instructor-list":
        return (
          <EnglishInstructorListPage
            isAuthenticated={isAuthenticated}
            onInstructorClick={(instructorId) => {
              setSelectedEnglishInstructorId(instructorId);
              setCurrentPage("english-instructor-detail");
            }}
          />
        );
      case "english-instructor-detail":
        return (
          <EnglishInstructorDetailPage
            instructorId={selectedEnglishInstructorId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "japanese-instructor-list":
        return (
          <JapaneseInstructorListPage
            isAuthenticated={isAuthenticated}
            onInstructorClick={(instructorId) => {
              setSelectedJapaneseInstructorId(instructorId);
              setCurrentPage("japanese-instructor-detail");
            }}
          />
        );
      case "japanese-instructor-detail":
        return (
          <JapaneseInstructorDetailPage
            instructorId={selectedJapaneseInstructorId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "foundation-courses-list":
        return (
          <FoundationCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedFoundationCourseId(courseId);
              setCurrentPage("foundation-course-detail");
            }}
          />
        );
      case "foundation-course-detail":
        return (
          <FoundationCourseDetailPage
            courseId={selectedFoundationCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "modern-system-courses-list":
        return (
          <ModernSystemCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedModernSystemCourseId(courseId);
              setCurrentPage("modern-system-course-detail");
            }}
          />
        );
      case "modern-system-course-detail":
        return (
          <ModernSystemCourseDetailPage
            courseId={selectedModernSystemCourseId}
            isAuthenticated={isAuthenticated}
            onNavigateToList={() => setCurrentPage("modern-system-courses-list")}
          />
        );
      case "general-education-list":
        return (
          <GeneralEducationListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedGeneralEducationId(courseId);
              setCurrentPage("general-education-detail");
            }}
            onNavigateBack={() => setCurrentPage("top")}
          />
        );
      case "general-education-detail":
        return (
          <GeneralEducationDetailPage
            courseId={selectedGeneralEducationId}
            isAuthenticated={isAuthenticated}
            onNavigateToList={() => setCurrentPage("general-education-list")}
          />
        );
      case "first-year-education-list":
        return (
          <FirstYearEducationListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedFirstYearEducationId(courseId);
              setCurrentPage("first-year-education-detail");
            }}
            onNavigateBack={() => setCurrentPage("top")}
          />
        );
      case "first-year-education-detail":
        return (
          <FirstYearEducationDetailPage
            courseId={selectedFirstYearEducationId}
            isAuthenticated={isAuthenticated}
            onNavigateToList={() => setCurrentPage("first-year-education-list")}
          />
        );
      case "commerce-courses-list":
        return (
          <CommerceCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedCommerceCourseId(courseId);
              setCurrentPage("commerce-course-detail");
            }}
          />
        );
      case "commerce-course-detail":
        return (
          <CommerceCourseDetailPage
            courseId={selectedCommerceCourseId}
            isAuthenticated={isAuthenticated}
            onNavigateToList={() => setCurrentPage("commerce-courses-list")}
          />
        );
      case "engineering-courses-list":
        return (
          <EngineeringCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedEngineeringCourseId(courseId);
              setCurrentPage("engineering-course-detail");
            }}
          />
        );
      case "engineering-course-detail":
        return (
          <EngineeringCourseDetailPage
            courseId={selectedEngineeringCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "law-courses-list":
        return (
          <LawCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedLawCourseId(courseId);
              setCurrentPage("law-course-detail");
            }}
          />
        );
      case "law-course-detail":
        return (
          <LawCourseDetailPage
            courseId={selectedLawCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "science-courses-list":
        return (
          <ScienceCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedScienceCourseId(courseId);
              setCurrentPage("science-course-detail");
            }}
          />
        );
      case "science-course-detail":
        return (
          <ScienceCourseDetailPage
            courseId={selectedScienceCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "literature-courses-list":
        return (
          <LiteratureCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedLiteratureCourseId(courseId);
              setCurrentPage("literature-course-detail");
            }}
          />
        );
      case "literature-course-detail":
        return (
          <LiteratureCourseDetailPage
            courseId={selectedLiteratureCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "medical-rehab-courses-list":
        return (
          <MedicalRehabCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedMedicalRehabCourseId(courseId);
              setCurrentPage("medical-rehab-course-detail");
            }}
          />
        );
      case "medical-rehab-course-detail":
        return (
          <MedicalRehabCourseDetailPage
            courseId={selectedMedicalRehabCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "nursing-courses-list":
        return (
          <NursingCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedNursingCourseId(courseId);
              setCurrentPage("nursing-course-detail");
            }}
          />
        );
      case "nursing-course-detail":
        return (
          <NursingCourseDetailPage
            courseId={selectedNursingCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "economics-courses-list":
        return (
          <EconomicsCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedEconomicsCourseId(courseId);
              setCurrentPage("economics-course-detail");
            }}
          />
        );
      case "economics-course-detail":
        return (
          <EconomicsCourseDetailPage
            courseId={selectedEconomicsCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "life-science-courses-list":
        return (
          <LifeScienceCoursesListPage
            isAuthenticated={isAuthenticated}
            onCourseClick={(courseId) => {
              setSelectedLifeScienceCourseId(courseId);
              setCurrentPage("life-science-course-detail");
            }}
          />
        );
      case "life-science-course-detail":
        return (
          <LifeScienceCourseDetailPage
            courseId={selectedLifeScienceCourseId}
            isAuthenticated={isAuthenticated}
          />
        );
      case "veterinary-no-data":
        return (
          <VeterinaryNoDataPage
            isAuthenticated={isAuthenticated}
          />
        );
      case "medical-no-data":
        return (
          <MedicalNoDataPage
            isAuthenticated={isAuthenticated}
          />
        );
      case "agriculture-no-data":
        return (
          <AgricultureNoDataPage
            isAuthenticated={isAuthenticated}
          />
        );
      default:
        return (
          <TopPage
            isAuthenticated={isAuthenticated}
          />
        );
    }
  };

  // グローバルなクリックハンドラー（aタグのクリックをインターセプト）
  const handleGlobalClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href) {
      // 外部リンクチェック（httpまたはhttpsで始まる絶対URLの場合）
      if (link.href.startsWith('http://') || link.href.startsWith('https://')) {
        // 同じホストでない場合は外部リンクとして扱う
        try {
          const url = new URL(link.href);
          if (url.hostname !== window.location.hostname) {
            return; // 外部リンクはそのまま
          }
        } catch (err) {
          return; // URL解析エラーの場合はそのまま
        }
      }
      
      // hrefが相対パスまたは同じホストの場合
      e.preventDefault();
      
      // hrefからパスを取得
      let path = link.getAttribute('href') || '';
      
      // パスに応じてページ遷移
      if (path === '/' || path === '') {
        setCurrentPage('top');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/timetable-examples') {
        setCurrentPage('timetable-examples');
      } else if (path === '/courses/general') {
        setCurrentCategory('general');
        setCurrentPage('category');
      } else if (path === '/courses/first-year-seminar') {
        setCurrentCategory('first-year-seminar');
        setCurrentPage('category');
      } else if (path === '/courses/foundation-list') {
        setCurrentPage('foundation-courses-list');
      } else if (path === '/instructors/information-literacy') {
        setCurrentPage('instructor-list');
      } else if (path === '/instructors/english-japanese') {
        setCurrentPage('japanese-instructor-list');
      } else if (path === '/instructors/english-native') {
        setCurrentPage('english-instructor-list');
      } else if (path === '/courses/specialized/modern-system') {
        setCurrentPage('modern-system-courses-list');
      } else if (path === '/courses/specialized/commerce') {
        setCurrentPage('commerce-courses-list');
      } else if (path === '/courses/specialized/engineering') {
        setCurrentPage('engineering-courses-list');
      } else if (path === '/courses/specialized/law') {
        setCurrentPage('law-courses-list');
      } else if (path === '/courses/specialized/science') {
        setCurrentPage('science-courses-list');
      } else if (path === '/courses/specialized/literature') {
        setCurrentPage('literature-courses-list');
      } else if (path === '/courses/specialized/medical-rehab') {
        setCurrentPage('medical-rehab-courses-list');
      } else if (path === '/courses/specialized/nursing') {
        setCurrentPage('nursing-courses-list');
      } else if (path === '/courses/specialized/economics') {
        setCurrentPage('economics-courses-list');
      } else if (path === '/courses/specialized/human-life') {
        setCurrentPage('life-science-courses-list');
      } else if (path === '/courses/specialized/veterinary') {
        setCurrentPage('veterinary-no-data');
      } else if (path === '/courses/specialized/medicine') {
        setCurrentPage('medical-no-data');
      } else if (path === '/courses/specialized/agriculture') {
        setCurrentPage('agriculture-no-data');
      } else if (path === '/courses/general-education') {
        setCurrentPage('general-education-list');
      } else if (path === '/courses/first-year-education') {
        setCurrentPage('first-year-education-list');
      }
    }
  };

  return (
    <div onClick={handleGlobalClick}>
      {renderPage()}
    </div>
  );
}