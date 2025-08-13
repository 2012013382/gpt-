import React, { useEffect, useMemo, useState } from "react";

// 猫超AI工作台 — 首页可交互原型
// • 单文件 React 组件，Tailwind 样式
// • 交互：功能芯片一键填充、模板卡片一键试用/预览流程、回车或点击“立即创建”打开右侧预览抽屉
// • 结构：H1+Sub、主输入框、功能芯片、CTA、模板区、三步流程、安全条

const chips = [
  {
    key: "issue",
    label: "发作业",
    hint:
      "给【KA商家群】下发“10月报名表”，字段：店铺名/预算/上新款式；本周五18:00截止；结果汇总到《报名.xlsx》",
  },
  {
    key: "collect",
    label: "收作业",
    hint:
      "向【区域经理】收集“销售周报”，字段：目标/完成率/问题；每周五19:00截止；未提交每4小时自动催办；汇总到《周报汇总.xlsx》",
  },
  {
    key: "price",
    label: "竞价追踪",
    hint:
      "监控【竞品清单】价格波动，字段：SKU/竞品价/截图；发现降价≥5%即通知到【运营群】；生成《竞价看板》",
  },
  {
    key: "stock",
    label: "智能盘货",
    hint:
      "根据GMV和转化率，自动生成“百亿补贴盘货任务”，给【品类负责人】；产出《盘货明细.xlsx》",
  },
  {
    key: "signup",
    label: "高效报名",
    hint:
      "创建“大促报名”任务：对象【商家池】；字段：店铺、品类、预算；DDL 本周三18:00；催办每6小时一次；汇总《报名总表.xlsx》",
  },
];

const templates = [
  {
    title: "收作业·日报",
    desc:
      "团队每日销售日报 → 自动汇总为 Excel，并在 18:30 推送汇总链接。",
    example:
      "向【销售团队】收集“每日销售日报”，字段：日期/渠道/GMV/问题；每天18:00截止；未交20:00再催；汇总到《销售日报.xlsx》",
  },
  {
    title: "发作业·报名",
    desc:
      "商家大促报名 → 自动催办 + 截止提醒 + 汇总下载。",
    example:
      "给【商家运营群】下发“大促报名表”，字段：店铺名/预算/上新款式；本周三18:00截止；未交每4小时自动催办；汇总到《双11报名.xlsx》",
  },
  {
    title: "智能盘货",
    desc:
      "批量生成补贴贴盘货任务 → 基于目标智能选品。",
    example:
      "根据【3C类目指标】自动生成“补贴盘货任务”，分配给【各品类负责人】；字段：SKU/预计销量/备货量；汇总到《盘货明细.xlsx》",
  },
  {
    title: "竞价追踪",
    desc:
      "实时监控竞品价格 → 异常提醒 + 看板。",
    example:
      "追踪【竞品清单】价格，每2小时拉取；当降价≥5%时，通知【运营群】并更新《竞价看板》",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "描述需求",
    text: "在输入框用中文说清对象、字段、时间/频率与产出。",
  },
  {
    step: "2",
    title: "确认配置",
    text: "系统生成流程与字段；可复用历史字段并设置催办/定时。",
  },
  {
    step: "3",
    title: "自动执行",
    text: "自动下发/收集/催办/汇总，产出 Excel 或看板，并可查看日志。",
  },
];

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function ArrowRight() {
  return <span className="mx-2 select-none">→</span>;
}

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[min(680px,92vw)] rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            关闭
          </button>
        </div>
        <div className="prose max-w-none text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, children, title }) {
  return (
    <div
      className={classNames(
        "fixed inset-y-0 right-0 z-30 w-[380px] transform bg-white shadow-2xl transition-transform",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="text-base font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            关闭
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 text-sm">{children}</div>
        <div className="border-t p-4">
          <button className="w-full rounded-xl bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700">
            确认创建任务
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideHint({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-20 max-w-[260px] rounded-2xl border bg-white p-3 text-xs shadow-xl">
      <div className="mb-2 font-semibold">引导：30秒体验</div>
      <p className="text-gray-600">
        点击任意“功能芯片”或“模板的一键试用”，我会把句式填到输入框并弹出流程预览。
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-gray-400">可稍后在右下角再次打开</span>
        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 font-medium text-gray-700 hover:bg-gray-100"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [value, setValue] = useState(
    "例如：每周五向 KA 商家下发“10月报名表”，未填自动催办，汇总到《报名.xlsx》"
  );
  const [focused, setFocused] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTpl, setModalTpl] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setDrawerOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const parsed = useMemo(() => parseInput(value), [value]);

  const applyChip = (hint) => {
    setValue(hint);
    setDrawerOpen(true);
  };

  const applyTemplate = (tpl) => {
    setValue(tpl.example);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50/40 text-gray-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-600 text-white">
              猫
            </div>
            <div className="text-sm font-semibold sm:text-base">猫超AI工作台</div>
          </div>
          <nav className="hidden gap-6 text-sm text-gray-600 sm:flex">
            <a className="hover:text-gray-900" href="#templates">
              模板库
            </a>
            <a className="hover:text-gray-900" href="#tasks">
              我的任务
            </a>
            <a className="hover:text-gray-900" href="#manual">
              使用手册
            </a>
          </nav>
        </div>
      </header>

      {/* 首屏区域 */}
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10">
        {/* 标题与副标题 */}
        <section className="max-w-3xl">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            一句话创建并自动执行你的运营任务
          </h1>
          <p className="mt-3 text-gray-600">
            用自然语言即可发/收作业、盘货、报名、竞价追踪；系统自动下发、收集、催办并汇总到表格。
          </p>
        </section>

        {/* 主输入框 */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr,380px]">
          <div>
            <div
              className={classNames(
                "rounded-2xl border bg-white p-4 shadow-sm transition",
                focused ? "ring-2 ring-green-500" : ""
              )}
            >
              <textarea
                className="min-h-[120px] w-full resize-y rounded-xl border-0 bg-transparent p-2 text-sm outline-none"
                value={value}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setValue(e.target.value)}
                placeholder="例如：每周五向 KA 商家下发“10月报名表”，未填自动催办，汇总到《报名.xlsx》"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => applyChip(c.hint)}
                    className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-green-700"
                >
                  立即创建
                </button>
                <a
                  href="#templates"
                  className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  浏览模板
                </a>
                <div className="ml-auto hidden items-center gap-2 text-xs text-gray-500 sm:flex">
                  <span>快捷键</span>
                  <kbd className="rounded-md border bg-gray-50 px-1.5 py-0.5">Ctrl</kbd>
                  +
                  <kbd className="rounded-md border bg-gray-50 px-1.5 py-0.5">Enter</kbd>
                  <span>预览创建</span>
                </div>
              </div>
            </div>

            {/* 快速开始模板 */}
            <section id="templates" className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">快速开始（模板）</h2>
                <a className="text-sm text-green-700 hover:underline" href="#">
                  查看全部模板
                </a>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.map((tpl) => (
                  <div
                    key={tpl.title}
                    className="group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-1 text-sm font-semibold">{tpl.title}</div>
                    <p className="mb-3 line-clamp-2 text-xs text-gray-600">{tpl.desc}</p>
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => applyTemplate(tpl)}
                        className="rounded-lg bg-green-600 px-3 py-1.5 font-semibold text-white hover:bg-green-700"
                      >
                        一键试用
                      </button>
                      <button
                        onClick={() => {
                          setModalTpl(tpl);
                          setModalOpen(true);
                        }}
                        className="rounded-lg border px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        预览流程
                      </button>
                      <button className="rounded-lg border px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50">
                        所需权限
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How it works */}
            <section className="mt-12">
              <h2 className="mb-3 text-lg font-bold">它如何工作（3步）</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {howItWorks.map((s, idx) => (
                  <div
                    key={s.step}
                    className="relative rounded-2xl border bg-white p-4 text-sm shadow-sm"
                  >
                    <div className="mb-1 text-xs font-semibold text-green-700">
                      步骤 {s.step}
                    </div>
                    <div className="mb-1 font-semibold">{s.title}</div>
                    <p className="text-gray-600">{s.text}</p>
                    {idx < howItWorks.length - 1 && (
                      <div className="absolute right-[-20px] top-1/2 hidden -translate-y-1/2 text-xl sm:block">
                        <ArrowRight />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 安全与权限 */}
            <section className="mt-8 rounded-2xl border bg-white p-4 text-sm text-gray-700">
              <span className="font-semibold">安全与权限：</span>基于企业账号授权，最小权限访问；所有操作留痕可回溯。
            </section>
          </div>

          {/* 右侧伴随抽屉占位（更好地暗示存在）*/}
          <aside className="hidden h-full lg:block" />
        </section>
      </main>

      {/* 预览抽屉 */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="任务预览与校对">
        <Section title="总体概览">
          <ul className="list-disc pl-5">
            <li>
              <span className="font-medium">识别到的任务类型：</span>
              <span className="text-gray-700">{parsed.type}</span>
            </li>
            <li>
              <span className="font-medium">输入摘要：</span>
              <span className="text-gray-700">{parsed.summary}</span>
            </li>
          </ul>
        </Section>
        <Section title="目标对象">
          <div className="rounded-xl border bg-gray-50 p-3 text-gray-700">
            {parsed.audience || "（将从输入中自动解析，也可稍后在对象选择器里选择人群/群组）"}
          </div>
        </Section>
        <Section title="字段/表头">
          <div className="flex flex-wrap gap-2">
            {(parsed.fields || ["店铺名", "预算", "上新款式"]).map((f) => (
              <span
                key={f}
                className="rounded-full border bg-white px-2.5 py-1 text-xs text-gray-700"
              >
                {f}
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">可在创建后继续编辑字段。</div>
        </Section>
        <Section title="时间与频率">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="截止时间" value={parsed.deadline || "周三 18:00（可改）"} />
            <Field label="周期" value={parsed.frequency || "一次性 / 每周"} />
            <Field label="催办策略" value={parsed.reminder || "未交每4小时自动催办"} />
            <Field label="时区" value={"系统默认（可改）"} />
          </div>
        </Section>
        <Section title="产出">
          <Field label="结果归档" value={parsed.output || "《报名.xlsx》 / 看板链接"} />
        </Section>
        <Section title="权限检查">
          <ul className="list-disc pl-5 text-gray-700">
            <li>访问群组/人员目录（读取）</li>
            <li>文件存储（写入 Excel）</li>
            <li>消息/通知发送（下发与催办）</li>
          </ul>
        </Section>
      </Drawer>

      {/* 引导 */}
      <GuideHint show={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* 模板预览弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTpl?.title || "预览流程"}
      >
        <ol className="list-decimal pl-5">
          <li className="mb-1">系统解析你的自然语言为结构化任务。</li>
          <li className="mb-1">展示对象、字段、时间与频率、产出与权限检查。</li>
          <li className="mb-1">确认后自动下发/收集/催办，并在结果页提供下载与看板。</li>
        </ol>
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <div className="mb-1 text-xs text-gray-500">示例句式</div>
          <div className="text-sm">{modalTpl?.example}</div>
        </div>
      </Modal>

      {/* 浮动按钮：重新打开引导 */}
      {!guideOpen && (
        <button
          onClick={() => setGuideOpen(true)}
          className="fixed bottom-6 right-6 z-10 rounded-full border bg-white px-4 py-2 text-xs shadow"
        >
          打开引导
        </button>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-semibold text-gray-500">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}

// 极简“解析器”：从用户句子中尝试提取关键信息（演示用，非真实NLP）
function parseInput(text) {
  const summary = text.slice(0, 50) + (text.length > 50 ? "…" : "");
  const parsed = {
    summary,
    type: /收集|收作业/.test(text)
      ? "收作业"
      : /下发|发作业/.test(text)
      ? "发作业"
      : /竞价|价格|竞品/.test(text)
      ? "竞价追踪"
      : /盘货|补贴/.test(text)
      ? "智能盘货"
      : /报名/.test(text)
      ? "高效报名"
      : "任务",
  };

  // 提取对象
  const objMatch = text.match(/【([^】]+)】/);
  if (objMatch) parsed.audience = objMatch[1];

  // 提取字段（中文逗号/斜杠分隔）
  const fieldMatch = text.match(/字段[:：]\s*([^；;。]+)/);
  if (fieldMatch) {
    parsed.fields = fieldMatch[1]
      .split(/[\/、，,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // 截止时间/频率/催办
  const dl = text.match(/(周[一二三四五六日天]\s*\d{1,2}:?\d{0,2}|\d{1,2}:\d{2}|截止[^；;。]+)/);
  if (dl) parsed.deadline = dl[0];
  const freq = text.match(/每[日天周月]|一次性|每天|每周|每月/);
  if (freq) parsed.frequency = freq[0];
  const remind = text.match(/催办[^；;。]+/);
  if (remind) parsed.reminder = remind[0];

  // 产出
  const out = text.match(/《([^》]+)》/);
  if (out) parsed.output = `《${out[1]}》`;

  return parsed;
}
