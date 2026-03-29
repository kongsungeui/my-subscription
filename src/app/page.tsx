import {
  loginAction,
  logoutAction,
  updateSettingsAction,
} from "@/app/actions";
import { SubscriptionList } from "@/app/dashboard-client";
import { isAuthenticated } from "@/lib/auth";
import {
  formatDisplayAmount,
  formatKrw,
  getDashboardData,
  getSettings,
  getSummary,
} from "@/lib/data";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}

function Input({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  min,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  min?: number;
  step?: number | string;
}) {
  return (
    <label className="space-y-2 text-sm text-[var(--muted)]">
      <span>{label}</span>
      <input
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
        defaultValue={defaultValue}
        min={min}
        name={name}
        required={required}
        step={step}
        type={type}
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-2 text-sm text-[var(--muted)]">
      <span>{label}</span>
      <select
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}


function LoginView({ error }: { error?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-strong)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(241,117,76,0.25),_transparent_45%),linear-gradient(135deg,var(--hero-start),var(--hero-end))] px-8 py-12 text-[var(--hero-foreground)] sm:px-12">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--hero-muted)]">
            Personal Finance
          </p>
          <h1 className="mt-8 max-w-md font-serif text-5xl leading-tight sm:text-6xl">
            내 구독 비용을 월간과 연간으로 한눈에.
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-[var(--hero-muted)]">
            넷플릭스, ChatGPT, 각종 SaaS 비용을 원화 환산 기준으로 정리합니다.
            데이터는 SQLite에 저장되고, 테마는 라이트와 다크를 수동 전환할 수
            있게 설계했습니다.
          </p>
        </section>

        <section className="px-8 py-12 sm:px-12">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
            Sign In
          </p>
          <h2 className="mt-6 font-serif text-4xl text-[var(--foreground)]">
            개인 대시보드 로그인
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            하드코딩된 관리자 계정으로만 진입합니다.
          </p>

          <form action={loginAction} className="mt-10 space-y-5">
            <Input label="아이디" name="username" required />
            <Input label="패스워드" name="password" required type="password" />
            {error === "invalid_login" ? (
              <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                아이디 또는 패스워드가 일치하지 않습니다.
              </p>
            ) : null}
            <button className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90">
              로그인
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const authenticated = await isAuthenticated();
  const params = await searchParams;

  if (!authenticated) {
    return <LoginView error={params.error} />;
  }

  const [settings, subscriptions, summary] = await Promise.all([
    getSettings(),
    getDashboardData(),
    getSummary(),
  ]);

  const serializedSubscriptions = subscriptions.map((s) => ({
    id: s.id,
    name: s.name,
    amountMinor: s.amountMinor,
    currency: s.currency as "KRW" | "USD",
    billingCycle: s.billingCycle as "MONTHLY" | "YEARLY",
    memo: s.memo,
    isActive: s.isActive,
    amountDisplayFull: formatDisplayAmount(s.amountMinor, s.currency),
    amountDisplayRaw: s.currency === "USD" ? String(s.amountMinor / 100) : String(s.amountMinor),
  }));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Panel className="mb-4 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">
                My Subscription
              </p>
              <h1 className="mt-1 font-serif text-2xl text-[var(--foreground)]">
                구독 관리 대시보드
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form action={updateSettingsAction} className="flex items-center gap-2">
                <input
                  name="usdToKrwRate"
                  type="hidden"
                  value={settings.usdToKrwRate}
                />
                <input
                  name="themeMode"
                  type="hidden"
                  value={settings.themeMode === "DARK" ? "LIGHT" : "DARK"}
                />
                <button className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]">
                  {settings.themeMode === "DARK" ? "라이트 모드" : "다크 모드"}
                </button>
              </form>
              <form action={logoutAction}>
                <button className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]">
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_360px]">
          <SubscriptionList
            subscriptions={serializedSubscriptions}
            summary={{
              monthlyTotalKrw: summary.monthlyTotalKrw,
              yearlyTotalKrw: summary.yearlyTotalKrw,
              activeCount: summary.activeCount,
            }}
          />

          <div className="space-y-4">
            <Panel className="p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">
                Current Status
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[1.4rem] bg-[var(--surface)] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                    월별 비용
                  </p>
                  <p className="mt-2 font-serif text-3xl text-[var(--foreground)]">
                    {formatKrw(summary.monthlyTotalKrw)}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[var(--surface)] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                    연별 비용
                  </p>
                  <p className="mt-2 font-serif text-3xl text-[var(--foreground)]">
                    {formatKrw(summary.yearlyTotalKrw)}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[var(--surface)] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                    환율
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    1 USD = {settings.usdToKrwRate.toLocaleString("ko-KR")} KRW
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">
                Settings
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                환율 설정
              </h2>

              <form action={updateSettingsAction} className="mt-5 space-y-3">
                <Input
                  key={settings.usdToKrwRate}
                  defaultValue={settings.usdToKrwRate}
                  label="USD 환율 (KRW)"
                  min={1}
                  name="usdToKrwRate"
                  required
                  step="1"
                  type="number"
                />
                <Select
                  key={settings.themeMode}
                  defaultValue={settings.themeMode}
                  label="테마"
                  name="themeMode"
                  options={[
                    { label: "라이트", value: "LIGHT" },
                    { label: "다크", value: "DARK" },
                  ]}
                />
                <button className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]">
                  설정 저장
                </button>
              </form>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}
