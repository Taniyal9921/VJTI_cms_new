import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";

export function Navbar({ onMenu }: { onMenu?: () => void }) {
  const { user, logout } = useAuth();
  const home =
    user?.role === "Admin"
      ? "/admin"
      : user?.role === "Student" || user?.role === "Faculty"
        ? "/complaints"
        : "/dashboard";
  return (
    <header className="sticky top-0 z-40 border-b border-red-900 bg-[#c62828] shadow-md dark:border-slate-800 dark:bg-red-900">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {onMenu ? (
            <Button variant="ghost" className="md:hidden !px-2 text-white hover:bg-white/10 hover:text-white dark:hover:bg-black/20" type="button" onClick={onMenu}>
              Menu
            </Button>
          ) : null}
          <Link to={home} className="group flex items-center gap-3">
            <img
              src="/assets/vjti-logo-wide.png"
              alt="Veermata Jijabai Technological Institute"
              className="h-14 w-auto transition-transform duration-200 group-hover:scale-[1.03] brightness-0 invert"
              loading="eager"
            />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-white/90 sm:inline">
                {user.name} · <span className="font-semibold text-white">{user.role}</span>
              </span>
              <Button variant="secondary" className="!bg-white !text-[#c62828] hover:!bg-red-50 font-semibold" type="button" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" type="button">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="secondary" className="!bg-white !text-[#c62828] hover:!bg-red-50 font-semibold" type="button">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
