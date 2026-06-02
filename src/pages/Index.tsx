import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "feed" | "profile" | "messages" | "search" | "groups" | "settings";

const currentUser = {
  name: "Александр Петров",
  title: "Senior Product Manager · TechCorp",
  avatar: "АП",
  connections: 487,
  views: 1240,
};

const posts = [
  {
    id: 1,
    author: "Мария Соколова",
    authorTitle: "Head of Design · Studio X",
    avatar: "МС",
    time: "2 часа назад",
    content:
      "Рад поделиться: наша команда запустила новый продукт по автоматизации HR-процессов. Шесть месяцев работы, 12 человек в команде — и вот результат. Если вы занимаетесь HR или ищете способы оптимизации — напишите, покажу демо.",
    likes: 84,
    comments: 12,
  },
  {
    id: 2,
    author: "Дмитрий Волков",
    authorTitle: "CEO · GrowthLab",
    avatar: "ДВ",
    time: "5 часов назад",
    content:
      "Три года назад мы начинали с командой из 3 человек и офисом на 20 кв. м. Сегодня нас 85 человек в 4 странах. Главный урок: нанимай людей умнее себя и не мешай им работать.",
    likes: 213,
    comments: 34,
  },
  {
    id: 3,
    author: "Елена Новикова",
    authorTitle: "CFO · FinBridge",
    avatar: "ЕН",
    time: "вчера",
    content:
      "Поговорили с коллегами о трендах финтех-рынка в 2026 году. Главный вывод: встраивание финансовых инструментов в нефинансовые продукты — это уже не тренд, это новая норма. Embedded finance меняет всё.",
    likes: 157,
    comments: 21,
  },
];

const people = [
  { name: "Игорь Смирнов", title: "CTO · CloudBase", avatar: "ИС", mutual: 12 },
  { name: "Анна Морозова", title: "Marketing Director · BrandX", avatar: "АМ", mutual: 8 },
  { name: "Павел Козлов", title: "Data Scientist · AI Labs", avatar: "ПК", mutual: 5 },
  { name: "Ольга Фёдорова", title: "UX Lead · DesignHub", avatar: "ОФ", mutual: 19 },
  { name: "Николай Попов", title: "Founder · StartupForce", avatar: "НП", mutual: 3 },
  { name: "Светлана Кузнецова", title: "HR Director · PeopleCo", avatar: "СК", mutual: 7 },
];

const messages = [
  { id: 1, name: "Мария Соколова", avatar: "МС", preview: "Спасибо за подключение! Буду рада...", time: "10:32", unread: 2 },
  { id: 2, name: "Дмитрий Волков", avatar: "ДВ", preview: "Договорились на среду в 14:00?", time: "09:15", unread: 0 },
  { id: 3, name: "Игорь Смирнов", avatar: "ИС", preview: "Вот ссылка на документацию API", time: "Вчера", unread: 0 },
  { id: 4, name: "Анна Морозова", avatar: "АМ", preview: "Посмотрела ваш профиль — интересно!", time: "Вчера", unread: 1 },
];

const groups = [
  { id: 1, name: "Product Management RU", members: 12400, avatar: "PM", category: "Управление продуктом" },
  { id: 2, name: "Стартапы и инвестиции", members: 8750, avatar: "СИ", category: "Предпринимательство" },
  { id: 3, name: "Data & Analytics Club", members: 5320, avatar: "DA", category: "Аналитика данных" },
  { id: 4, name: "UX/UI Professionals", members: 9100, avatar: "UX", category: "Дизайн" },
  { id: 5, name: "FinTech Network", members: 6800, avatar: "FT", category: "Финансовые технологии" },
];

const recommendations = [
  {
    from: "Мария Соколова",
    fromTitle: "Head of Design · Studio X",
    avatar: "МС",
    text: "Александр — один из лучших продакт-менеджеров, с которыми я работала. Умеет слышать команду и двигать продукт в нужном направлении.",
    date: "Март 2026",
  },
  {
    from: "Дмитрий Волков",
    fromTitle: "CEO · GrowthLab",
    avatar: "ДВ",
    text: "Работали вместе над запуском нового направления. Александр показал глубокое понимание рынка и отличные навыки коммуникации с разными стейкхолдерами.",
    date: "Январь 2026",
  },
];

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full bg-[hsl(211,80%,36%)] text-white flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

function FeedPage() {
  const [liked, setLiked] = useState<Record<number, boolean>>({ 2: true });
  const [counts, setCounts] = useState<Record<number, number>>({ 1: 84, 2: 213, 3: 157 });

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const val = !prev[id];
      setCounts((c) => ({ ...c, [id]: c[id] + (val ? 1 : -1) }));
      return { ...prev, [id]: val };
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-xl border border-[hsl(214,20%,88%)] p-4 shadow-sm">
        <div className="flex gap-3 items-center">
          <Avatar initials="АП" />
          <button className="flex-1 text-left px-4 py-2.5 rounded-full border border-[hsl(214,20%,88%)] text-[hsl(215,16%,50%)] text-sm hover:bg-[hsl(210,20%,97%)] transition-colors">
            Поделитесь новостью или мыслью...
          </button>
        </div>
        <div className="flex gap-1 mt-3 pt-3 border-t border-[hsl(214,20%,88%)]">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[hsl(215,16%,50%)] text-xs font-medium hover:bg-[hsl(210,20%,97%)] transition-colors">
            <Icon name="Image" size={14} /> Фото
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[hsl(215,16%,50%)] text-xs font-medium hover:bg-[hsl(210,20%,97%)] transition-colors">
            <Icon name="Video" size={14} /> Видео
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[hsl(215,16%,50%)] text-xs font-medium hover:bg-[hsl(210,20%,97%)] transition-colors">
            <Icon name="FileText" size={14} /> Статья
          </button>
        </div>
      </div>

      {posts.map((post, i) => (
        <div key={post.id} className="bg-white rounded-xl border border-[hsl(214,20%,88%)] p-5 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="flex gap-3 mb-3">
            <Avatar initials={post.avatar} />
            <div className="flex-1">
              <p className="font-semibold text-sm text-[hsl(215,30%,12%)]">{post.author}</p>
              <p className="text-xs text-[hsl(215,16%,50%)]">{post.authorTitle}</p>
              <p className="text-xs text-[hsl(215,16%,60%)]">{post.time}</p>
            </div>
            <button className="text-[hsl(215,16%,60%)] hover:text-[hsl(215,30%,20%)]">
              <Icon name="MoreHorizontal" size={16} />
            </button>
          </div>
          <p className="text-sm text-[hsl(215,25%,20%)] leading-relaxed mb-4">{post.content}</p>
          <div className="flex items-center gap-4 pt-3 border-t border-[hsl(214,20%,92%)]">
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${liked[post.id] ? "text-[hsl(211,80%,36%)]" : "text-[hsl(215,16%,50%)] hover:text-[hsl(211,80%,36%)]"}`}
            >
              <Icon name="ThumbsUp" size={16} />
              {counts[post.id]}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-[hsl(215,16%,50%)] hover:text-[hsl(211,80%,36%)] font-medium transition-colors">
              <Icon name="MessageSquare" size={16} />
              {post.comments}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-[hsl(215,16%,50%)] hover:text-[hsl(211,80%,36%)] font-medium transition-colors ml-auto">
              <Icon name="Share2" size={16} />
              Поделиться
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-xl border border-[hsl(214,20%,88%)] overflow-hidden shadow-sm">
        <div className="h-28 bg-gradient-to-r from-[hsl(211,80%,28%)] to-[hsl(207,90%,54%)]" />
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10 mb-3">
            <div className="w-20 h-20 rounded-full bg-[hsl(211,80%,36%)] text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow">
              АП
            </div>
            <div className="mb-1 flex-1">
              <h2 className="text-lg font-bold text-[hsl(215,30%,12%)]">{currentUser.name}</h2>
              <p className="text-sm text-[hsl(215,16%,50%)]">{currentUser.title}</p>
            </div>
            <button className="mb-1 px-4 py-1.5 rounded-full border border-[hsl(211,80%,36%)] text-[hsl(211,80%,36%)] text-sm font-medium hover:bg-[hsl(211,80%,96%)] transition-colors">
              Редактировать
            </button>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="font-bold text-[hsl(215,30%,12%)]">{currentUser.connections}</p>
              <p className="text-[hsl(215,16%,50%)] text-xs">контактов</p>
            </div>
            <div>
              <p className="font-bold text-[hsl(215,30%,12%)]">{currentUser.views}</p>
              <p className="text-[hsl(215,16%,50%)] text-xs">просмотров профиля</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(214,20%,88%)] p-5 shadow-sm">
        <h3 className="font-semibold text-[hsl(215,30%,12%)] mb-2">О себе</h3>
        <p className="text-sm text-[hsl(215,25%,25%)] leading-relaxed">
          Более 8 лет в управлении цифровыми продуктами. Специализируюсь на B2B SaaS, маркетплейсах и финтех-решениях. Выводил продукты на рынки России, Казахстана и Германии.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(214,20%,88%)] p-5 shadow-sm">
        <h3 className="font-semibold text-[hsl(215,30%,12%)] mb-4">Опыт работы</h3>
        <div className="space-y-4">
          {[
            { company: "TechCorp", role: "Senior Product Manager", period: "2022 — наст. время", desc: "Руководство продуктовой командой из 8 человек, запуск 3 новых фичей, рост MAU на 40%." },
            { company: "StartupForce", role: "Product Manager", period: "2019 — 2022", desc: "Построил процессы с нуля, вывел продукт на рынок за 6 месяцев." },
            { company: "Digital Agency", role: "Junior PM", period: "2017 — 2019", desc: "Работа с клиентскими проектами в e-commerce и fintech." },
          ].map((exp, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(210,20%,93%)] flex items-center justify-center shrink-0">
                <Icon name="Briefcase" size={16} className="text-[hsl(211,80%,36%)]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[hsl(215,30%,12%)]">{exp.role}</p>
                <p className="text-xs text-[hsl(215,16%,50%)]">{exp.company} · {exp.period}</p>
                <p className="text-xs text-[hsl(215,25%,35%)] mt-0.5">{exp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(214,20%,88%)] p-5 shadow-sm">
        <h3 className="font-semibold text-[hsl(215,30%,12%)] mb-4">Рекомендации ({recommendations.length})</h3>
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-lg bg-[hsl(210,20%,97%)] border border-[hsl(214,20%,90%)]">
              <div className="flex gap-3 mb-2">
                <Avatar initials={rec.avatar} size="sm" />
                <div>
                  <p className="font-semibold text-sm text-[hsl(215,30%,12%)]">{rec.from}</p>
                  <p className="text-xs text-[hsl(215,16%,50%)]">{rec.fromTitle} · {rec.date}</p>
                </div>
              </div>
              <p className="text-sm text-[hsl(215,25%,25%)] leading-relaxed italic">"{rec.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessagesPage() {
  const [active, setActive] = useState<number>(1);
  const [input, setInput] = useState("");
  const activeMsg = messages.find((m) => m.id === active);

  return (
    <div className="bg-white rounded-xl border border-[hsl(214,20%,88%)] shadow-sm overflow-hidden animate-fade-in" style={{ height: "calc(100vh - 140px)", minHeight: 420 }}>
      <div className="flex h-full">
        <div className="w-60 border-r border-[hsl(214,20%,88%)] flex flex-col shrink-0">
          <div className="p-3 border-b border-[hsl(214,20%,88%)]">
            <div className="relative">
              <Icon name="Search" size={13} className="absolute left-2.5 top-2.5 text-[hsl(215,16%,60%)]" />
              <input className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-[hsl(210,20%,96%)] border border-[hsl(214,20%,88%)] focus:outline-none" placeholder="Поиск" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <button key={msg.id} onClick={() => setActive(msg.id)}
                className={`w-full flex items-center gap-2.5 p-3 text-left transition-colors ${active === msg.id ? "bg-[hsl(211,80%,96%)]" : "hover:bg-[hsl(210,20%,97%)]"}`}>
                <Avatar initials={msg.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-[hsl(215,30%,12%)] truncate">{msg.name}</p>
                    <p className="text-[10px] text-[hsl(215,16%,60%)] shrink-0 ml-1">{msg.time}</p>
                  </div>
                  <p className="text-[11px] text-[hsl(215,16%,50%)] truncate">{msg.preview}</p>
                </div>
                {msg.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[hsl(211,80%,36%)] text-white text-[10px] flex items-center justify-center shrink-0">{msg.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 p-4 border-b border-[hsl(214,20%,88%)]">
            <Avatar initials={activeMsg?.avatar || ""} size="sm" />
            <div>
              <p className="font-semibold text-sm text-[hsl(215,30%,12%)]">{activeMsg?.name}</p>
              <p className="text-xs text-green-500">Онлайн</p>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end gap-3">
            <div className="flex justify-end">
              <div className="max-w-xs px-3 py-2 rounded-2xl rounded-br-sm bg-[hsl(211,80%,36%)] text-white text-sm">
                Добрый день! Хотел обсудить возможное сотрудничество.
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <Avatar initials={activeMsg?.avatar || ""} size="sm" />
              <div className="max-w-xs px-3 py-2 rounded-2xl rounded-bl-sm bg-[hsl(210,20%,95%)] text-[hsl(215,30%,12%)] text-sm">
                {activeMsg?.preview}
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-[hsl(214,20%,88%)] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-full border border-[hsl(214,20%,88%)] text-sm focus:outline-none focus:border-[hsl(211,80%,36%)] transition-colors"
              placeholder="Написать сообщение..."
            />
            <button className="w-9 h-9 rounded-full bg-[hsl(211,80%,36%)] text-white flex items-center justify-center hover:bg-[hsl(211,80%,30%)] transition-colors shrink-0">
              <Icon name="Send" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered = people.filter(
    (p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="relative">
        <Icon name="Search" size={18} className="absolute left-3.5 top-3 text-[hsl(215,16%,60%)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(214,20%,88%)] bg-white text-sm focus:outline-none focus:border-[hsl(211,80%,36%)] shadow-sm transition-colors"
          placeholder="Поиск по людям, компаниям, должностям..."
        />
      </div>
      <div className="space-y-2">
        {filtered.map((person, i) => (
          <div key={i} className="bg-white rounded-xl border border-[hsl(214,20%,88%)] p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <Avatar initials={person.avatar} />
            <div className="flex-1">
              <p className="font-semibold text-sm text-[hsl(215,30%,12%)]">{person.name}</p>
              <p className="text-xs text-[hsl(215,16%,50%)]">{person.title}</p>
              <p className="text-xs text-[hsl(215,16%,60%)]">{person.mutual} общих контакта</p>
            </div>
            <button className="px-4 py-1.5 rounded-full border border-[hsl(211,80%,36%)] text-[hsl(211,80%,36%)] text-xs font-medium hover:bg-[hsl(211,80%,96%)] transition-colors">
              Подключиться
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupsPage() {
  const [joined, setJoined] = useState<Record<number, boolean>>({ 1: true, 2: true, 5: true });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-[hsl(215,30%,12%)]">Профессиональные сообщества</h2>
        <p className="text-sm text-[hsl(215,16%,50%)]">Присоединяйтесь к группам по интересам</p>
      </div>
      <div className="space-y-3">
        {groups.map((group, i) => (
          <div key={group.id} className="bg-white rounded-xl border border-[hsl(214,20%,88%)] p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(211,80%,36%)] to-[hsl(207,90%,54%)] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {group.avatar}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[hsl(215,30%,12%)]">{group.name}</p>
              <p className="text-xs text-[hsl(215,16%,50%)]">{group.category}</p>
              <p className="text-xs text-[hsl(215,16%,60%)]">{group.members.toLocaleString("ru")} участников</p>
            </div>
            <button
              onClick={() => setJoined((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                joined[group.id]
                  ? "bg-[hsl(210,20%,93%)] text-[hsl(215,16%,40%)] hover:bg-red-50 hover:text-red-500"
                  : "border border-[hsl(211,80%,36%)] text-[hsl(211,80%,36%)] hover:bg-[hsl(211,80%,96%)]"
              }`}
            >
              {joined[group.id] ? "Вы в группе" : "Вступить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const sections = [
    { title: "Профиль", items: ["Личная информация", "Опыт работы", "Навыки и достижения", "Контактная информация"] },
    { title: "Приватность", items: ["Кто видит мой профиль", "Видимость контактов", "Настройки поиска"] },
    { title: "Уведомления", items: ["Сообщения", "Запросы контакта", "Активность в группах", "Комментарии и лайки"] },
    { title: "Аккаунт", items: ["Смена пароля", "Двухфакторная аутентификация", "Удаление аккаунта"] },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-base font-bold text-[hsl(215,30%,12%)]">Настройки аккаунта</h2>
      {sections.map((group, gi) => (
        <div key={gi} className="bg-white rounded-xl border border-[hsl(214,20%,88%)] overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-[hsl(214,20%,92%)] bg-[hsl(210,20%,98%)]">
            <p className="text-xs font-semibold text-[hsl(215,16%,50%)] uppercase tracking-wider">{group.title}</p>
          </div>
          {group.items.map((item, ii) => (
            <button key={ii} className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-[hsl(215,30%,12%)] hover:bg-[hsl(210,20%,97%)] transition-colors border-b border-[hsl(214,20%,93%)] last:border-0">
              {item}
              <Icon name="ChevronRight" size={16} className="text-[hsl(215,16%,60%)]" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

const navItems: { icon: string; label: string; page: Page }[] = [
  { icon: "Home", label: "Главная", page: "feed" },
  { icon: "MessageSquare", label: "Сообщения", page: "messages" },
  { icon: "User", label: "Профиль", page: "profile" },
  { icon: "Search", label: "Поиск", page: "search" },
  { icon: "Users", label: "Группы", page: "groups" },
  { icon: "Settings", label: "Настройки", page: "settings" },
];

const Index = () => {
  const [page, setPage] = useState<Page>("feed");

  return (
    <div className="min-h-screen bg-[hsl(210,20%,97%)] font-ibm">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-[hsl(215,35%,10%)] shadow-lg">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[hsl(207,90%,54%)] flex items-center justify-center">
              <Icon name="Network" size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">ProNet</span>
          </div>

          <nav className="hidden md:flex items-center">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-all duration-200 border-b-2 ${
                  page === item.page
                    ? "text-white border-[hsl(207,90%,54%)]"
                    : "text-[hsl(215,16%,65%)] border-transparent hover:text-white"
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 flex items-center justify-center text-[hsl(215,16%,65%)] hover:text-white transition-colors">
              <Icon name="Bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[hsl(211,80%,36%)] text-white flex items-center justify-center text-xs font-bold cursor-pointer" onClick={() => setPage("profile")}>
              АП
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-20 md:pb-5">
        {page === "feed" && <FeedPage />}
        {page === "profile" && <ProfilePage />}
        {page === "messages" && <MessagesPage />}
        {page === "search" && <SearchPage />}
        {page === "groups" && <GroupsPage />}
        {page === "settings" && <SettingsPage />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[hsl(214,20%,88%)] flex justify-around px-2 py-1 z-50">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 ${
              page === item.page ? "text-[hsl(211,80%,36%)]" : "text-[hsl(215,16%,50%)] hover:text-[hsl(215,30%,20%)]"
            }`}
          >
            <Icon name={item.icon} size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Index;
