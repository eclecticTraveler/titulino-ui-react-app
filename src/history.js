const toPath = (to) => {
  if (typeof to === "string") return to;
  if (!to || typeof to !== "object") return "/";

  const pathname = to.pathname || "/";
  const search = to.search || "";
  const hash = to.hash || "";
  return `${pathname}${search}${hash}`;
};

const history = {
  push: (to) => {
    window.location.assign(toPath(to));
  },
  replace: (to) => {
    window.location.replace(toPath(to));
  },
  goBack: () => {
    window.history.back();
  },
  goForward: () => {
    window.history.forward();
  },
  go: (delta) => {
    window.history.go(delta);
  },
};

export default history;
