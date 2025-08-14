import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Button, Grid, Badge, Tabs } from "antd";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from "configs/IconConfig";
import IntlMessage from "components/util-components/IntlMessage";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onProcessingPurchaseOfProduct, onGettingProductsForPurchase } from "redux/actions/Shop";
import utils from "utils";

const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

const ShopWindow = (props) => {
  const { user, nativeLanguage, course, productCatalog, onProcessingPurchaseOfProduct, onGettingProductsForPurchase } = props;
  const [hoveredTier, setHoveredTier] = useState(null);
  const screens = utils.getBreakPoint(useBreakpoint());
  const isMobile = !screens.includes("md");
  const locale = true;	
  // Track active tab/course_code_id, default first in catalog
  const [activeCourseCode, setActiveCourseCode] = useState("");

	useEffect(() => {
	if (productCatalog?.length) {
		setActiveCourseCode(productCatalog[0].course_code_id); // first sorted course
	}
	}, [productCatalog]);


  useEffect(() => {
    // You may want to reload products on nativeLanguage or course change
    if (nativeLanguage?.localizationId && course) {
      onGettingProductsForPurchase(nativeLanguage.localizationId, course);
    }
  }, [nativeLanguage, course, onGettingProductsForPurchase]);

  // Find the currently active course data from productCatalog
  const activeCourse = productCatalog?.find((c) => c.course_code_id === activeCourseCode) || { features: [] };

  const setLocale = (isLocaleOn, localeKey) =>
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

  const renderIcon = (value) =>
    value ? (
      <IconAdapter
        icon={faCheckCircle}
        iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome}
        style={{ color: "green" }}
      />
    ) : (
      <IconAdapter
        icon={faTimesCircle}
        iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome}
        style={{ color: "red" }}
      />
    );

  // Build table data from activeCourse features
  const data = activeCourse.features.map((feature, idx) => ({
	key: String(idx + 1),
	feature: setLocale(locale, feature.feature),
	free: feature.enabled.free,
	silver: feature.enabled.silver,
	gold: feature.enabled.gold
  }));
  
  
  const columns = [
    { title: setLocale(locale, "shop.feature.features"), dataIndex: "feature", key: "feature" },
    {
      title: setLocale(locale, "shop.feature.free"),
      dataIndex: "free",
      key: "free",
      align: "center",
      render: renderIcon,
    },
    {
      title: setLocale(locale, "shop.feature.silverCost"),
      dataIndex: "silver",
      key: "silver",
      align: "center",
      render: (_, record) => renderIcon(record.silver),
    },
    {
      title: setLocale(locale, "shop.feature.goldCost"),
      dataIndex: "gold",
      key: "gold",
      align: "center",
      render: (_, record) => renderIcon(record.gold),
    },
  ];

  // Handle purchase click for given tier
  const handlePurchase = async (priceId) => {
    if (!user?.emailId) return;

    // Find price_id for this tier from first feature's tiers (or better: from activeCourse features)
    // You may want to send the whole course_code_id + tierKey to server
    // Here just pass tierKey and email for simplicity

	// We need ac couple of things:
	// 1.- Pass the priceId, the courseCodeId, the user.?contactPaymentId, user?.email, user?.communicationName
	// 2.- also check on the DB if the person has already purchased the product by ID and if so then disable the button and change the badge saying purchased
	// PaymentProvider -> ProviderId text not null primary key
	// ContactPurchaseHistory ->  PurchaseId, transactionId, ContactInternalId, ContactPaymentId, PriceId, Amount, Currency, PaymentProviderId, CourseCodeId, WasRefunded, TransactionDate, ModifiedAt
	// 		constraints ->PurchaseId incremental, ContactPaymentId has to exist in ContactPayment, Amount in float, Currency default USD if not specified, ContactInternalId has to be linked to Contact same with CourseCodeId has to be for Course, PaymentProviderId with PaymentProvider, WasRefunded default false, TransactionDate only in insert now, ModifiedAt on insert and update
	//					  no record should have the same, purchaseId,  ContactInternalId, ContactPaymentId, PriceId, Amount, Currency, PaymentProviderId, CourseCodeId

	// ContactPayment -> ContactPaymentId, PaymentProviderId, ContactInternalId
			// constrains -> ContactPaymentId comes from stripe generated, PaymentProviderId from PaymentProvider tbl, ContactInternalId from contact tbl
	
	
	// Create upsert function "Shop".upsert_contact_purchase_history and it accepts a datatype of the same table structure as ContactPurchaseHistory in an array
	// Create wrapper function "TitulinoApi_v1"."UpsertContactPurchase" and takes a json string and casts it into an array of the datatype and calls upsert_contact_purchase also has the function permissions necesary
	// Create get function "Shop".get_contact_purchase_history and gets a select all 
	// Create permissions for RLS where ContactInternalId is the one.
	// Create function wrapper and function that gets the ContactPaymentId where ContactInternalId is passed and the 


	// 3.- as the info is sent then ensure it hits the api and reaches to stripe to generate a URL
	// 4.- Create a customer_purchases table where there is CourseCodeId, ContactInternalId, PriceId
	// 5.- Create a table called Contact_ContactPaymentId where it has ContactInternalId, ContactPaymentId, ProviderId "Stripe"

	console.log("Tier", priceId || null, activeCourseCode);
    // try {
    //   const result = await onProcessingPurchaseOfProduct({
    //     courseCodeId: activeCourseCode,
    //     tier: tierKey,
    //     priceId: activeCourse.features?.[0]?.tiers?.[tierKey]?.price_id || null,
    //     email: user.emailId,
    //   });

    //   if (result?.sessionUrl) {
    //     window.location.href = result.sessionUrl;
    //   } else {
    //     alert("Failed to retrieve session URL");
    //   }
    // } catch (error) {
    //   console.error("Stripe Checkout Error:", error);
    //   alert("Something went wrong!");
    // }
  };

  // Render tier card for each pricing tier
  const renderTierCard = ({ tierKey, isDisabled, imageUrl, buttonText, featuresForTier, priceId }) => (
    <Card
      hoverable
      title={tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}
      bordered
      onMouseEnter={() => !isMobile && setHoveredTier(tierKey)}
      onMouseLeave={() => !isMobile && setHoveredTier(null)}
    >
      <div style={{ width: "70%", margin: "0 auto" }}>
        <img
          src={imageUrl}
          alt={tierKey}
          style={{
            width: "100%",
            marginBottom: 10,
            marginTop: 20,
          }}
        />
        <Button
          type={isDisabled ? undefined : "primary"}
          block
          disabled={isDisabled}
          onClick={!isDisabled ? () => handlePurchase(priceId) : undefined}
        >
          {buttonText}
        </Button>
      </div>

      {isMobile && (
        <div style={{ marginTop: 16 }}>
          {featuresForTier.map((item) => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              {renderIcon(true)}
              <span style={{ marginLeft: 8 }}>{item.feature}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const coverUrl =
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2304&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div className="container customerName">
      <Card
        cover={<img alt="Shopping" src={coverUrl} style={{ height: 100, objectFit: "cover" }} />}
        bordered
      >
        <h1>{setLocale(locale, "shop.feature.compareOurPackages")}</h1>
        <p>{setLocale(locale, "shop.disclaimer")}</p>
      </Card>

      <Tabs
        activeKey={activeCourseCode}
        onChange={(key) => setActiveCourseCode(key)}
        style={{ marginTop: 16 }}
        centered
      >
        {productCatalog?.map(({ course_code_id, course_name }) => (
          <TabPane tab={course_name} key={course_code_id} />
        ))}
      </Tabs>

      <Card bordered style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
          {["free", "silver", "gold"].map((tierKey) => {
			const tierInfo = activeCourse.tiers?.[tierKey];
            const isDisabled = !tierInfo?.isEnabledForPurchase;
            const imageUrl = tierInfo?.image_url || "";
			const priceId = tierInfo?.price_id || null;
            const buttonText = {
              free: setLocale(locale, "shop.feature.current"),
              silver: setLocale(locale, "shop.feature.buy3"),
              gold: setLocale(locale, "shop.feature.buy5"),
            }[tierKey];

            // Filter features enabled for this tier to display in card
            const featuresForTier = data.filter((item) => item[tierKey]);

            return (
              <Col xs={24} md={8} key={tierKey}>
                <Badge.Ribbon
                  text={
                    tierKey === "free"
                      ? "⭐ Current"
                      : tierKey === "silver"
                      ? `⭐⭐ Special Offer $${tierInfo?.price_usd ?? ""}`
                      : `⭐⭐⭐ Special Offer $${tierInfo?.price_usd ?? ""}`
                  }
                  color={
                    tierKey === "free"
                      ? "#52c41a"
                      : tierKey === "silver"
                      ? "#1890ff"
                      : "#f5222d"
                  }
                  style={{
                    marginTop: 40,
                    padding: "0 12px",
                    fontSize: 17,
                    height: 32,
                    lineHeight: "32px",
                    fontWeight: 600,
                  }}
                >
                  {renderTierCard({ tierKey, isDisabled, imageUrl, buttonText, featuresForTier, priceId })}
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
            scroll={{ x: "max-content" }}
            bordered
            rowClassName={(record) => (hoveredTier && record[hoveredTier] ? "highlight-row" : "")}
          />
        )}
      </Card>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onProcessingPurchaseOfProduct,
      onGettingProductsForPurchase,
    },
    dispatch
  );
}

const mapStateToProps = ({ grant, shop, lrn, theme }) => {
  const { user } = grant;
  const { productCatalog } = shop;
  const { nativeLanguage } = lrn;
  const { course } = theme;
  return { user, productCatalog, nativeLanguage, course };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopWindow);
