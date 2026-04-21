import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/Button";
import { useTranslation } from "react-i18next";
import i18n from "i18next";


export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("cms_theme") === "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("cms_lang") || "en");
  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("cms_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem("cms_lang", lang);
  }, [lang]);

  return (
    <div className="min-h-screen">
      <Navbar onMenu={() => setOpen(true)} />
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 md:block min-h-[calc(100vh-3.5rem)]">
          <Sidebar role={user?.role} />
        </aside>
        {open ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
                <span className="text-sm font-semibold">{t("Menu")}</span>
                <Button variant="ghost" className="!px-2" type="button" onClick={() => setOpen(false)}>
                  {t("Close")}
                </Button>
              </div>
              <Sidebar role={user?.role} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-4 flex justify-end items-center gap-3">
            {/* 🌐 Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
            {/* 🌙 Theme Toggle */}
            <Button variant="ghost" type="button" className="!text-xs" onClick={() => setDark((d) => !d)}>
              {t("toggle_theme")}
            </Button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
