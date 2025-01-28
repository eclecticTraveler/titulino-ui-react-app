import React, { useState, useEffect } from 'react';
import InsightsLandingDashboard from "components/admin-components/Insights/InsightsLandingDashboard";

export const Enrollment = () => {
  useEffect(() => {
    // Add any login logic here if needed.
  }, []);


	return (
		<>
		<InsightsLandingDashboard/>
		</>
	)
};

export default Enrollment;

