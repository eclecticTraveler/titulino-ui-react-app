import React from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import { onSelectingCorrectionToEdit, onCorrectionsModalChange } from 'redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import { 
    ContactsOutlined,
    PhoneOutlined, 
    MailOutlined, 
    UsergroupAddOutlined, 
    QuestionCircleOutlined, 
    LogoutOutlined,
    CloudUploadOutlined,
    SwapOutlined
  } from '@ant-design/icons';
import { Input, Row, Col, Card, Form, Button } from 'antd';

const ContactInfoDisplay = props => {
	const { selectedCorrectionRecord } = props;	
    console.log("------------->tatatata");
    console.log(selectedCorrectionRecord);

    return (
        <div>
            <Row gutter={16}>
                <Col xs={24} sm={24} md={17}>
                <Card bordered={false}>
                    <h2><ContactsOutlined />{` ${selectedCorrectionRecord?.fullCorrectionObj?.ContactTerm?.ContactRelationId} Info:`}</h2>
                    <div>First Name*</div>
                    <h4>{selectedCorrectionRecord?.firstName}</h4>
                    <div>Last Name*</div>
                    <h4>{selectedCorrectionRecord?.lastName}</h4>    
                    <div>Language</div>              
                    <h4>{selectedCorrectionRecord?.fullCorrectionObj?.Contact?.LanguageId}</h4>
                    <br/>      
                    <h2><PhoneOutlined />{` Phones:`}</h2>
                        {
                            selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Phone?.map((phone, index) =>
                                <span key={index}>
                                    <div>Priority # {phone.ContactPhonePriority}</div>
                                    <h4>{phone.PhoneId_Rfc3966}</h4>
                                </span>
                            )
                        }
                                        <br/>      
                    <h2><MailOutlined />{` Emails:`}</h2>
                        {
                            selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Email?.map((email, index) =>
                                <span key={index}>
                                    <div>Priority # {email.ContactEmailPriority}</div>
                                    <h4>{email.EmailId}</h4>
                                </span>
                            )
                        }
                    <br/>    
                    <h2><UsergroupAddOutlined />Responsable Party</h2>
                    {
                        selectedCorrectionRecord?.fullCorrectionObj?.Contact?.IsRespondentRequired ? (
                            <h4>There is a responsable party we need to add info here</h4>
                        ) : (
                            <h4>There is no responsable party for this contact</h4>
                        )
                    }                                      
                    
                    {/* <h4>{selectedAddress?.Address1}</h4>
                    {selectedAddress?.Address2 && <h4>{selectedAddress?.Address2}</h4>}
                    <h4>{`${selectedAddress?.City}, ${selectedAddress?.CountryDivisionId}, ${selectedAddress?.PostalCodeId}`}</h4>
                    <h4>{selectedAddress?.CountryId}</h4> */}

                </Card>
                </Col>						
            </Row>
        </div>
    )
	
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
        onSelectingCorrectionToEdit: onSelectingCorrectionToEdit,
		onCorrectionsModalChange: onCorrectionsModalChange
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {selectedCorrectionRecord } = lrn;
	return {selectedCorrectionRecord } 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ContactInfoDisplay));
