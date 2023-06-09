import { useState } from "react";
import { useGlobalContext } from "../Contexts/globalContext/context";
import { useRouter } from "next/router";
import Link from "next/link";
import { server } from "../config";
import AdminNav from "./admin/AdminNav";

// theme toggle Button
import Toggle from "./ThemeToggle";

// icons
import {
  SearchIcon,
  MenuIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";

function Navbar() {
  const router = useRouter();
  const {
    translate: t,
    lang,
    sideToggler,
    amount,
    cartToggler,
    displayProf, setDisplayProf
  } = useGlobalContext();
  // setting value of search input
  const [search, setSearch] = useState(router.query.q ? router.query.q : "");
  return (
    <>
      <nav
        style={{ direction: `${lang === "fa" ? "rtl" : "ltr"}` }}
        className="z-40 sticky top-0 flex justify-between text-sm items-center px-3 py-5 navbar text-primary glob-trans"
      >
        <div className="flex ">
          <button className="mx-3" onClick={sideToggler}>
            <MenuIcon className="cursor-pointer w-[22px] h-[22px] hover:text-accent" />
          </button>
          <div className="hidden sm:flex">
            <div className="mx-3 hover:text-accent">
              <Link href="/">
                <a>{t("home")}</a>
              </Link>
            </div>
            <div className="mx-3 hover:text-accent">
              <Link href="/search">
                <a>{t("categories")}</a>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex justify-between max-w-min bg-third hover:bg-hover hover:text-accent py-1 px-2 rounded-full ">
          <div className="form-control min-w-[110px] sm:min-w-[200px] md:min-w-[250px] ">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  let currentUrlParams = new URLSearchParams(router.query);
                  currentUrlParams.set("q", search);
                  router.push(
                    server + "/search?" + currentUrlParams.toString()
                  );
                  setSearch("");
                }
              }}
              type="text"
              placeholder={t("search")}
              className="mt-[1px] w-full mx-1 bg-transparent text-primary placeholder-[#757474] focus:outline-none"
            />
          </div>
          <SearchIcon className="w-5 h-5 mx-1" />
        </div>
        <div className="flex">
          <div className="mx-3 md:mx-5 mt-1">
            <Toggle className="w-5 h-5"/>
          </div>
          <button
            className="mb-1 mx-3 mt-1 hover:text-accent relative flex flex-row"
            onClick={cartToggler}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            {amount !== 0 ? (
              <div className="text-xs absolute text-center bottom-0 -right-2 w-4 h-4 rounded-full bg-secondarycont text-secondarycont">
                {amount}
              </div>
            ) : null}
          </button>
            <button onClick={()=>setDisplayProf(!displayProf)} className="mx-3 md:mx-5">
              <UserCircleIcon className="w-5 h-5" />
            </button>
        </div>
      </nav>
      <div className="absolute w-full py-10 top-0 bg-secondary glob-trans"></div>
      {router.pathname.split("/")[1] === "admin" ? <AdminNav /> : null}
    </>
  );
}
export default Navbar;
