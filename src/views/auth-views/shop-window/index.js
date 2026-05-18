import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Button, Grid, Badge, Tabs, Drawer } from "antd";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from "configs/IconConfig";
import IntlMessage from "components/util-components/IntlMessage";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onProcessingPurchaseOfProduct, onGettingProductsAvailableForPurchase } from "redux/actions/Shop";
import {onModifyingCourseAccessForUserAfterSuccessfulPurchaseShortcut} from "redux/actions/Grant";
import utils from "utils";
import { loadStripe } from "@stripe/stripe-js";
import ConfettiExplosion from 'react-confetti-explosion';
import GenericModal from "components/layout-components/GenericModal";
import ProductPurchasedMessage from "components/admin-components/ModalMessages/ProductPurchasedMessage";
import GoldTierProductConfirmationMessage from "components/admin-components/ModalMessages/GoldTierProductConfirmationMessage"
import silverTier from 'assets/lotties/silverTier.json';
import { useHistory } from 'utils/routerCompat';
import goldTier from 'assets/lotties/goldTier.json';

const { useBreakpoint } = Grid;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const SHOPPING_PARAMETERS_STORED_KEY = "postQueryParams";

const ShopWindow = (props) => {
  const { user, baseLanguage, contentLanguage, productCatalog, onProcessingPurchaseOfProduct, onGettingProductsAvailableForPurchase, onModifyingCourseAccessForUserAfterSuccessfulPurchaseShortcut } = props;
  const [hoveredTier, setHoveredTier] = useState(null);
  const screens = utils.getBreakPoint(useBreakpoint());
  const isMobile = !screens.includes("md");
  const history = useHistory();
  const locale = true;	
  // Track active tab/courseCodeId, default first in catalog
  const [activeCourseCode, setActiveCourseCode] = useState("");
  const [purchasedCourseCode, setSuccesfulCourseCodeOfPurchasedItem] = useState("");
  const [purchasedTierAccess, setSuccesfulPurchasedTierAccess] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerTier, setDrawerTier] = useState(null);
  const [providePriceId, setProvidePriceId] = useState(null);
  const [isSmallConfettiVisible, setIsSmallConfettiVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isToProceedToSyncPurchasedTiers, setIsToProceedToSyncPurchasedTiers] = useState(false);

    useEffect(() => {
      const queryParam = localStorage.getItem(SHOPPING_PARAMETERS_STORED_KEY);        
      if (queryParam) {     
        const urlParams = new URLSearchParams(queryParam);     
        const params = urlParams.get("purchaseTransactionState");
        const safeParamValue = decodeURIComponent(params);	
        const paramenterExtracted = safeParamValue?.toLowerCase();
        if( paramenterExtracted === "success"){     
          // ✅ Extract both values
          const courseCodeId = urlParams.get("courseCodeId");
          const tierId = urlParams.get("tierId");
          // const sessionId = urlParams.get("session_id");
          setActiveCourseCode(courseCodeId);
          setSuccesfulCourseCodeOfPurchasedItem(courseCodeId);
          setSuccesfulPurchasedTierAccess(tierId);          
          setIsSmallConfettiVisible(true);
          setIsModalVisible(true);
          localStorage.removeItem(SHOPPING_PARAMETERS_STORED_KEY);          
        }else if(paramenterExtracted === "cancel"){
          setIsSmallConfettiVisible(false);          
          localStorage.removeItem(SHOPPING_PARAMETERS_STORED_KEY);            
        }else{
          setIsSmallConfettiVisible(false);          
        }
      }
    }, [user?.emailId]);

    useEffect(() => {
        if(purchasedCourseCode && purchasedTierAccess && user?.emailId && isToProceedToSyncPurchasedTiers){            
          onModifyingCourseAccessForUserAfterSuccessfulPurchaseShortcut(purchasedTierAccess, purchasedCourseCode, user.emailId);
          resetState();          
          history.push("/");   
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [user?.emailId, purchasedCourseCode, purchasedTierAccess, isToProceedToSyncPurchasedTiers]);


  const handleCloseModal = () => {    
    setIsToProceedToSyncPurchasedTiers(true);
  };

  const resetState = () => {
    //Local
    setActiveCourseCode("");
    setSuccesfulCourseCodeOfPurchasedItem("");
    setSuccesfulPurchasedTierAccess("");
    setOpen(false);
    setDrawerTier(null);
    setProvidePriceId(null);
    setIsSmallConfettiVisible(false);
    setIsModalVisible(false);
    setIsToProceedToSyncPurchasedTiers(false);
  }

  const handleDirectionModal = () => {
    setIsToProceedToSyncPurchasedTiers(true);
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
		setActiveCourseCode(productCatalog[0].courseCodeId); // first sorted course
	}
	}, [productCatalog]);

  useEffect(() => {
    // You may want to reload products on baseLanguage or course change
    if (baseLanguage?.localeCode && contentLanguage && user?.emailId) {
      onGettingProductsAvailableForPurchase(baseLanguage?.localeCode, contentLanguage, user?.emailId);      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseLanguage, contentLanguage, user?.emailId]);

  // Find the currently active course data from productCatalog
  const activeCourse = productCatalog?.find((c) => c.courseCodeId === activeCourseCode) || { features: [] };

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

  // Dynamically get tier keys from activeCourse.tiers
  const tierKeys = activeCourse.tiers ? Object.keys(activeCourse.tiers) : [];

  // Build table data dynamically from features and tiers
  const data = activeCourse.features.map((feature, idx) => {
    const row = {
      key: String(idx + 1),
      feature: setLocale(locale, feature.feature),
    };
    tierKeys.forEach((tierKey) => {
      row[tierKey] = feature.enabled[tierKey];
    });
    return row;
  });

  // Helper to check if a translation key exists in the current locale messages
  const localeMessages = (window && window.__localeMessages) || {};
  const hasLocaleKey = (key) => {
    // Try to get from Redux if available
    if (props.intl && props.intl.messages) {
      return Object.prototype.hasOwnProperty.call(props.intl.messages, key);
    }
    // Fallback to global
    return Object.prototype.hasOwnProperty.call(localeMessages, key);
  };

  // Build columns dynamically for each tier
  const columns = [
    { title: setLocale(locale, "shop.feature.features"), dataIndex: "feature", key: "feature" },
    ...tierKeys.map((tierKey) => {
      const costKey = `shop.feature.${tierKey}Cost`;
      return {
        title: hasLocaleKey(costKey)
          ? setLocale(locale, costKey)
          : tierKey.charAt(0).toUpperCase() + tierKey.slice(1),
        dataIndex: tierKey,
        key: tierKey,
        align: "center",
        render: (value, record) => renderIcon(record[tierKey]),
      };
    }),
  ];

  const handlePurchase = async (priceId) => {
        {/* Removed extra </Row> here to fix JSX error */}
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
    console.log("precheckoutShop", tierKey, priceId);
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

  // Render tier card for each pricing tier (dynamic)
  const renderTierCard = ({ tierKey, isDisabled, imageUrl, buttonText, featuresForTier, priceId, isPurchased }) => (
    <Card
      hoverable
      title={tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}
      variant="outlined"
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
          type={tierKey === purchasedTier ? "default" : isDisabled ? undefined : "primary"}
          block
          disabled={
            purchasedTier && tierKey !== purchasedTier && activeCourse.tiers[purchasedTier]?.lockOthers
              ? true
              : isDisabled
          }
          onClick={
            !isDisabled &&
            (!purchasedTier || (tierKey !== purchasedTier && !(activeCourse.tiers[purchasedTier]?.lockOthers)))
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

  const coverUrl =
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2304&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Find purchased tier dynamically
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
              animation={purchasedTierAccess === "Gold" ? goldTier : silverTier }
              messageToDisplay={purchasedTierAccess === "Gold" ? <GoldTierProductConfirmationMessage handlePostButtonClick={handleDirectionModal}/> : <ProductPurchasedMessage handlePostButtonClick={handleDirectionModal}/>}
              transitionTimming={1500}
          />
      }

      <Card
        cover={<img alt="Shopping" src={coverUrl} style={{ height: 100, objectFit: "cover" }} />}
        variant="outlined"
      >
        <h1>{setLocale(locale, "shop.feature.compareOurPackages")}</h1>
        <p>{setLocale(locale, "shop.disclaimer")}</p>
      </Card>

      <Tabs
        activeKey={activeCourseCode}
        onChange={(key) => setActiveCourseCode(key)}
        style={{ marginTop: 16 }}
        centered
        items={productCatalog?.map(({ courseCodeId, courseName }) => ({
          key: courseCodeId,
          label: courseName,
        }))}
      />

      <Card variant="outlined" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
          {(() => {
            // Sort tiers by price ascending for star logic
            const sortedTierKeys = [...tierKeys].sort((a, b) => {
              const aPrice = activeCourse.tiers[a]?.priceUsd ?? 0;
              const bPrice = activeCourse.tiers[b]?.priceUsd ?? 0;
              return aPrice - bPrice;
            });
            const badgeColors = ["#00a9fa", "#1890ff", "#f5222d", "#faad14", "#722ed1"];
            return (tierKeys.length === 2
              ? tierKeys.map((tierKey, idx) => {
                  const tierInfo = activeCourse.tiers?.[tierKey];
                  const isDisabled = !tierInfo?.isEnabledForPurchase;
                  const imageUrl = tierInfo?.imageUrl || "";
                  const isPurchased = tierInfo?.isPurchased ?? false;
                  const priceId = tierInfo?.priceId || null;
                  let buttonText = tierKey === purchasedTier
                    ? setLocale(locale, "shop.feature.current")
                    : (tierInfo?.priceUsd === 3 && hasLocaleKey('shop.feature.buy3'))
                      ? setLocale(locale, 'shop.feature.buy3')
                      : (tierInfo?.priceUsd === 5 && hasLocaleKey('shop.feature.buy5'))
                      ? setLocale(locale, 'shop.feature.buy5')
                      : `Buy ${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}`;
                  const tierIndex = sortedTierKeys.indexOf(tierKey);
                  const stars = "⭐".repeat(tierIndex + 1);
                  let badgeText = tierKey === purchasedTier
                    ? setLocale(locale, "shop.feature.purchased")
                    : isPurchased
                      ? setLocale(locale, "shop.feature.included")
                      : tierInfo?.priceUsd
                        ? `${stars} Special Offer $${tierInfo.priceUsd} USD 💵`
                        : `${stars} ${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}`;
                  let badgeColor = tierKey === purchasedTier
                    ? "#00a9fa"
                    : isPurchased
                      ? "#00a9fa"
                      : badgeColors[tierIndex % badgeColors.length];
                  const featuresForTier = data.filter((item) => item[tierKey]);
                  // Center with offset: first card offset 4, second no offset
                  return (
                    <Col xs={24} md={8} offset={idx === 0 ? 4 : 0} key={tierKey}>
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
                })
              : tierKeys.map((tierKey) => {
                  const tierInfo = activeCourse.tiers?.[tierKey];
                  const isDisabled = !tierInfo?.isEnabledForPurchase;
                  const imageUrl = tierInfo?.imageUrl || "";
                  const isPurchased = tierInfo?.isPurchased ?? false;
                  const priceId = tierInfo?.priceId || null;
                  let buttonText = tierKey === purchasedTier
                    ? setLocale(locale, "shop.feature.current")
                    : (tierInfo?.priceUsd === 3 && hasLocaleKey('shop.feature.buy3'))
                      ? setLocale(locale, 'shop.feature.buy3')
                      : (tierInfo?.priceUsd === 5 && hasLocaleKey('shop.feature.buy5'))
                      ? setLocale(locale, 'shop.feature.buy5')
                      : `Buy ${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}`;
                  const tierIndex = sortedTierKeys.indexOf(tierKey);
                  const stars = "⭐".repeat(tierIndex + 1);
                  let badgeText = tierKey === purchasedTier
                    ? setLocale(locale, "shop.feature.purchased")
                    : isPurchased
                      ? setLocale(locale, "shop.feature.included")
                      : tierInfo?.priceUsd
                        ? `${stars} Special Offer $${tierInfo.priceUsd} USD 💵`
                        : `${stars} ${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}`;
                  let badgeColor = tierKey === purchasedTier
                    ? "#52c41a"
                    : isPurchased
                      ? "#00a9fa"
                      : badgeColors[tierIndex % badgeColors.length];
                  const featuresForTier = data.filter((item) => item[tierKey]);
                  return (
                    <Col xs={24} md={Math.max(24 / tierKeys.length, 8)} key={tierKey}>
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
                })
            );
          })()}
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
          drawerTier
            ? `${drawerTier.charAt(0).toUpperCase() + drawerTier.slice(1)} Package${activeCourse.tiers?.[drawerTier]?.priceUsd ? ` $${activeCourse.tiers[drawerTier].priceUsd} USD` : ""}`
            : ""
        }
        placement="bottom"
        closable={false}
        onClose={onCloseDrawer}
        open={open}
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
                  src={activeCourse.tiers?.[drawerTier]?.imageUrl || ""}
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
                src={activeCourse.tiers?.[drawerTier]?.imageUrl || ""}
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
      onGettingProductsAvailableForPurchase,
      onModifyingCourseAccessForUserAfterSuccessfulPurchaseShortcut
    },
    dispatch
  );
}

const mapStateToProps = ({ grant, shop, lrn, theme }) => {
  const { user } = grant;
  const { productCatalog } = shop;
  const { baseLanguage } = lrn;
  const { contentLanguage } = theme;
  return { user, productCatalog, baseLanguage, contentLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopWindow);
