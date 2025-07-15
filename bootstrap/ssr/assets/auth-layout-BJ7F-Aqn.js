import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppLogoIcon } from "./app-logo-icon-CoogQ1E6.js";
import { usePage, Link } from "@inertiajs/react";
function AuthSplitLayout({ children, title, description }) {
  const { name, quote } = usePage().props;
  return /* @__PURE__ */ jsxs("div", { className: "relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" }),
      /* @__PURE__ */ jsxs(Link, { href: route("home"), className: "relative z-20 flex items-center text-lg font-medium", children: [
        /* @__PURE__ */ jsx(AppLogoIcon, { className: "mr-2 size-8 fill-current text-white" }),
        name
      ] }),
      quote && /* @__PURE__ */ jsx("div", { className: "relative z-20 mt-auto", children: /* @__PURE__ */ jsxs("blockquote", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-lg", children: [
          "“",
          quote.message,
          "”"
        ] }),
        /* @__PURE__ */ jsx("footer", { className: "text-sm text-neutral-300", children: quote.author })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full lg:p-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]", children: [
      /* @__PURE__ */ jsx(Link, { href: route("home"), className: "relative z-20 flex items-center justify-center lg:hidden", children: /* @__PURE__ */ jsx(AppLogoIcon, { className: "h-10 fill-current text-black sm:h-12" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 text-left sm:items-center sm:text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-balance text-muted-foreground", children: description })
      ] }),
      children
    ] }) })
  ] });
}
function AuthLayout({ children, title, description, ...props }) {
  return /* @__PURE__ */ jsx(AuthSplitLayout, { title, description, ...props, children });
}
export {
  AuthLayout as A
};
