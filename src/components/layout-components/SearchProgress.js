import React, { useState, useEffect } from "react";
import { onSearchingForProgressByEmailId } from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Input, Button, Form, Row, Col, Divider, message } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

export const SearchProgress = (props) => {
  const { onSearchingForProgressByEmailId, registeredProgressByEmailId, nativeLanguage } = props;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  console.log("nativeLanguage", nativeLanguage)
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	  }

  // Trigger the search and set loading to true
  const handleSearch = () => {
    if (!email) {
      message.warning(setLocale(locale, "resources.myprogress.enterEmail"));
      return;
    }
    
    setLoading(true);
    onSearchingForProgressByEmailId(email);  // Dispatch Redux action
  };

  // React to changes in registeredProgressByEmailId and stop the loading indicator
  useEffect(() => {
    if (registeredProgressByEmailId) {
      setLoading(false);
    }
  }, [registeredProgressByEmailId]);

  const renderResults = () => {
    if (!registeredProgressByEmailId || registeredProgressByEmailId?.length === 0) {
      return <div>{setLocale(locale, "resources.myprogress.noRecordsFound")}</div>;
    }

    return (
      <>
        <div>{setLocale(locale, "resources.myprogress.requirements")}</div>
        < br />
        <div>{registeredProgressByEmailId?.length} {setLocale(locale, "resources.myprogress.recordsFound")}.</div>
        <Row gutter={[16, 16]}>
          {registeredProgressByEmailId?.map((record, index) => (
            <Col key={index} xs={24} sm={12} lg={8}>
              <Card title={`Class: ${record?.Class}`} bordered>
              <h5><strong>{setLocale(locale, "resources.myprogress.participation")}:</strong> {record?.TypeOfParticipation}</h5>
                <p><strong>{setLocale(locale, "resources.myprogress.email")}:</strong> {record?.EmailAddress}</p>
                <p>  <strong>{setLocale(locale, "resources.myprogress.date")}:</strong> {new Date(record?.Date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  return (
<div className="search-container">
  <Card title={setLocale(locale, "resources.myprogress.title")} bordered>
    <Form layout="inline" onFinish={handleSearch}>
      <Form.Item>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
        {setLocale(locale, "resources.myprogress.search")}
        </Button>
      </Form.Item>
    </Form>

    <Divider />

    {renderResults()}
  </Card>
</div>

  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onSearchingForProgressByEmailId: onSearchingForProgressByEmailId
  }, dispatch);
}

const mapStateToProps = ({ lrn }) => {
  const { registeredProgressByEmailId, nativeLanguage } = lrn;
  return { registeredProgressByEmailId, nativeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchProgress);
