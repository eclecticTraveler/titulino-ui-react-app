import React from 'react'
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

const getWholeDigitCount = (value) => {
	const wholeValue = String(value ?? 0).split('.')[0];
	return wholeValue.replace(/\D/g, '').length;
};

const DoubleCounterDisplay = ({
	localizedTitle,
	firstCount,
	secondCount,
	firstLabelKey,
	secondLabelKey
}) => {
	const countOne = firstCount ?? 0;
	const countTwo = secondCount ?? 0;
	const title = localizedTitle || "unavailable";
	const shouldStackCounts = Math.max(getWholeDigitCount(countOne), getWholeDigitCount(countTwo)) >= 3;

	return (
		<div>
			<Card variant="outlined" title={<IntlMessage id={title} />}>
				<div className={`double-count-card-v2${shouldStackCounts ? ' double-count-card-v2-stacked' : ''}`}>
					<div className="double-count-card-v2-stat">
						<div className="double-count-card-v2-number double-count-card-v2-first">{countOne}</div>
						{firstLabelKey && (
							<div className="double-count-card-v2-label"><IntlMessage id={firstLabelKey} /></div>
						)}
					</div>
					<div className="double-count-card-v2-divider" />
					<div className="double-count-card-v2-stat">
						<div className="double-count-card-v2-number double-count-card-v2-second">{countTwo}</div>
						{secondLabelKey && (
							<div className="double-count-card-v2-label"><IntlMessage id={secondLabelKey} /></div>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
};

export default DoubleCounterDisplay;
