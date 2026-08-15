package seed

import (
	"log"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

type courseSeed struct {
	categorySlug string
	title        string
	courseCode   string
	instructors  []string
	term         string
	modality     string
	note         string
	meetings     []meetingSeed
	reviews      []reviewSeed
}

type meetingSeed struct {
	day       int16
	period    int16
	classroom string
}

type reviewSeed struct {
	reviewType models.UserReviewType
	comment    string
}

type seededOffering struct {
	offering models.Offering
	reviews  []reviewSeed
}

// RunSeeds inserts baseline data for development and production smoke checks.
// The inserts are idempotent so the command can be run multiple times.
func RunSeeds() error {
	log.Println("Starting database seeding...")

	seedSiteSettings()

	categories := seedCategories()
	if len(categories) == 0 {
		return nil
	}

	offerings := seedCourses(categories)
	users := seedUsers()
	seedTimetables(users)
	seedReviews(offerings, users)

	log.Println("Database seeding completed successfully")
	return nil
}

func seedSiteSettings() {
	settings := models.SiteSettings{
		SettingsID:          1,
		DefaultAcademicYear: 2026,
		DefaultTerm:         "spring",
		UpdatedAt:           time.Now(),
	}
	if err := config.DB.
		Where(models.SiteSettings{SettingsID: settings.SettingsID}).
		FirstOrCreate(&settings).Error; err != nil {
		log.Printf("Error seeding site settings: %v", err)
		return
	}
	log.Println("✓ Site settings seeded")
}

func seedCategories() []models.Category {
	categories := []models.Category{
		{Slug: "general-education", Name: "総合教養科目（般教）", SortOrder: 1},
		{Slug: "first-year-education", Name: "初年次教育科目（初ゼミ）", SortOrder: 2},
		{Slug: "foundation-list", Name: "基礎教育科目", SortOrder: 3},
		{Slug: "information-literacy", Name: "情報リテラシー科目", SortOrder: 4},
		{Slug: "english-japanese", Name: "外国語科目(英語必修)-日本語教師", SortOrder: 5},
		{Slug: "english-native", Name: "外国語科目(英語必修)-英語教師", SortOrder: 6},
		{Slug: "modern-system", Name: "現代システム科学域", SortOrder: 7},
		{Slug: "science", Name: "理学部", SortOrder: 8},
		{Slug: "engineering", Name: "工学部", SortOrder: 9},
		{Slug: "agriculture", Name: "農学部", SortOrder: 10},
		{Slug: "veterinary", Name: "獣医学部", SortOrder: 11},
		{Slug: "medicine", Name: "医学部医学科", SortOrder: 12},
		{Slug: "medical-rehab", Name: "医学部リハビリテーション学科", SortOrder: 13},
		{Slug: "nursing", Name: "看護学部", SortOrder: 14},
		{Slug: "human-life", Name: "生活科学部", SortOrder: 15},
		{Slug: "literature", Name: "文学部", SortOrder: 16},
		{Slug: "law", Name: "法学部", SortOrder: 17},
		{Slug: "economics", Name: "経済学部", SortOrder: 18},
		{Slug: "commerce", Name: "商学部", SortOrder: 19},
	}

	for i := range categories {
		if err := config.DB.
			Where(models.Category{Slug: categories[i].Slug}).
			Assign(models.Category{Name: categories[i].Name, SortOrder: categories[i].SortOrder}).
			FirstOrCreate(&categories[i]).Error; err != nil {
			log.Printf("Error seeding category %s: %v", categories[i].Slug, err)
			return nil
		}
	}

	log.Printf("✓ Categories seeded: %d records", len(categories))
	return categories
}

func seedCourses(categories []models.Category) []seededOffering {
	categoryBySlug := make(map[string]models.Category, len(categories))
	for _, category := range categories {
		categoryBySlug[category.Slug] = category
	}

	var offerings []seededOffering
	for _, data := range courseSeeds() {
		category, ok := categoryBySlug[data.categorySlug]
		if !ok {
			log.Printf("Skipping course %s: category %s not found", data.title, data.categorySlug)
			continue
		}

		subject := models.Subject{
			CategoryID: category.CategoryID,
			Title:      data.title,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		if err := config.DB.
			Where(models.Subject{CategoryID: subject.CategoryID, Title: subject.Title}).
			Assign(models.Subject{UpdatedAt: time.Now()}).
			FirstOrCreate(&subject).Error; err != nil {
			log.Printf("Error seeding subject %s: %v", data.title, err)
			continue
		}

		offering := models.Offering{
			SubjectID:       subject.SubjectID,
			AcademicYear:    2026,
			Term:            data.term,
			Modality:        data.modality,
			CourseCode:      data.courseCode,
			Note:            data.note,
			InstructorNames: data.instructors,
			CreatedAt:       time.Now(),
		}
		if err := config.DB.
			Where("subject_id = ? AND academic_year = ? AND term = ? AND course_code = ?",
				offering.SubjectID, offering.AcademicYear, offering.Term, offering.CourseCode).
			Assign(models.Offering{
				Modality:        offering.Modality,
				Note:            offering.Note,
				InstructorNames: offering.InstructorNames,
			}).
			FirstOrCreate(&offering).Error; err != nil {
			log.Printf("Error seeding offering %s: %v", data.courseCode, err)
			continue
		}

		seedMeetings(offering.OfferingID, data.meetings)
		offerings = append(offerings, seededOffering{offering: offering, reviews: data.reviews})
	}

	log.Printf("✓ Courses seeded: %d offerings", len(offerings))
	return offerings
}

func seedMeetings(offeringID int64, meetings []meetingSeed) {
	for _, data := range meetings {
		meeting := models.Meeting{
			OfferingID: offeringID,
			Day:        data.day,
			Period:     data.period,
			Classroom:  data.classroom,
		}
		if err := config.DB.
			Where(models.Meeting{OfferingID: meeting.OfferingID, Day: meeting.Day, Period: meeting.Period}).
			Assign(models.Meeting{Classroom: meeting.Classroom}).
			FirstOrCreate(&meeting).Error; err != nil {
			log.Printf("Error seeding meeting for offering %d: %v", offeringID, err)
		}
	}
}

func seedUsers() []models.User {
	var users []models.User

	userData := []struct {
		displayName string
		authUID     string
	}{
		{"大阪 太郎", "seed_user_taro"},
		{"杉本 花子", "seed_user_hanako"},
		{"中百舌鳥 次郎", "seed_user_jiro"},
		{"羽曳野 三郎", "seed_user_saburo"},
	}

	for _, data := range userData {
		user := models.User{
			DisplayName: data.displayName,
			AuthUID:     data.authUID,
			CreatedAt:   time.Now(),
		}
		if err := config.DB.
			Where(models.User{AuthUID: user.AuthUID}).
			Assign(models.User{DisplayName: user.DisplayName}).
			FirstOrCreate(&user).Error; err != nil {
			log.Printf("Error seeding user %s: %v", user.DisplayName, err)
			continue
		}
		users = append(users, user)
	}

	log.Printf("✓ Users seeded: %d records", len(users))
	return users
}

func seedTimetables(users []models.User) {
	if len(users) == 0 {
		return
	}

	timetableData := []struct {
		userID   int64
		title    string
		year     int16
		term     string
		isPublic bool
	}{
		{users[0].UserID, "2026年前期 時間割", 2026, "spring", true},
		{users[1].UserID, "履修候補", 2026, "spring", false},
		{users[2].UserID, "般教中心", 2026, "spring", true},
	}

	for _, data := range timetableData {
		timetable := models.Timetable{
			UserID:    data.userID,
			Title:     data.title,
			Year:      data.year,
			Term:      data.term,
			IsPublic:  data.isPublic,
			CreatedAt: time.Now(),
		}
		if err := config.DB.
			Where(models.Timetable{UserID: timetable.UserID, Year: timetable.Year, Term: timetable.Term}).
			Assign(models.Timetable{Title: timetable.Title, IsPublic: timetable.IsPublic}).
			FirstOrCreate(&timetable).Error; err != nil {
			log.Printf("Error seeding timetable %s: %v", timetable.Title, err)
		}
	}

	log.Println("✓ Timetables seeded")
}

func seedReviews(offerings []seededOffering, users []models.User) {
	if len(offerings) == 0 || len(users) == 0 {
		return
	}

	for i, item := range offerings {
		for _, data := range item.reviews {
			userID := users[i%len(users)].UserID
			review := models.UserReview{
				UserID:     &userID,
				OfferingID: item.offering.OfferingID,
				Comment:    data.comment,
				Type:       data.reviewType,
				Status:     models.UserReviewStatusApproved,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			if err := config.DB.
				Where("offering_id = ? AND type = ? AND comment = ?",
					review.OfferingID, review.Type, review.Comment).
				Assign(models.UserReview{
					UserID:    review.UserID,
					Status:    review.Status,
					UpdatedAt: time.Now(),
				}).
				FirstOrCreate(&review).Error; err != nil {
				log.Printf("Error seeding review for offering %d: %v", item.offering.OfferingID, err)
			}
		}
	}

	log.Println("✓ Reviews seeded")
}

func courseSeeds() []courseSeed {
	return []courseSeed{
		{
			categorySlug: "general-education",
			title:        "心理学入門",
			courseCode:   "GE-PSY-101",
			instructors:  []string{"山田 一郎"},
			term:         "spring",
			modality:     "onsite",
			note:         "人気講義",
			meetings:     []meetingSeed{{day: 1, period: 2, classroom: "杉本キャンパス 1号館101"}},
			reviews: []reviewSeed{
				{reviewType: models.UserReviewTypePros, comment: "身近な例が多く、初めてでも内容を追いやすいです。"},
				{reviewType: models.UserReviewTypeCons, comment: "毎回の小レポートは少し時間がかかります。"},
			},
		},
		{
			categorySlug: "general-education",
			title:        "現代社会論",
			courseCode:   "GE-SOC-102",
			instructors:  []string{"佐藤 美咲"},
			term:         "spring",
			modality:     "hybrid",
			note:         "抽選あり",
			meetings:     []meetingSeed{{day: 2, period: 3, classroom: "杉本キャンパス 学術情報総合センター"}},
			reviews: []reviewSeed{
				{reviewType: models.UserReviewTypePros, comment: "ニュースと授業内容がつながっていて理解しやすいです。"},
				{reviewType: models.UserReviewTypeOthers, comment: "発表回があるので早めにテーマを決めると楽です。"},
			},
		},
		{
			categorySlug: "general-education",
			title:        "データサイエンス基礎",
			courseCode:   "GE-DS-103",
			instructors:  []string{"田中 健"},
			term:         "spring",
			modality:     "onsite",
			note:         "PC持参",
			meetings:     []meetingSeed{{day: 4, period: 4, classroom: "中百舌鳥キャンパス B3棟202"}},
			reviews: []reviewSeed{
				{reviewType: models.UserReviewTypePros, comment: "演習中心で、Pythonを触ったことがなくても進められます。"},
				{reviewType: models.UserReviewTypeCons, comment: "課題提出の締切管理は少しシビアです。"},
			},
		},
		{categorySlug: "first-year-education", title: "初年次ゼミナールA", courseCode: "FY-SEM-101", instructors: []string{"高橋 亮"}, term: "spring", modality: "onsite", note: "少人数", reviews: compactReviews("少人数で質問しやすい雰囲気です。", "発表準備は早めに始めた方が安心です。")},
		{categorySlug: "first-year-education", title: "大学での学び入門", courseCode: "FY-STU-102", instructors: []string{"伊藤 香織"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("レポートの書き方を具体的に学べます。", "グループワークの比重がやや高いです。")},
		{categorySlug: "foundation-list", title: "線形代数1", courseCode: "FN-MAT-101", instructors: []string{"宮地 秀樹"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("板書が整理されていて復習しやすいです。", "証明問題に慣れていないと序盤は重めです。")},
		{categorySlug: "foundation-list", title: "微積分1A", courseCode: "FN-MAT-102", instructors: []string{"中野 智"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("例題が多く、試験対策の方向性が見えやすいです。", "演習量は多いので毎週の復習が必要です。")},
		{categorySlug: "information-literacy", title: "情報リテラシー", courseCode: "IL-ICT-101", instructors: []string{"林 直子"}, term: "spring", modality: "online", note: "オンデマンド併用", reviews: compactReviews("資料が丁寧で自分のペースで進めやすいです。", "提出形式の指定を見落としやすいです。")},
		{categorySlug: "information-literacy", title: "データ活用基礎", courseCode: "IL-DAT-102", instructors: []string{"森 大輔"}, term: "spring", modality: "hybrid", note: "", reviews: compactReviews("表計算から統計の入口までつながって学べます。", "演習ファイルの管理に少し慣れが必要です。")},
		{categorySlug: "english-japanese", title: "English Reading A", courseCode: "EJ-RDG-101", instructors: []string{"伊狩 弘"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("英文の読み方を文法から確認してくれます。", "単語テストが定期的にあります。")},
		{categorySlug: "english-japanese", title: "English Writing A", courseCode: "EJ-WRT-102", instructors: []string{"山本 由紀"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("添削が具体的で次の文章に反映しやすいです。", "毎週短い作文課題があります。")},
		{categorySlug: "english-native", title: "Communication English A", courseCode: "EN-COM-101", instructors: []string{"James Pollock"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("会話の機会が多く、英語を話す抵抗が減ります。", "出席と参加姿勢がかなり見られます。")},
		{categorySlug: "english-native", title: "Academic English", courseCode: "EN-ACD-102", instructors: []string{"Maria Ocon"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("プレゼンと要約の練習が実践的です。", "人前で話す回数は多めです。")},
		{categorySlug: "modern-system", title: "公共政策論", courseCode: "MS-POL-201", instructors: []string{"山口 真"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("制度の背景まで説明があり、社会課題の見方が広がります。", "扱う資料が多いので事前確認が必要です。")},
		{categorySlug: "modern-system", title: "データサイエンス実践", courseCode: "MS-DAT-202", instructors: []string{"金子 周平"}, term: "spring", modality: "hybrid", note: "演習あり", reviews: compactReviews("実データを使うので分析の流れが掴みやすいです。", "PC環境の準備で少し詰まりやすいです。")},
		{categorySlug: "science", title: "解析学1", courseCode: "SC-MAT-201", instructors: []string{"伊師 英之"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("定義から丁寧に進むので基礎を固めやすいです。", "抽象的な内容が増えると復習時間が必要です。")},
		{categorySlug: "science", title: "有機化学1", courseCode: "SC-CHE-202", instructors: []string{"小嵜 正敏"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("反応機構を図で説明してくれるので理解しやすいです。", "暗記だけでは試験が厳しいです。")},
		{categorySlug: "engineering", title: "制御工学1", courseCode: "EG-CTL-201", instructors: []string{"原 尚之"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("数式と実例の対応が分かりやすいです。", "ラプラス変換の復習をしておくと楽です。")},
		{categorySlug: "engineering", title: "通信システム", courseCode: "EG-COM-202", instructors: []string{"山田 誠"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("図解が多く、通信の全体像を掴めます。", "専門用語が多いので予習が効きます。")},
		{categorySlug: "agriculture", title: "植物生産科学", courseCode: "AG-PLT-201", instructors: []string{"田中 光"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("作物の具体例が多く、農学らしさを感じられます。", "レポートは観察内容を細かく書く必要があります。")},
		{categorySlug: "agriculture", title: "食品化学", courseCode: "AG-FOD-202", instructors: []string{"佐藤 亜紀"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("食品成分と実生活が結びついて面白いです。", "化学の基礎を忘れていると少し大変です。")},
		{categorySlug: "veterinary", title: "獣医解剖学", courseCode: "VT-ANA-201", instructors: []string{"鈴木 達也"}, term: "spring", modality: "onsite", note: "実習あり", reviews: compactReviews("構造を立体的に説明してくれるので理解しやすいです。", "覚える量はかなり多いです。")},
		{categorySlug: "veterinary", title: "動物感染症学", courseCode: "VT-INF-202", instructors: []string{"中村 恵"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("症例ベースで説明されるので記憶に残ります。", "病原体名の整理に時間がかかります。")},
		{categorySlug: "medicine", title: "解剖学", courseCode: "MD-ANA-201", instructors: []string{"井上 淳"}, term: "spring", modality: "onsite", note: "実習あり", reviews: compactReviews("要点が明確で、試験範囲の見通しを立てやすいです。", "予習なしで実習に出ると追いつきにくいです。")},
		{categorySlug: "medicine", title: "生理学", courseCode: "MD-PHY-202", instructors: []string{"木村 由美"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("各器官のつながりを意識して説明してくれます。", "細かいメカニズムの暗記は必要です。")},
		{categorySlug: "medical-rehab", title: "形態機能学1", courseCode: "MR-FNC-201", instructors: []string{"宮井 一郎"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("臨床との関連を交えて説明されるので納得しやすいです。", "専門用語は早めに整理すると良いです。")},
		{categorySlug: "medical-rehab", title: "リハビリテーション概論", courseCode: "MR-REH-202", instructors: []string{"澤田 智子"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("職種ごとの役割が具体的に分かります。", "グループ発表の準備時間が必要です。")},
		{categorySlug: "nursing", title: "解剖生理学", courseCode: "NS-APH-201", instructors: []string{"澤井 信夫"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("看護で使う観点から説明されるので実践につながります。", "毎回の確認テストで復習が必要です。")},
		{categorySlug: "nursing", title: "基礎看護学", courseCode: "NS-FND-202", instructors: []string{"田村 和子"}, term: "spring", modality: "onsite", note: "演習あり", reviews: compactReviews("演習で手順を確認できるので理解が深まります。", "持ち物と事前課題の確認が重要です。")},
		{categorySlug: "human-life", title: "栄養学概論", courseCode: "HL-NUT-201", instructors: []string{"石川 由美"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("食生活と結びつけて学べるので興味を持ちやすいです。", "計算問題が少し出ます。")},
		{categorySlug: "human-life", title: "居住環境学", courseCode: "HL-HOU-202", instructors: []string{"小林 直樹"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("住環境の事例紹介が多く、イメージしやすいです。", "図面や資料の読み取りに慣れが必要です。")},
		{categorySlug: "literature", title: "民俗学", courseCode: "LT-FLK-201", instructors: []string{"大野 寿子"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("身近な文化を別の角度から見られて面白いです。", "レポートでは具体例を集める必要があります。")},
		{categorySlug: "literature", title: "教育史", courseCode: "LT-EDH-202", instructors: []string{"弘田 陽介"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("時代背景と制度の変化が整理されていて分かりやすいです。", "文献を読む量はやや多めです。")},
		{categorySlug: "law", title: "法学入門", courseCode: "LW-LAW-201", instructors: []string{"仲 正", "守矢 健一", "金澤 真理"}, term: "spring", modality: "onsite", note: "複数教員", reviews: compactReviews("複数分野を広く見られるので入口として良いです。", "扱う範囲が広く、試験前にまとめ直す必要があります。")},
		{categorySlug: "law", title: "民法第3部", courseCode: "LW-CIV-202", instructors: []string{"藤井 俊二"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("条文と事例の対応を丁寧に扱います。", "判例の整理に時間がかかります。")},
		{categorySlug: "economics", title: "計量経済学1", courseCode: "EC-ECO-201", instructors: []string{"狩野 裕"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("統計の復習から入るので入りやすいです。", "数式処理に慣れていないと課題が重く感じます。")},
		{categorySlug: "economics", title: "金融経済論", courseCode: "EC-FIN-202", instructors: []string{"辻 幸民"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("金融市場のニュースと講義がつながります。", "専門用語の整理が必要です。")},
		{categorySlug: "commerce", title: "会計基礎論", courseCode: "CM-ACC-201", instructors: []string{"浅野 敬志"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("簿記未経験でも基礎から確認できます。", "演習を溜めると後半が大変です。")},
		{categorySlug: "commerce", title: "地域経済論", courseCode: "CM-REG-202", instructors: []string{"松永 桂子"}, term: "spring", modality: "onsite", note: "", reviews: compactReviews("大阪の事例が多く、地域経済を具体的に理解できます。", "レポートで統計資料を読む必要があります。")},
	}
}

func compactReviews(pros string, cons string) []reviewSeed {
	return []reviewSeed{
		{reviewType: models.UserReviewTypePros, comment: pros},
		{reviewType: models.UserReviewTypeCons, comment: cons},
	}
}
