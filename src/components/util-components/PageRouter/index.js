import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteElement } from 'utils/routerCompat';
import Loading from 'components/shared-components/Loading';

const PageRouter = ({ routes, from, to, align, cover }) => {
	const loadingProps = {align, cover}
	return (
		<Suspense fallback={<Loading {...loadingProps}/>}>
      <Routes>
        {routes.map((route, idx) => (
          <Route key={idx} path={route.path} element={<RouteElement component={route.component} />} />
        ))}
        {to && <Route path="*" element={<Navigate to={to} replace />} />}
      </Routes>
      
    </Suspense>
	)
}

export default PageRouter