import React from "react";
import {
  BrowserRouter,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  Link,
  NavLink,
  Outlet,
  useSearchParams,
  createSearchParams,
  matchPath,
} from "react-router-dom";

const splitToAndState = (to, stateArg) => {
  if (to && typeof to === "object") {
    const { pathname = "/", search = "", hash = "", state } = to;
    return {
      to: { pathname, search, hash },
      state: stateArg !== undefined ? stateArg : state,
    };
  }

  return { to, state: stateArg };
};

const buildPattern = ({ path, exact, sensitive }) => {
  if (!path) return null;
  return {
    path,
    end: !!exact,
    caseSensitive: !!sensitive,
  };
};

const getMatch = (pathname, props = {}) => {
  const path = props.path ?? props.from;
  if (!path) return { path: null, url: pathname, isExact: true, params: {} };

  const matched = matchPath(buildPattern({ path, exact: props.exact, sensitive: props.sensitive }), pathname);
  if (!matched) return null;

  return {
    path: matched.pattern?.path ?? path,
    url: matched.pathname,
    isExact: matched.pathname === pathname,
    params: matched.params ?? {},
  };
};

const flattenChildren = (children) => {
  const result = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      result.push(...flattenChildren(child.props.children));
      return;
    }
    result.push(child);
  });

  return result;
};

export const Switch = ({ children, location: locationProp }) => {
  const location = useLocation();
  const pathname = locationProp?.pathname || location.pathname;
  const flatChildren = flattenChildren(children);

  for (const child of flatChildren) {
    const match = getMatch(pathname, child.props || {});
    if (match) {
      return child;
    }
  }

  return null;
};

export const Route = ({ component: Component, render, children, element, ...rest }) => {
  const location = useLocation();
  const fallbackParams = useParams();
  const history = useHistory();
  const routeMatch = getMatch(location.pathname, rest);

  if (!routeMatch) return null;

  const routeProps = {
    history,
    location,
    params: routeMatch.params || fallbackParams,
    match: routeMatch,
  };

  let resolvedElement = element;

  if (!resolvedElement) {
    if (Component) {
      resolvedElement = <Component {...routeProps} />;
    } else if (typeof render === "function") {
      resolvedElement = render(routeProps);
    } else if (typeof children === "function") {
      resolvedElement = children(routeProps);
    } else {
      resolvedElement = children ?? null;
    }
  }

  return resolvedElement;
};

export const Redirect = ({ to, push }) => {
  const { to: normalizedTo, state } = splitToAndState(to);
  const navigateElement = <Navigate to={normalizedTo} state={state} replace={!push} />;
  return navigateElement;
};

export const useHistory = () => {
  const navigate = useNavigate();

  return React.useMemo(
    () => ({
      push: (to, stateArg) => {
        const { to: normalizedTo, state } = splitToAndState(to, stateArg);
        navigate(normalizedTo, { state });
      },
      replace: (to, stateArg) => {
        const { to: normalizedTo, state } = splitToAndState(to, stateArg);
        navigate(normalizedTo, { replace: true, state });
      },
      go: (delta) => navigate(delta),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
    }),
    [navigate]
  );
};

export const useRouteMatch = (pattern) => {
  const location = useLocation();
  const params = useParams();

  if (pattern) {
    const matched = matchPath({ path: pattern, end: false }, location.pathname);
    if (!matched) return null;
    return {
      path: pattern,
      url: matched.pathname || location.pathname,
      isExact: matched.pathname === location.pathname,
      params: matched.params || {},
    };
  }

  return {
    path: location.pathname,
    url: location.pathname,
    isExact: true,
    params,
  };
};

export const withRouter = (WrappedComponent) => {
  const ComponentWithRouter = (props) => {
    const location = useLocation();
    const params = useParams();
    const history = useHistory();
    const navigate = useNavigate();

    const match = {
      path: location.pathname,
      url: location.pathname,
      isExact: true,
      params,
    };

    return (
      <WrappedComponent
        {...props}
        history={history}
        location={location}
        match={match}
        params={params}
        navigate={navigate}
      />
    );
  };

  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || "Component";
  ComponentWithRouter.displayName = `withRouter(${wrappedName})`;

  return ComponentWithRouter;
};

export {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  createSearchParams,
  matchPath,
};
