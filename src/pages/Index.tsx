import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const CHAT_URL = "https://functions.poehali.dev/d59ce824-176e-4130-adb1-acb7c3d49527";
const PROFILE_URL = "https://functions.poehali.dev/5a961ff0-70e4-4b17-a5cb-38592f618c6e";
const CROC_LOGO = "https://cdn.poehali.dev/projects/87da94b7-3efd-465d-9cca-89745a54aeb8/files/48fee405-2856-49e4-963a-df0f7ef43c5e.jpg";
const ME = 1;

type Page = "feed" | "messages" | "profile" | "search" | "groups" | "settings";

interface Conversation {
  id: number;
  other_user_id: number;
  name: string;
  avatar: string;
  title: string;
  last_message: string;
  last_time: string;
}

interface Message {
  id: number;
  sender_id: number;
  text: string;
  time: string;
  sender_name: string;
  sender_avatar: string;
}

function Ava({ s, size = "md" }: { s: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const sz = { xs: "w-7 h-7 text-[10px]", sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-16 h-16 text-lg" };
  return (
    <div className={`${sz[size]} rounded-full bg-[#2b5fad] text-white flex items-center justify-center font-semibold shrink-0 select-none`}>
      {s}
    </div>
  );
}

const POSTS = [
  { id: 1, author: "Мария Соколова", title: "Head of Design · Studio X", av: "МС", time: "2 ч. назад", text: "Запустили новый продукт по автоматизации HR-процессов. Шесть месяцев работы, 12 человек в команде. Если занимаетесь HR — напишите, покажу демо.", likes: 84, comments: 12 },
  { id: 2, author: "Дмитрий Волков", title: "CEO · GrowthLab", av: "ДВ", time: "5 ч. назад", text: "Три года назад начинали с 3 людьми и офисом 20 кв.м. Сегодня нас 85 человек в 4 странах. Главный урок: нанимай умнее себя и не мешай работать.", likes: 213, comments: 34 },
  { id: 3, author: "Елена Новикова", title: "CFO · FinBridge", av: "ЕН", time: "вчера", text: "Embedded finance меняет всё. Встраивание финансовых инструментов в нефинансовые продукты — это уже не тренд, а новая норма.", likes: 157, comments: 21 },
];

function FeedPage() {
  const [liked, setLiked] = useState<Record<number, boolean>>({ 2: true });
  const [counts, setCounts] = useState<Record<number, number>>({ 1: 84, 2: 213, 3: 157 });
  const toggle = (id: number) => {
    setLiked(p => {
      const v = !p[id];
      setCounts(c => ({ ...c, [id]: c[id] + (v ? 1 : -1) }));
      return { ...p, [id]: v };
    });
  };
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-[#1e2b3c] rounded-2xl p-4">
        <div className="flex gap-3 items-center">
          <Ava s="АП" />
          <button className="flex-1 text-left px-4 py-2.5 rounded-xl bg-[#152232] text-[#8aaccc] text-sm hover:bg-[#1a2d42] transition-colors">
            Поделитесь новостью...
          </button>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#253545]">
          {[["Image","Фото"],["Video","Видео"],["FileText","Статья"]].map(([ic,lb]) => (
            <button key={lb} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#6e8fac] text-xs font-medium hover:bg-[#253545] transition-colors">
              <Icon name={ic} size={13}/> {lb}
            </button>
          ))}
        </div>
      </div>
      {POSTS.map((p, i) => (
        <div key={p.id} className="bg-[#1e2b3c] rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
          <div className="flex gap-3 mb-3">
            <Ava s={p.av} />
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#e8f0fe]">{p.author}</p>
              <p className="text-xs text-[#6e8fac]">{p.title}</p>
              <p className="text-xs text-[#4a6680]">{p.time}</p>
            </div>
            <button className="text-[#4a6680] hover:text-[#8aaccc]"><Icon name="MoreHorizontal" size={16}/></button>
          </div>
          <p className="text-sm text-[#b8cfe8] leading-relaxed mb-4">{p.text}</p>
          <div className="flex items-center gap-4 pt-3 border-t border-[#253545]">
            <button onClick={() => toggle(p.id)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all ${liked[p.id] ? "text-[#4d9de0]" : "text-[#6e8fac] hover:text-[#4d9de0]"}`}>
              <Icon name="ThumbsUp" size={15}/> {counts[p.id]}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-[#6e8fac] hover:text-[#4d9de0] font-medium transition-colors">
              <Icon name="MessageSquare" size={15}/> {p.comments}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-[#6e8fac] hover:text-[#4d9de0] font-medium transition-colors ml-auto">
              <Icon name="Share2" size={15}/> Поделиться
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${CHAT_URL}?action=conversations`, { headers: { "x-user-id": String(ME) } })
      .then(r => r.json()).then(setConvs).catch(() => {});
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    fetch(`${CHAT_URL}?action=messages&conv_id=${active.id}`, { headers: { "x-user-id": String(ME) } })
      .then(r => r.json()).then(data => { setMsgs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || !active) return;
    setInput("");
    const optimistic: Message = {
      id: Date.now(), sender_id: ME, text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      sender_name: "Вы", sender_avatar: "АП",
    };
    setMsgs(p => [...p, optimistic]);
    try {
      const r = await fetch(`${CHAT_URL}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": String(ME) },
        body: JSON.stringify({ conv_id: active.id, text }),
      });
      const raw = await r.json();
      const saved = typeof raw === "string" ? JSON.parse(raw) : raw;
      setMsgs(p => p.map(m => m.id === optimistic.id ? { ...optimistic, id: saved.id ?? optimistic.id } : m));
      setConvs(p => p.map(c => c.id === active.id ? { ...c, last_message: text, last_time: saved.time ?? optimistic.time } : c));
    } catch (e) {
      console.error("send error", e);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  return (
    <div className="bg-[#17212b] rounded-2xl overflow-hidden animate-fade-in border border-[#253545]" style={{ height: "calc(100vh - 130px)", minHeight: 460 }}>
      <div className="flex h-full">
        <div className="w-64 border-r border-[#253545] flex flex-col bg-[#17212b] shrink-0">
          <div className="p-3 border-b border-[#253545]">
            <div className="relative">
              <Icon name="Search" size={13} className="absolute left-2.5 top-2.5 text-[#4a6680]"/>
              <input className="w-full pl-7 pr-2 py-1.5 text-xs rounded-xl bg-[#1e2b3c] border border-[#253545] text-[#b8cfe8] placeholder-[#4a6680] focus:outline-none focus:border-[#4d9de0] transition-colors" placeholder="Поиск"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convs.length === 0 && (
              <div className="flex items-center justify-center h-20 text-[#4a6680] text-xs">Загрузка...</div>
            )}
            {convs.map(conv => (
              <button key={conv.id} onClick={() => setActive(conv)}
                className={`w-full flex items-center gap-2.5 px-3 py-3 text-left transition-colors ${active?.id === conv.id ? "bg-[#2b5fad]/30" : "hover:bg-[#1e2b3c]"}`}>
                <Ava s={conv.avatar} size="sm"/>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-[#e8f0fe] truncate">{conv.name}</p>
                    <p className="text-[10px] text-[#4a6680] shrink-0 ml-1">{conv.last_time}</p>
                  </div>
                  <p className="text-[11px] text-[#6e8fac] truncate">{conv.last_message}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1822]">
          {active ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#253545] bg-[#17212b]">
                <Ava s={active.avatar} size="sm"/>
                <div>
                  <p className="font-semibold text-sm text-[#e8f0fe]">{active.name}</p>
                  <p className="text-xs text-[#4d9de0]">{active.title}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="text-[#4a6680] hover:text-[#8aaccc] transition-colors"><Icon name="Phone" size={17}/></button>
                  <button className="text-[#4a6680] hover:text-[#8aaccc] transition-colors"><Icon name="Search" size={17}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {loading && <div className="text-center text-[#4a6680] text-xs py-4">Загрузка...</div>}
                {msgs.map((m, i) => {
                  const isMine = m.sender_id === ME;
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${Math.min(i * 0.02, 0.25)}s` }}>
                      {!isMine && <Ava s={m.sender_avatar} size="xs"/>}
                      <div className={`mx-2 max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isMine ? "bg-[#2b5fad] text-white rounded-br-sm" : "bg-[#1e2b3c] text-[#b8cfe8] rounded-bl-sm"}`}>
                        {m.text}
                        <span className={`block text-[10px] mt-0.5 text-right ${isMine ? "text-[#a8c4e8]" : "text-[#4a6680]"}`}>{m.time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              <div className="px-3 py-3 border-t border-[#253545] bg-[#17212b] flex items-end gap-2">
                <button className="text-[#4a6680] hover:text-[#4d9de0] transition-colors mb-1.5"><Icon name="Paperclip" size={18}/></button>
                <textarea
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#1e2b3c] border border-[#253545] text-sm text-[#e8f0fe] placeholder-[#4a6680] focus:outline-none focus:border-[#4d9de0] transition-colors resize-none"
                  placeholder="Написать сообщение..." style={{ maxHeight: 120 }}
                />
                <button onClick={sendMsg}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${input.trim() ? "bg-[#2b5fad] hover:bg-[#3a6fc0] text-white" : "bg-[#1e2b3c] text-[#4a6680]"}`}>
                  <Icon name="Send" size={16}/>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#4a6680] gap-3">
              <div className="w-16 h-16 rounded-full bg-[#1e2b3c] flex items-center justify-center">
                <Icon name="MessageSquare" size={28}/>
              </div>
              <p className="text-sm">Выберите диалог</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const exp = [
    { company: "TechCorp", role: "Senior Product Manager", period: "2022 — н.в.", desc: "Команда 8 человек, рост MAU +40%, 3 запуска." },
    { company: "StartupForce", role: "Product Manager", period: "2019 — 2022", desc: "Построил процессы с нуля, вывод продукта за 6 месяцев." },
    { company: "Digital Agency", role: "Junior PM", period: "2017 — 2019", desc: "E-commerce и fintech проекты." },
  ];
  const recs = [
    { from: "Мария Соколова", ft: "Head of Design · Studio X", av: "МС", date: "Март 2026", text: "Один из лучших продактов, с которыми работала. Слышит команду и двигает продукт в нужном направлении." },
    { from: "Дмитрий Волков", ft: "CEO · GrowthLab", av: "ДВ", date: "Январь 2026", text: "Глубокое понимание рынка и отличные навыки коммуникации со стейкхолдерами." },
  ];
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-[#1e2b3c] rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#1a3a6e] to-[#2b5fad]"/>
        <div className="px-5 pb-5">
          <div className="flex items-end gap-3 -mt-8 mb-3">
            <div className="w-16 h-16 rounded-full bg-[#2b5fad] text-white flex items-center justify-center text-lg font-bold border-4 border-[#1e2b3c]">АП</div>
            <div className="mb-1 flex-1">
              <h2 className="text-base font-bold text-[#e8f0fe]">Александр Петров</h2>
              <p className="text-xs text-[#6e8fac]">Senior Product Manager · TechCorp</p>
            </div>
            <button className="mb-1 px-3 py-1.5 rounded-xl border border-[#2b5fad] text-[#4d9de0] text-xs font-medium hover:bg-[#2b5fad]/20 transition-colors">Редактировать</button>
          </div>
          <div className="flex gap-5 text-sm">
            <div><p className="font-bold text-[#e8f0fe]">487</p><p className="text-[#4a6680] text-xs">контактов</p></div>
            <div><p className="font-bold text-[#e8f0fe]">1 240</p><p className="text-[#4a6680] text-xs">просмотров</p></div>
          </div>
        </div>
      </div>
      <div className="bg-[#1e2b3c] rounded-2xl p-4">
        <h3 className="font-semibold text-[#e8f0fe] text-sm mb-2">О себе</h3>
        <p className="text-sm text-[#8aaccc] leading-relaxed">Более 8 лет в управлении цифровыми продуктами. B2B SaaS, маркетплейсы, финтех. Выводил продукты на рынки России, Казахстана и Германии.</p>
      </div>
      <div className="bg-[#1e2b3c] rounded-2xl p-4">
        <h3 className="font-semibold text-[#e8f0fe] text-sm mb-4">Опыт работы</h3>
        <div className="space-y-4">
          {exp.map((e, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#17212b] flex items-center justify-center shrink-0">
                <Icon name="Briefcase" size={14} className="text-[#4d9de0]"/>
              </div>
              <div>
                <p className="font-semibold text-sm text-[#e8f0fe]">{e.role}</p>
                <p className="text-xs text-[#6e8fac]">{e.company} · {e.period}</p>
                <p className="text-xs text-[#4a6680] mt-0.5">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#1e2b3c] rounded-2xl p-4">
        <h3 className="font-semibold text-[#e8f0fe] text-sm mb-4">Рекомендации ({recs.length})</h3>
        <div className="space-y-3">
          {recs.map((r, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#17212b] border border-[#253545]">
              <div className="flex gap-2 mb-2">
                <Ava s={r.av} size="xs"/>
                <div>
                  <p className="font-semibold text-xs text-[#e8f0fe]">{r.from}</p>
                  <p className="text-[11px] text-[#4a6680]">{r.ft} · {r.date}</p>
                </div>
              </div>
              <p className="text-xs text-[#8aaccc] leading-relaxed italic">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PEOPLE = [
  { name: "Игорь Смирнов", title: "CTO · CloudBase", av: "ИС", mutual: 12 },
  { name: "Анна Морозова", title: "Marketing Director · BrandX", av: "АМ", mutual: 8 },
  { name: "Павел Козлов", title: "Data Scientist · AI Labs", av: "ПК", mutual: 5 },
  { name: "Ольга Фёдорова", title: "UX Lead · DesignHub", av: "ОФ", mutual: 19 },
  { name: "Николай Попов", title: "Founder · StartupForce", av: "НП", mutual: 3 },
  { name: "Светлана Кузнецова", title: "HR Director · PeopleCo", av: "СК", mutual: 7 },
];

function SearchPage() {
  const [q, setQ] = useState("");
  const list = PEOPLE.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3.5 top-3 text-[#4a6680]"/>
        <input value={q} onChange={e => setQ(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e2b3c] border border-[#253545] text-sm text-[#e8f0fe] placeholder-[#4a6680] focus:outline-none focus:border-[#4d9de0] transition-colors"
          placeholder="Поиск по людям, компаниям, должностям..."/>
      </div>
      {list.map((p, i) => (
        <div key={i} className="bg-[#1e2b3c] rounded-2xl p-4 flex items-center gap-3 animate-fade-in hover:bg-[#253545] transition-colors" style={{ animationDelay: `${i * 0.04}s` }}>
          <Ava s={p.av}/>
          <div className="flex-1">
            <p className="font-semibold text-sm text-[#e8f0fe]">{p.name}</p>
            <p className="text-xs text-[#6e8fac]">{p.title}</p>
            <p className="text-xs text-[#4a6680]">{p.mutual} общих контакта</p>
          </div>
          <button className="px-3 py-1.5 rounded-xl border border-[#2b5fad] text-[#4d9de0] text-xs font-medium hover:bg-[#2b5fad]/20 transition-colors">
            + Добавить
          </button>
        </div>
      ))}
    </div>
  );
}

const GROUPS = [
  { id: 1, name: "Product Management RU", members: 12400, av: "PM", cat: "Управление продуктом", joined: true },
  { id: 2, name: "Стартапы и инвестиции", members: 8750, av: "СИ", cat: "Предпринимательство", joined: true },
  { id: 3, name: "Data & Analytics Club", members: 5320, av: "DA", cat: "Аналитика данных", joined: false },
  { id: 4, name: "UX/UI Professionals", members: 9100, av: "UX", cat: "Дизайн", joined: false },
  { id: 5, name: "FinTech Network", members: 6800, av: "FT", cat: "Финтех", joined: true },
];

function GroupsPage() {
  const [joined, setJoined] = useState<Record<number, boolean>>(
    Object.fromEntries(GROUPS.map(g => [g.id, g.joined]))
  );
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="mb-1">
        <h2 className="text-base font-bold text-[#e8f0fe]">Сообщества</h2>
        <p className="text-xs text-[#4a6680]">Присоединяйтесь к группам по интересам</p>
      </div>
      {GROUPS.map((g, i) => (
        <div key={g.id} className="bg-[#1e2b3c] rounded-2xl p-4 flex items-center gap-3 animate-fade-in hover:bg-[#253545] transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a3a6e] to-[#2b5fad] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {g.av}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-[#e8f0fe]">{g.name}</p>
            <p className="text-xs text-[#6e8fac]">{g.cat}</p>
            <p className="text-xs text-[#4a6680]">{g.members.toLocaleString("ru")} участников</p>
          </div>
          <button
            onClick={() => setJoined(p => ({ ...p, [g.id]: !p[g.id] }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              joined[g.id]
                ? "bg-[#253545] text-[#6e8fac] hover:bg-red-900/30 hover:text-red-400"
                : "border border-[#2b5fad] text-[#4d9de0] hover:bg-[#2b5fad]/20"
            }`}>
            {joined[g.id] ? "В группе" : "Вступить"}
          </button>
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${on ? "bg-[#2b5fad]" : "bg-[#253545]"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${on ? "left-5" : "left-0.5"}`}/>
    </button>
  );
}

function FieldEditor({ label, value, onSave, placeholder, prefix, hint }: {
  label: string; value: string; onSave: (v: string) => Promise<string | null>;
  placeholder?: string; prefix?: string; hint?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [current, setCurrent] = useState(value);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const save = async () => {
    if (val.trim() === current) { setEditing(false); return; }
    setLoading(true); setErr("");
    const error = await onSave(val.trim());
    setLoading(false);
    if (error) { setErr(error); }
    else { setCurrent(val.trim()); setEditing(false); setOk(true); setTimeout(() => setOk(false), 2000); }
  };

  return (
    <div className="px-4 py-3.5 border-b border-[#253545] last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#4a6680] font-medium">{label}</span>
        {ok && <span className="text-xs text-green-400">✓ Сохранено</span>}
        {!editing && <button onClick={() => { setEditing(true); setVal(current); }} className="text-xs text-[#4d9de0] hover:text-[#7ab8f0]">Изменить</button>}
      </div>
      {editing ? (
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center bg-[#17212b] border border-[#4d9de0] rounded-xl overflow-hidden">
            {prefix && <span className="pl-3 text-[#4a6680] text-sm select-none">{prefix}</span>}
            <input autoFocus value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#e8f0fe] placeholder-[#4a6680] focus:outline-none"
              placeholder={placeholder}/>
          </div>
          <button onClick={save} disabled={loading}
            className="px-3 py-2 rounded-xl bg-[#2b5fad] text-white text-xs font-medium hover:bg-[#3a6fc0] disabled:opacity-50 transition-colors">
            {loading ? "..." : "OK"}
          </button>
          <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-xl bg-[#253545] text-[#6e8fac] text-xs hover:bg-[#2e3f52] transition-colors">✕</button>
        </div>
      ) : (
        <p className="text-sm text-[#b8cfe8]">{prefix}{current || <span className="text-[#4a6680] italic">не указано</span>}</p>
      )}
      {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
      {hint && !editing && <p className="text-[11px] text-[#4a6680] mt-0.5">{hint}</p>}
    </div>
  );
}

function AvatarUploader({ current, initials, onChange }: { current: string; initials: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      const mime = file.type;
      try {
        const r = await fetch(`${PROFILE_URL}?action=update_avatar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": String(ME) },
          body: JSON.stringify({ image_base64: base64, mime }),
        });
        const raw = await r.json();
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (data.avatar_url) onChange(data.avatar_url);
      } catch (ex) { console.error(ex); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {current
          ? <img src={current} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-[#253545]"/>
          : <div className="w-20 h-20 rounded-full bg-[#2b5fad] text-white flex items-center justify-center text-2xl font-bold border-4 border-[#253545]">{initials}</div>
        }
        <button onClick={() => fileRef.current?.click()}
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#2b5fad] flex items-center justify-center border-2 border-[#17212b] hover:bg-[#3a6fc0] transition-colors">
          {loading ? <span className="text-white text-[10px]">...</span> : <Icon name="Camera" size={12} className="text-white"/>}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]); }}/>
      <button onClick={() => fileRef.current?.click()} className="text-xs text-[#4d9de0] hover:text-[#7ab8f0]">Сменить фото</button>
    </div>
  );
}

function SettingsPage() {
  const [t, setT] = useState<Record<string, boolean>>({
    notif_msg: true, notif_requests: true, notif_groups: false, notif_likes: true,
    priv_profile: false, priv_contacts: true, priv_search: true,
    sec_2fa: false, ui_compact: false, ui_animations: true,
  });
  const tog = (k: string) => setT(p => ({ ...p, [k]: !p[k] }));

  const [profile, setProfile] = useState({ display_name: "Александр Петров", username: "alex", email: "", avatar_initials: "АП", avatar_url: "" });

  useEffect(() => {
    fetch(`${PROFILE_URL}?action=get`, { headers: { "x-user-id": String(ME) } })
      .then(r => r.json())
      .then(raw => { const d = typeof raw === "string" ? JSON.parse(raw) : raw; setProfile(d); })
      .catch(() => {});
  }, []);

  const apiCall = async (action: string, body: object): Promise<string | null> => {
    try {
      const r = await fetch(`${PROFILE_URL}?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": String(ME) },
        body: JSON.stringify(body),
      });
      const raw = await r.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!r.ok || data.error) return data.error || "Ошибка";
      return null;
    } catch { return "Ошибка соединения"; }
  };

  const sections = [
    { title: "Уведомления", items: [
      { k: "notif_msg", label: "Личные сообщения", icon: "MessageSquare" },
      { k: "notif_requests", label: "Запросы контакта", icon: "UserPlus" },
      { k: "notif_groups", label: "Активность в группах", icon: "Users" },
      { k: "notif_likes", label: "Лайки и комментарии", icon: "ThumbsUp" },
    ]},
    { title: "Приватность", items: [
      { k: "priv_profile", label: "Скрыть профиль от незнакомых", icon: "EyeOff" },
      { k: "priv_contacts", label: "Показывать мои контакты", icon: "Users" },
      { k: "priv_search", label: "Найти меня по имени", icon: "Search" },
    ]},
    { title: "Безопасность", items: [
      { k: "sec_2fa", label: "Двухфакторная аутентификация", icon: "Shield" },
    ]},
    { title: "Внешний вид", items: [
      { k: "ui_compact", label: "Компактный режим", icon: "AlignJustify" },
      { k: "ui_animations", label: "Анимации интерфейса", icon: "Zap" },
    ]},
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Profile card с загрузкой фото */}
      <div className="bg-[#1e2b3c] rounded-2xl p-5 flex flex-col items-center gap-3">
        <AvatarUploader
          current={profile.avatar_url}
          initials={profile.avatar_initials}
          onChange={url => setProfile(p => ({ ...p, avatar_url: url }))}
        />
        <div className="text-center">
          <p className="font-bold text-[#e8f0fe]">{profile.display_name}</p>
          <p className="text-xs text-[#6e8fac]">@{profile.username}</p>
        </div>
      </div>

      {/* Редактирование профиля */}
      <div className="bg-[#1e2b3c] rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#253545]">
          <p className="text-[11px] font-semibold text-[#4a6680] uppercase tracking-wider">Личные данные</p>
        </div>
        <FieldEditor
          label="Отображаемое имя" value={profile.display_name} placeholder="Имя Фамилия"
          onSave={async (v) => {
            const err = await apiCall("update_name", { display_name: v });
            if (!err) setProfile(p => ({ ...p, display_name: v, avatar_initials: v.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) }));
            return err;
          }}
        />
        <FieldEditor
          label="Юзернейм" value={profile.username} placeholder="username" prefix="@"
          hint="Только латиница, цифры и _"
          onSave={async (v) => {
            const clean = v.startsWith("@") ? v.slice(1) : v;
            const err = await apiCall("update_username", { username: clean });
            if (!err) setProfile(p => ({ ...p, username: clean }));
            return err;
          }}
        />
        <FieldEditor
          label="Email" value={profile.email} placeholder="you@example.com"
          hint="Для восстановления доступа"
          onSave={async (v) => {
            const err = await apiCall("update_email", { email: v });
            if (!err) setProfile(p => ({ ...p, email: v }));
            return err;
          }}
        />
      </div>

      {/* Переключатели */}
      {sections.map((sec, si) => (
        <div key={si} className="bg-[#1e2b3c] rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#253545]">
            <p className="text-[11px] font-semibold text-[#4a6680] uppercase tracking-wider">{sec.title}</p>
          </div>
          {sec.items.map((item, ii) => (
            <div key={ii} className="flex items-center gap-3 px-4 py-3.5 border-b border-[#253545] last:border-0 hover:bg-[#253545] transition-colors">
              <Icon name={item.icon} size={16} className="text-[#4d9de0] shrink-0"/>
              <span className="flex-1 text-sm text-[#b8cfe8]">{item.label}</span>
              <Toggle on={t[item.k]} onClick={() => tog(item.k)}/>
            </div>
          ))}
        </div>
      ))}

      <div className="bg-[#1e2b3c] rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#253545]">
          <p className="text-[11px] font-semibold text-[#4a6680] uppercase tracking-wider">Аккаунт</p>
        </div>
        <button className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-[#b8cfe8] hover:bg-[#253545] transition-colors border-b border-[#253545]">
          Сменить пароль <Icon name="ChevronRight" size={15} className="text-[#4a6680]"/>
        </button>
        <button className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors">
          Выйти из аккаунта <Icon name="LogOut" size={15}/>
        </button>
      </div>
    </div>
  );
}

const NAV = [
  { icon: "Home", label: "Главная", page: "feed" as Page },
  { icon: "MessageSquare", label: "Сообщения", page: "messages" as Page },
  { icon: "User", label: "Профиль", page: "profile" as Page },
  { icon: "Search", label: "Поиск", page: "search" as Page },
  { icon: "Users", label: "Группы", page: "groups" as Page },
  { icon: "Settings", label: "Настройки", page: "settings" as Page },
];

const Index = () => {
  const [page, setPage] = useState<Page>("feed");
  return (
    <div className="min-h-screen bg-[#0d1822] font-ibm">
      <header className="sticky top-0 z-50 bg-[#17212b] border-b border-[#253545]">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <div className="flex items-center gap-2">
            <img src={CROC_LOGO} alt="Crack" className="w-8 h-8 rounded-xl object-cover shadow"/>
            <span className="font-bold text-white text-lg tracking-tight">Crack</span>
          </div>

          <nav className="hidden md:flex items-center">
            {NAV.map(item => (
              <button key={item.page} onClick={() => setPage(item.page)}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-all duration-200 border-b-2 ${
                  page === item.page ? "text-white border-[#4d9de0]" : "text-[#4a6680] border-transparent hover:text-[#8aaccc]"
                }`}>
                <Icon name={item.icon} size={18}/>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 flex items-center justify-center text-[#4a6680] hover:text-[#8aaccc] transition-colors">
              <Icon name="Bell" size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4d9de0]"/>
            </button>
            <div onClick={() => setPage("profile")}
              className="w-8 h-8 rounded-full bg-[#2b5fad] text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-[#3a6fc0] transition-colors">
              АП
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-20 md:pb-4">
        {page === "feed" && <FeedPage />}
        {page === "messages" && <MessagesPage />}
        {page === "profile" && <ProfilePage />}
        {page === "search" && <SearchPage />}
        {page === "groups" && <GroupsPage />}
        {page === "settings" && <SettingsPage />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#17212b] border-t border-[#253545] flex justify-around px-2 py-1.5 z-50">
        {NAV.map(item => (
          <button key={item.page} onClick={() => setPage(item.page)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
              page === item.page ? "text-[#4d9de0]" : "text-[#4a6680]"
            }`}>
            <Icon name={item.icon} size={20}/>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Index;