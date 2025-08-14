import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button, Grid, Badge } from 'antd';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import IntlMessage from "components/util-components/IntlMessage";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onProcessingPurchaseOfProduct } from "redux/actions/Shop";
import utils from 'utils';

const { useBreakpoint } = Grid;

export const ShopWindow = (props) => {
	const { nativeLanguage, course, user, token, onProcessingPurchaseOfProduct } = props;
	const [hoveredTier, setHoveredTier] = useState(null);
	const screens = utils.getBreakPoint(useBreakpoint());
	const isMobile = !screens.includes('md');  
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
		{ title: setLocale(locale, "shop.feature.silverCost"), dataIndex: 'silver', key: 'silver', align: 'center', render: (_, record) => renderIcon(record.silver) },		  
		{ title: setLocale(locale, "shop.feature.goldCost"), dataIndex: 'gold', key: 'gold', align: 'center', render: (_, record) => renderIcon(record.gold) },
	];

	const handlePurchase = async (tier) => {
		if (!user?.emailId) return;
	  
		try {
		  // Trigger Redux action which will eventually return the session URL
		  const result = await onProcessingPurchaseOfProduct(tier, user.emailId);
	  
		  if (result?.sessionUrl) {
			window.location.href = result.sessionUrl; // 🔁 Redirect to Stripe Checkout
		  } else {
			alert("Failed to retrieve session URL");
		  }
		} catch (error) {
		  console.error("Stripe Checkout Error:", error);
		  alert("Something went wrong!");
		}
	  };
	  

	const renderTierCard = ({ tier, isDisabled, imageUrl, buttonText, featuresForTier }) => (
		<Card
		  hoverable
		  title={tier.charAt(0).toUpperCase() + tier.slice(1)}
		  bordered
		  onMouseEnter={() => !isMobile && setHoveredTier(tier)}
		  onMouseLeave={() => !isMobile && setHoveredTier(null)}
		>
		  <div style={{ width: '70%', margin: '0 auto' }}>
			<img
			  src={imageUrl}
			  alt={tier}
			  style={{
				width: '100%',
				marginBottom: 10,
				marginTop: 20,
			  }}
			/>
			<Button
			  type={isDisabled ? undefined : 'primary'}
			  block
			  disabled={isDisabled}
			  onClick={!isDisabled ? () => handlePurchase(tier) : undefined}
			>
			  {buttonText}
			</Button>
		  </div>
	  
		  {isMobile && (
			<div style={{ marginTop: 16 }}>
			  {featuresForTier.map((item) => (
				<div
				  key={item.key}
				  style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}
				>
				  {renderIcon(true)}
				  <span style={{ marginLeft: 8 }}>{item.feature}</span>
				</div>
			  ))}
			</div>
		  )}
		</Card>
	  );
	  

	  
	const coverUrl = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2304&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
	const title = 'Shopping';
	return (
		<div className="container customerName">
			<Card 			
			cover={
			<img
				alt={title}
				src={coverUrl}
				style={{ height: 100, objectFit: 'cover' }}
			/>
       		 } bordered>
				<h1>{setLocale(locale, "shop.feature.compareOurPackages")}</h1>
				<p>{setLocale(locale, "shop.disclaimer")}</p>
			</Card>

			<Card bordered style={{ marginTop: 16 }}>
				{/* Responsive card display */}
				<Row gutter={[16, 16]} style={{ marginTop: 30 }}>
					{['free', 'silver', 'gold'].map((tier) => {
						const isDisabled = tier === 'free';
						const imageUrl = {
						free: "https://storage.googleapis.com/titulino-bucket/course-covers/packages/work-n-jobs/150Free.png",
						silver: "https://storage.googleapis.com/titulino-bucket/course-covers/packages/work-n-jobs/300Silver.png",
						gold: "https://storage.googleapis.com/titulino-bucket/course-covers/packages/work-n-jobs/300Gold.png",
						}[tier];

						const buttonText = {
						free: setLocale(locale, "shop.feature.current"),
						silver: setLocale(locale, "shop.feature.buy3"),
						gold: setLocale(locale, "shop.feature.buy5"),
						}[tier];

						const featuresForTier = data.filter((item) => item[tier]);

						return (
						<Col xs={24} md={8} key={tier}>
						<Badge.Ribbon
							text={
							tier === 'free'
								? '⭐ Current'
								: tier === 'silver'
								? '⭐⭐ Special Offer $3'
								: '⭐⭐⭐ Special Offer $5'
							}
							color={
							tier === 'free'
								? '#52c41a'
								: tier === 'silver'
								? '#1890ff'
								: '#f5222d'
							}
							style={{
								marginTop: 40,
								padding: '0 12px', // wider ribbon
								fontSize: 17,      // larger text
								height: 32,        // slightly taller ribbon
								lineHeight: '32px',
								fontWeight: 600,   // optional: bolder
							  }}
						>
							{renderTierCard({ tier, isDisabled, imageUrl, buttonText, featuresForTier })}
						</Badge.Ribbon>
						</Col>
						);
					})}
				</Row>


					{!isMobile && (
					<Table
						columns={columns}
						dataSource={data}
						pagination={false}
						scroll={{ x: 'max-content' }}
						bordered
						rowClassName={(record) =>
							hoveredTier && record[hoveredTier] ? 'highlight-row' : ''
						  }
					/>
					)}
				
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
  const { nativeLanguage } = lrn;
  const { course } = theme;
  const { user } = grant;
  const { token } = auth;
  return { nativeLanguage, course, user, token };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopWindow);
