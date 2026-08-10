"use client";

export const inputClass =
    "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-normal outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

export function Form({
    children,
    onSubmit,
    onDelete,
}: {
    children: React.ReactNode;
    onSubmit: () => void;
    onDelete?: () => void;
}) {
    return (
        <form
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="grid gap-5">
                {children}
                <div className="flex flex-wrap gap-3">
                    <button className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
                        Save changes
                    </button>
                    {onDelete ? (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="h-11 rounded-xl border border-rose-300 px-5 text-sm font-semibold text-rose-700"
                        >
                            Delete
                        </button>
                    ) : null}
                </div>
            </div>
        </form>
    );
}

export function Field({
    label,
    value,
    setValue,
    required,
    type = "text",
}: {
    label: string;
    value: string;
    setValue: (value: string) => void;
    required?: boolean;
    type?: string;
}) {
    return (
        <label className="grid gap-2 text-sm font-semibold">
            {label}
            <input
                required={required}
                type={type}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className={inputClass}
            />
        </label>
    );
}

export function Area({
    label,
    value,
    setValue,
}: {
    label: string;
    value: string;
    setValue: (value: string) => void;
}) {
    return (
        <label className="grid gap-2 text-sm font-semibold">
            {label}
            <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 p-3.5 font-normal leading-7 outline-none focus:border-teal-500"
            />
        </label>
    );
}

export function Select({
    label,
    value,
    setValue,
    items,
    empty,
}: {
    label: string;
    value: string;
    setValue: (value: string) => void;
    items: { id: string; label: string }[];
    empty?: string;
}) {
    return (
        <label className="grid gap-2 text-sm font-semibold">
            {label}
            <select
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className={inputClass}
            >
                {empty ? <option value="">{empty}</option> : null}
                {items.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function Checks({
    legend,
    items,
    selected,
    setSelected,
}: {
    legend: string;
    items: { id: string; label: string }[];
    selected: string[];
    setSelected: (items: string[]) => void;
}) {
    return (
        <fieldset className="rounded-xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold">{legend}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => (
                    <label
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(item.id)}
                            onChange={() =>
                                setSelected(
                                    selected.includes(item.id)
                                        ? selected.filter((id) => id !== item.id)
                                        : [...selected, item.id],
                                )
                            }
                            className="accent-teal-600"
                        />
                        {item.label}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
