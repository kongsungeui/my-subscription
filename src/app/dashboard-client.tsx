"use client";

import { useTransition, useState } from "react";
import {
  createSubscriptionAction,
  deleteSubscriptionAction,
  toggleSubscriptionAction,
  updateSubscriptionAction,
} from "@/app/actions";

export type SerializedSubscription = {
  id: number;
  name: string;
  amountMinor: number;
  currency: "KRW" | "USD";
  billingCycle: "MONTHLY" | "YEARLY";
  memo: string | null;
  isActive: boolean;
  amountDisplayFull: string;
  amountDisplayRaw: string;
};

export type DashboardSummary = {
  monthlyTotalKrw: number;
  yearlyTotalKrw: number;
  activeCount: number;
};

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
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="space-y-2 text-sm text-[var(--muted)]">
      <span>{label}</span>
      <textarea
        className="min-h-24 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
        defaultValue={defaultValue ?? ""}
        name={name}
      />
    </label>
  );
}

type ModalState = { mode: "add" } | { mode: "edit"; sub: SerializedSubscription };

function SubscriptionModal({
  state,
  onClose,
}: {
  state: ModalState;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = state.mode === "edit";
  const sub = isEdit ? state.sub : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (isEdit) {
        await updateSubscriptionAction(formData);
      } else {
        await createSubscriptionAction(formData);
      }
      onClose();
    });
  }

  function handleToggle() {
    const formData = new FormData();
    formData.set("id", String(sub!.id));
    formData.set("isActive", String(sub!.isActive));
    startTransition(async () => {
      await toggleSubscriptionAction(formData);
      onClose();
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", String(sub!.id));
    startTransition(async () => {
      await deleteSubscriptionAction(formData);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {isEdit ? "구독 수정" : "구독 추가"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          {isEdit && <input type="hidden" name="id" value={sub!.id} />}

          <Input
            label="서비스명"
            name="name"
            required
            defaultValue={sub?.name}
          />
          <Input
            label="금액"
            name="amount"
            type="number"
            required
            min={0}
            step="0.01"
            defaultValue={sub?.amountDisplayRaw}
          />
          <Select
            label="통화"
            name="currency"
            defaultValue={sub?.currency ?? "KRW"}
            options={[
              { label: "원화 (KRW)", value: "KRW" },
              { label: "달러 (USD)", value: "USD" },
            ]}
          />
          <Select
            label="결제 주기"
            name="billingCycle"
            defaultValue={sub?.billingCycle ?? "MONTHLY"}
            options={[
              { label: "월 결제", value: "MONTHLY" },
              { label: "연 결제", value: "YEARLY" },
            ]}
          />
          <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={sub?.isActive ?? true}
            />
            합산에 포함
          </label>

          <div className="md:col-span-2">
            <Textarea label="메모" name="memo" defaultValue={sub?.memo} />
          </div>

          {isEdit ? (
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={isPending}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)] disabled:opacity-50"
                >
                  {sub!.isActive ? "비활성화" : "활성화"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded-full border border-rose-500/30 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "저장 중…" : "저장"}
              </button>
            </div>
          ) : (
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "추가 중…" : "추가하기"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export function SubscriptionList({
  subscriptions,
  summary,
}: {
  subscriptions: SerializedSubscription[];
  summary: DashboardSummary;
}) {
  const [modal, setModal] = useState<ModalState | null>(null);

  return (
    <>
      <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">
              Subscriptions
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              구독 리스트
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--muted)]">
              활성 {summary.activeCount} / 전체 {subscriptions.length}
            </p>
            <button
              type="button"
              onClick={() => setModal({ mode: "add" })}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-xl font-light text-[var(--accent-foreground)] transition hover:opacity-90"
              aria-label="구독 추가"
            >
              +
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[var(--surface)] text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">
              <tr>
                <th className="px-5 py-4 sm:px-6">서비스</th>
                <th className="px-5 py-4">금액</th>
                <th className="px-5 py-4">주기</th>
                <th className="px-5 py-4">상태</th>
                <th className="px-5 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-12 text-sm text-[var(--muted)] sm:px-6"
                    colSpan={5}
                  >
                    등록된 구독이 없습니다. 상단 + 버튼으로 추가하세요.
                  </td>
                </tr>
              ) : null}

              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="group border-t border-[var(--border)] text-sm text-[var(--foreground)] transition hover:bg-[var(--surface)]/80"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="font-medium">{sub.name}</div>
                    <div className="mt-1 max-w-[260px] truncate text-xs text-[var(--muted)]">
                      {sub.memo || "메모 없음"}
                    </div>
                  </td>
                  <td className="px-5 py-4">{sub.amountDisplayFull}</td>
                  <td className="px-5 py-4">
                    {sub.billingCycle === "MONTHLY" ? "월 결제" : "연 결제"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        sub.isActive
                          ? "bg-emerald-500/12 text-emerald-300"
                          : "bg-zinc-500/12 text-[var(--muted)]"
                      }`}
                    >
                      {sub.isActive ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", sub })}
                      className="rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-[var(--muted)] opacity-100 transition hover:border-[var(--accent)] hover:text-[var(--foreground)] sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <SubscriptionModal state={modal} onClose={() => setModal(null)} />
      )}
    </>
  );
}
