import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Button, Grid, Badge, Tabs, Drawer } from "antd";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from "configs/IconConfig";
import IntlMessage from "components/util-components/IntlMessage";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onProcessingPurchaseOfProduct, onGettingProductsAvailableForPurchase } from "redux/actions/Shop";
import utils from "utils";
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import { loadStripe } from "@stripe/stripe-js";
import ConfettiExplosion from 'react-confetti-explosion';
import GenericModal from "components/layout-components/GenericModal";
import ProductPurchasedMessage from "components/admin-components/ModalMessages/ProductPurchasedMessage";
import silverTier from 'assets/lotties/silverTier.json';
import goldTier from 'assets/lotties/goldTier.json';

const { useBreakpoint } = Grid;
const { TabPane } = Tabs;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const SHOPPING_PARAMETERS_STORED_KEY = "postQueryParams";

const ShopWindow = (props) => {
  const { user, nativeLanguage, course, productCatalog, onProcessingPurchaseOfProduct, onGettingProductsAvailableForPurchase, token } = props;
  const [hoveredTier, setHoveredTier] = useState(null);
  const screens = utils.getBreakPoint(useBreakpoint());
  const isMobile = !screens.includes("md");
  const locale = true;	
  // Track active tab/course_code_id, default first in catalog
  const [activeCourseCode, setActiveCourseCode] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerTier, setDrawerTier] = useState(null);
  const [providePriceId, setProvidePriceId] = useState(null);
  const [isSmallConfettiVisible, setIsSmallConfettiVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
    useEffect(() => {
      // TODO
      // if gold then do not make available silver
      // Create two modals to present one for Silver one for Gold
      // Figure out a way to pass the whatsapp link for the gold
      // Trigger an email for the Gold
      const queryParam = localStorage.getItem(SHOPPING_PARAMETERS_STORED_KEY);        
      if (queryParam) {     
        const urlParams = new URLSearchParams(queryParam);     
        const params = urlParams.get("purchaseTransactionState");
        const safeParamValue = decodeURIComponent(params);	
        const paramenterExtracted = safeParamValue?.toLowerCase();
        if( paramenterExtracted === "success"){        
          setIsSmallConfettiVisible(true);
          setIsModalVisible(true);
          localStorage.removeItem(SHOPPING_PARAMETERS_STORED_KEY);   
        }else if(paramenterExtracted === "cancel"){
          setIsSmallConfettiVisible(false);
          setIsModalVisible(false);
          localStorage.removeItem(SHOPPING_PARAMETERS_STORED_KEY); 
        }else{
          setIsSmallConfettiVisible(false);
          setIsModalVisible(false);
        }
      }
    }, []);


  const handleCloseModal = () => {
    // onModalInteraction(true);
    setIsModalVisible(false); // Close modal when user clicks close button

  };

  const handleDirectionModal = () => {
    // resetState();
    setIsModalVisible(false);
  };
  const showDrawer = () => {
    setOpen(true);
  };
  const onCloseDrawer = () => {
    setDrawerTier(null);
    setProvidePriceId(null);
    setOpen(false);
  };

	useEffect(() => {
	if (productCatalog?.length) {
		setActiveCourseCode(productCatalog[0].course_code_id); // first sorted course
	}
	}, [productCatalog]);

  useEffect(() => {
    // You may want to reload products on nativeLanguage or course change
    if (nativeLanguage?.localizationId && course && user?.emailId) {
      onGettingProductsAvailableForPurchase(nativeLanguage.localizationId, course, user?.emailId);
    }
  }, [nativeLanguage, course, user?.emailId]);

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

  const handlePurchase = async (priceId) => {
    if (!user?.emailId) return;
  
    try {
      const result = await onProcessingPurchaseOfProduct({
        courseCodeId: activeCourseCode,
        tier: drawerTier,
        priceId: priceId
      }, user.emailId);

      if (result?.sessionUrl?.urlId) {             
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: result.sessionUrl.urlId
        });

        if (error) {
          console.error("Stripe redirect error:", error);
          alert(error.message);
        }

        console.log("RESULT", result);
      } else {
        alert("Error. la Pagina no procesara' su pago, dejar saber al administrador para ver el problema");
      }
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      alert("Something went wrong!");
    }
  };

  // Handle purchase click for given tier
  const precheckoutShop = async (tierKey, priceId) => {
    setDrawerTier(tierKey);
    setProvidePriceId(priceId);
    showDrawer();
  };

  const renderFeaturesList = (features) => {
    return (
      <div style={{ marginTop: 16 }}>
        {features.map((item) => (
          <div key={item.key} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
            {renderIcon(true)}
            <span style={{ marginLeft: 8 }}>{item.feature}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render tier card for each pricing tier
  const renderTierCard = ({ tierKey, isDisabled, imageUrl, buttonText, featuresForTier, priceId, isPurchased }) => (
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
          type={isPurchased ? "default" : isDisabled ? undefined : "primary"}
          block
          disabled={isDisabled}
          onClick={
            !isDisabled && !isPurchased
              ? () => precheckoutShop(tierKey, priceId)
              : undefined
          }
        >
          {buttonText}
        </Button>
      </div>

      {isMobile && renderFeaturesList(featuresForTier)}

    </Card>
  );

  if(token){
      if(user?.emailId && !user?.yearOfBirth){
          return (
              <div id="unathenticated-landing-page-margin">
                  <EmailYearSearchForm/>
              </div>
          )
      }
    }

  const coverUrl =
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2304&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const purchasedTier = Object.entries(activeCourse.tiers || {}).find(
    ([, tier]) => tier?.isPurchased
  )?.[0] || null;

    
  return (
    <div className="container customerName">
      {isSmallConfettiVisible && <ConfettiExplosion />}
      {isModalVisible && 
            <GenericModal             
              closeGenericModal={handleCloseModal}
              visibleModal={isModalVisible} // Pass the modal visibility
              title={"shop.succesPurchase.header"}
              secondTitle={"shop.succesPurchase.headerTitle"}              
              animation={silverTier}
              messageToDisplay={<ProductPurchasedMessage handlePostButtonClick={handleDirectionModal}/>}
              transitionTimming={1500}
          />
    }

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
            const isPurchased = tierInfo?.isPurchased ?? false;
            const priceId = tierInfo?.price_id || null;
            const buttonText = isPurchased
            ? setLocale(locale, "shop.feature.current")
            : {
                free: setLocale(locale, "shop.feature.current"),
                silver: setLocale(locale, "shop.feature.buy3"),
                gold: setLocale(locale, "shop.feature.buy5"),
              }[tierKey];
 
              // Badge text logic
              const badgeText = isPurchased
              ? setLocale(locale, "shop.feature.purchased")
              : tierKey === "free" && (purchasedTier === "silver" || purchasedTier === "gold")
              ? "⭐ Included"
              : tierKey === "free"
              ? "⭐ Current"
              : tierKey === "silver"
              ? `⭐⭐ Special Offer $${tierInfo?.price_usd ?? ""} USD 💵`
              : `⭐⭐⭐ Special Offer $${tierInfo?.price_usd ?? ""} USD 💵`;


            const badgeColor = isPurchased
              ? "#00a9fa" // when purchased
              : tierKey === "free"
              ? "#52c41a"
              : tierKey === "silver"
              ? "#1890ff"
              : "#f5222d";  

            // Filter features enabled for this tier to display in card
            const featuresForTier = data.filter((item) => item[tierKey]);

            return (
              <Col xs={24} md={8} key={tierKey}>
                <Badge.Ribbon
                  text={badgeText}
                  color={badgeColor}
                  style={{
                    marginTop: 40,
                    padding: "0 12px",
                    fontSize: 17,
                    height: 32,
                    lineHeight: "32px",
                    fontWeight: 600,
                  }}
                >
                  {renderTierCard({ tierKey, isDisabled, imageUrl, buttonText, featuresForTier, priceId, isPurchased })}
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

      <Drawer
        title={
          drawerTier === "free"
            ? "⭐ Current"
            : drawerTier === "silver"
            ? `Silver Package $${activeCourse.tiers?.[drawerTier]?.price_usd ?? ""} USD ⭐⭐`
            : `Gold Package $${activeCourse.tiers?.[drawerTier]?.price_usd ?? ""} USD ⭐⭐⭐`
        }
        placement="bottom"
        closable={false}
        onClose={onCloseDrawer}
        visible={open}
        key="bottom"
      >
        {!isMobile ? (
          <Row gutter={16} justify="center" align="top">
            {/* Button column */}
            <Col xs={24} md={6} style={{ textAlign: "center" }}>
              <Button
                type="primary"
                block
                onClick={() => handlePurchase(providePriceId)}
                style={{ marginBottom: 16 }}
              >
                {setLocale(locale, "shop.proceed")}                 
              </Button>

              {/* Circular image under button */}
              {drawerTier && (
                <img
                  src={activeCourse.tiers?.[drawerTier]?.image_url || ""}
                  alt={drawerTier}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: "25%",
                    objectFit: "scale-down",
                    display: "block",
                    margin: "0 auto 16px auto",
                  }}
                />
              )}
            </Col>

            {/* Features column */}
            <Col xs={24} md={6}>
              {drawerTier && renderFeaturesList(
                data.filter((item) => item[drawerTier])
              )}
            </Col>
          </Row>
        ) : (
          <>
            <Button
              type="primary"
              block
              style={{ marginTop: 16, marginBottom: 16 }}
              onClick={() => handlePurchase(providePriceId)}
            >
              {setLocale(locale, "shop.proceed")}              
            </Button>

            {/* Circular image under button for mobile */}
            {drawerTier && (
              <img
                className="drawerImage"
                src={activeCourse.tiers?.[drawerTier]?.image_url || ""}
                alt={drawerTier}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: "25%",
                  objectFit: "scale-down",
                  display: "block",
                  margin: "0 auto 16px auto",
                }}
              />
            )}

            {drawerTier && renderFeaturesList(
              data.filter((item) => item[drawerTier])
            )}
          </>
        )}
      </Drawer>

    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onProcessingPurchaseOfProduct,
      onGettingProductsAvailableForPurchase
    },
    dispatch
  );
}

const mapStateToProps = ({ grant, shop, lrn, theme, auth }) => {
  const { user } = grant;
  const { productCatalog } = shop;
  const { nativeLanguage } = lrn;
  const { course } = theme;
  const { token } = auth;
  return { user, productCatalog, nativeLanguage, course, token };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopWindow);
