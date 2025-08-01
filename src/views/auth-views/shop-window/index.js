import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Button } from 'antd';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import IntlMessage from "components/util-components/IntlMessage";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onProcessingPurchaseOfProduct } from "redux/actions/Shop";

export const ShopWindow = (props) => {
	const { videoClassUrls, nativeLanguage, userProficiencyOrder, course, user, token } = props;

	useEffect(() => {
		// Aqui a redux
	  }, []);

	//   useEffect(() => {
	// 	const pathInfo = utils.getCourseInfoFromUrl(location?.pathname);
	// 	if(user?.emailId){
	// 	  onProcessingPurchaseOfProduct(
	// 		pathInfo?.levelNo,
	// 		pathInfo?.chapterNo,
	// 		nativeLanguage?.localizationId,
	// 		course,
	// 		user?.emailId
	// 	  );
	// 	}
	
	//   }, [location?.pathname, nativeLanguage?.localizationId, course, user?.emailId]);
  
	const locale = true;
	
	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};

	const renderIcon = (value) => (
		value ? (
			<IconAdapter
				icon={faCheckCircle}
				iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome}
				style={{ color: 'green' }}
			/>
		) : (
			<IconAdapter
				icon={faTimesCircle}
				iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome}
				style={{ color: 'red' }}
			/>
		)
	);

	const data = [
		{ key: '1', feature: setLocale(locale, "shop.feature.grammarClasses"), free: true, silver: true, gold: true },
		{ key: '2', feature: setLocale(locale, "shop.feature.termsnResources"), free: true, silver: true, gold: true },
		{ key: '3', feature: setLocale(locale, "shop.feature.extraQuizletResources"), free: false, silver: true, gold: true },
		{ key: '4', feature: setLocale(locale, "shop.feature.300ebook"), free: false, silver: true, gold: true },
		{ key: '5', feature: setLocale(locale, "shop.feature.300TranslationGuide"), free: false, silver: false, gold: true },
		{ key: '6', feature: setLocale(locale, "shop.feature.extraClasses"), free: false, silver: false, gold: true },
		{ key: '7', feature: setLocale(locale, "shop.feature.accessToGroup"), free: false, silver: false, gold: true },
	];

	const columns = [
		{ title: setLocale(locale, "shop.feature.features"), dataIndex: 'feature', key: 'feature' },
		{ title: setLocale(locale, "shop.feature.free"), dataIndex: 'free', key: 'free', align: 'center', render: renderIcon },
		{ title: setLocale(locale, "shop.feature.silverCost"), dataIndex: 'silver', key: 'silver', align: 'center', render: renderIcon },
		{ title: setLocale(locale, "shop.feature.goldCost"), dataIndex: 'gold', key: 'gold', align: 'center', render: renderIcon },
	];

	const handlePurchase = (tier) => {
		alert(`Start Stripe Checkout for: ${tier}`);
	};

	return (
		<div style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
			<Card bordered>
				<h1>{setLocale(locale, "shop.feature.compareOurPackages")}</h1>
			</Card>

			<Card bordered style={{ marginTop: 16 }}>
				<Table
					columns={columns}
					dataSource={data}
					pagination={false}
					scroll={{ x: 'max-content' }}
					bordered
				/>

				{/* Responsive card display */}
				<Row gutter={[16, 16]} style={{ marginTop: 30 }}>
					<Col xs={24} md={8}>
						<Card title="Free" bordered>
							<img
								src="https://storage.googleapis.com/titulino-bucket/course-covers/packages/work-n-jobs/150Free.png"
								alt="Free"
								style={{ width: '100%', marginBottom: 10 }}
							/>
							<Button disabled block>{setLocale(locale, "shop.feature.current")}</Button>
						</Card>
					</Col>
					<Col xs={24} md={8}>
						<Card title="Silver" bordered>
							<img
								src="https://storage.googleapis.com/titulino-bucket/course-covers/packages/work-n-jobs/300Silver.png"
								alt="Silver"
								style={{ width: '100%', marginBottom: 10 }}
							/>
							<Button type="primary" block onClick={() => handlePurchase('silver')}>
								{setLocale(locale, "shop.feature.buy3")}
							</Button>
						</Card>
					</Col>
					<Col xs={24} md={8}>
						<Card title="Gold" bordered>
							<img
								src="https://storage.googleapis.com/titulino-bucket/course-covers/packages/work-n-jobs/300Gold.png"
								alt="Gold"
								style={{ width: '100%', marginBottom: 10 }}
							/>
							<Button type="primary" block onClick={() => handlePurchase('gold')}>
								{setLocale(locale, "shop.feature.buy5")}
							</Button>
						</Card>
					</Col>
				</Row>
			</Card>
		</div>
	);
};

function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		onProcessingPurchaseOfProduct
	}, dispatch);
}

const mapStateToProps = ({ lrn, theme, grant, auth }) => {
  const { videoClassUrls, nativeLanguage, userProficiencyOrder } = lrn;
  const { course } = theme;
  const { user } = grant;
  const { token } = auth;
  return { videoClassUrls, nativeLanguage, userProficiencyOrder, course, user, token };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopWindow);
