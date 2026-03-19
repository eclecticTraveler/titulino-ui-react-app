/**
 * React Router v5 → v7 compatibility shim.
 *
 * Re-exports everything from react-router-dom v7, plus polyfills for
 * removed v5 APIs so existing code can migrate incrementally:
 *   - withRouter HOC          (uses useLocation, useNavigate, useParams)
 *   - RouteElement            (renders component with v5-style route props)
 *   - Redirect → Navigate     (re-export Navigate as Redirect)
 *   - useHistory              (wraps useNavigate)
 *   - useRouteMatch           (wraps useMatch / returns static object)
 */

import React from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";

// Re-export every public symbol from v7 so consumers can import from here.
export * from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  RouteElement — renders a component with v5-style route props       */
/*  Usage: <Route element={<RouteElement component={MyLazy} />} />     */
/* ------------------------------------------------------------------ */
export function RouteElement({ component: Component, ...extraProps }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const history = React.useMemo(
    () => ({
      push: (to, state) => navigate(to, { state }),
      replace: (to, state) => navigate(to, { replace: true, state }),
      go: (n) => navigate(n),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
      location,
    }),
    [navigate, location]
  );

  const match = React.useMemo(
    () => ({
      params,
      path: location.pathname,
      url: location.pathname,
    }),
    [params, location.pathname]
  );

  return (
    <Component
      location={location}
      history={history}
      match={match}
      {...extraProps}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  withRouter HOC                                                     */
/* ------------------------------------------------------------------ */
export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    // Build a history-like object so `this.props.history.push(...)` still works
    const history = React.useMemo(
      () => ({
        push: (to, state) => navigate(to, { state }),
        replace: (to, state) => navigate(to, { replace: true, state }),
        go: (n) => navigate(n),
        goBack: () => navigate(-1),
        goForward: () => navigate(1),
        location,
      }),
      [navigate, location]
    );

    // match-like object (v5 shape) for class components that read props.match
    const match = React.useMemo(
      () => ({
        params,
        path: location.pathname,
        url: location.pathname,
      }),
      [params, location.pathname]
    );

    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
        history={history}
        match={match}
      />
    );
  }

  // Preserve display name for React DevTools
  const displayName = Component.displayName || Component.name || "Component";
  ComponentWithRouterProp.displayName = `withRouter(${displayName})`;

  return ComponentWithRouterProp;
}

/* ------------------------------------------------------------------ */
/*  useHistory (wraps useNavigate)                                     */
/* ------------------------------------------------------------------ */
export function useHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  return React.useMemo(
    () => ({
      push: (to, state) => {
        if (typeof to === "object") {
          // v5 style: history.push({ pathname, search, state })
          const { state: objState, ...rest } = to;
          navigate(rest, { state: state || objState });
        } else {
          navigate(to, { state });
        }
      },
      replace: (to, state) => {
        if (typeof to === "object") {
          const { state: objState, ...rest } = to;
          navigate(rest, { replace: true, state: state || objState });
        } else {
          navigate(to, { replace: true, state });
        }
      },
      go: (n) => navigate(n),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
      location,
      listen: () => {
        // No-op; callers that need listen should migrate to useEffect + useLocation
        return () => {};
      },
    }),
    [navigate, location]
  );
}

/* ------------------------------------------------------------------ */
/*  useRouteMatch (limited polyfill)                                   */
/* ------------------------------------------------------------------ */
export function useRouteMatch() {
  const location = useLocation();
  const params = useParams();
  return {
    params,
    path: location.pathname,
    url: location.pathname,
  };
}

/* ------------------------------------------------------------------ */
/*  Redirect → Navigate                                                */
/* ------------------------------------------------------------------ */
export function Redirect({ to, from, push, ...rest }) {
  // v5 Redirect accepted `to` as string or object
  // v7 Navigate replaces by default (Redirect semantics)
  return <Navigate to={to} replace={!push} {...rest} />;
}
