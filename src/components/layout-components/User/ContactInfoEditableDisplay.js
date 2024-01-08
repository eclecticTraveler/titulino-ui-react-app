import React from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import { onSelectingCorrectionToEdit, onCorrectionsModalChange } from 'redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import { Input, Row, Col, Card, Form, Button, message } from 'antd';
import { 
    ContactsOutlined,
    PhoneOutlined, 
    MailOutlined, 
    UsergroupAddOutlined, 
  } from '@ant-design/icons';

const ContactInfoEditableDisplay = props => {
	const [form] = Form.useForm();
	const { selectedCorrectionRecord } = props;	

    let corrections = [];

    const phones = selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Phone?.map((p, i) => ({
        [`phone${p.ContactPhonePriority}`]: p.PhoneId_Rfc3966
    }))

    const emails = selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Email?.map((e, i) => ({
        [`email${e.ContactEmailPriority}`]: e.EmailId
    }))

    const contactInfo = {
        firstName: selectedCorrectionRecord?.firstName,
        lastName: selectedCorrectionRecord?.lastName,
        language: selectedCorrectionRecord?.fullCorrectionObj?.Contact?.LanguageId
	}

    // Transform array into single object for emails and phones
    let flattedEmails = emails?.reduce(((r, c) => Object.assign(r, c)), {});
    let flattedPhones = phones?.reduce(((r, c) => Object.assign(r, c)), {});
    corrections.push(contactInfo, flattedEmails, flattedPhones);

    //  Make everything into one big single Object.
    let selectedCorrectionFields = corrections.reduce(((r, c) => Object.assign(r, c)), {});

    // Add them to the form to be prefilled
    form.setFieldsValue(selectedCorrectionFields );

		const rules = {
			firstName: [
				{
					required: true,
					message: 'Please enter Contact\'s First Name',
				}
			],
			lastName: [
				{
					required: true,
					message: 'Please enter Contact\'s Last Name',
				}
			],
            phones: [
                {
                    required: true,
                    message: 'Please enter Contact\'s primary phone number'
                }
            ],
            emails: [
                {
                    required: true,
                    message: 'Please enter Contact\'s primary email address'
                }
            ]
	}

	const onFinish = () => {
		// setSubmitLoading(true)
		// form.validateFields().then(values => {
		// 	setTimeout(() => {
		// 		setSubmitLoading(false)
		// 		message.success(`Address updated`);
		// 	}, 1500);
		// }).catch(info => {
		// 	setSubmitLoading(false)
		// 	console.log('info', info)
		// 	message.error('Please enter all required field ');
		// });
	};

    const discardChanges = () => {

    };
	return(	
		<div>
            <Form
                layout="vertical"
                form={form}
                name="user_corrections"
                className="ant-advanced-search-form corrections-form"
                initialValues={{
                }}
            >
                <Row>
                    <Col span={12}>
                        <Card bordered={false}>
                            <h2><ContactsOutlined />{` ${selectedCorrectionRecord?.fullCorrectionObj?.ContactTerm?.ContactRelationId} Info:`}</h2>                
                            <div>First Name*</div>
                            <Form.Item name="firstName" rules={rules.firstName}>
                                <Input placeholder="Contact First Name" />
                            </Form.Item>
                            <div>Last Name*</div>
                            <Form.Item name="lastName" rules={rules.lastName}>								
                                <Input placeholder="Contact First Name" />
                            </Form.Item>
                            <div>Language</div>
                            <Form.Item name="language">								
                                <Input placeholder="Contact Primary Language" />
                            </Form.Item>
                            <br/>  
                            <h2><PhoneOutlined />{` Phones:`}</h2>
                            {
                                selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Phone?.map((phone, index) =>
                                    <div>
                                        <div>Priority # {phone.ContactPhonePriority}</div>
                                        <Form.Item name={`phone${phone.ContactPhonePriority}`} rules={phone.ContactPhonePriority === 1 ? rules.phones : ''}>								
                                            <Input placeholder={`Contact Phone #${phone.ContactPhonePriority}`} />
                                        </Form.Item>
                                    </div>
                                )
                            }
                            <br/>      
                            <h2><MailOutlined />{` Emails:`}</h2>
                            {
                                selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Email?.map((email, index) =>
                                    <div>
                                        <div>Priority # {email.ContactEmailPriority}</div>
                                        <Form.Item name={`email${email.ContactEmailPriority}`} rules={email.ContactEmailPriority === 1 ? rules.emails : ''}>								
                                            <Input placeholder={`Contact Email #${email.ContactEmailPriority}`} />
                                        </Form.Item>           
                                    </div>
                                )
                            }
                            <div className="mb-3">
                            <Button className="mr-2" onClick={() => discardChanges()}>Discard</Button>
                            <Button type="primary" onClick={() => onFinish()} htmlType="submit" >
                                Update
                            </Button>
                            </div> 		
                        </Card>                    
                    </Col>
                    {/* <Col span={12} >
                        <Card bordered={false}>
                            <h2><ContactsOutlined />{` ${selectedCorrectionRecord?.fullCorrectionObj?.ContactTerm?.ContactRelationId} Info:`}</h2>
                        
                            <div>First Name*</div>
                            <Form.Item name="firstName" rules={rules.firstName}>
                                <Input placeholder="Contact First Name" />
                            </Form.Item>
                            <div>Last Name*</div>
                            <Form.Item name="lastName" rules={rules.lastName}>								
                                <Input placeholder="Contact First Name" />
                            </Form.Item>
                            <div>Language</div>
                            <Form.Item name="language">								
                                <Input placeholder="Contact Primary Language" />
                            </Form.Item>
                            <br/>  
                            <h2><PhoneOutlined />{` Phones:`}</h2>
                            {
                                selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Phone?.map((phone, index) =>
                                    <div>
                                        <div>Priority # {phone.ContactPhonePriority}</div>
                                        <Form.Item name={`phone${phone.ContactPhonePriority}`} rules={phone.ContactPhonePriority === 1 ? rules.phones : ''}>								
                                            <Input placeholder={`Contact Phone #${phone.ContactPhonePriority}`} />
                                        </Form.Item>
                                    </div>
                                )
                            }
                            <br/>      
                            <h2><MailOutlined />{` Emails:`}</h2>
                            {
                                selectedCorrectionRecord?.fullCorrectionObj?.Contact?.Contact_Email?.map((email, index) =>
                                    <div>
                                        <div>Priority # {email.ContactEmailPriority}</div>
                                        <Form.Item name={`email${email.ContactEmailPriority}`} rules={email.ContactEmailPriority === 1 ? rules.emails : ''}>								
                                            <Input placeholder={`Contact Email #${email.ContactEmailPriority}`} />
                                        </Form.Item>           
                                    </div>
                                )
                            }
                            {/* <div className="mb-3">
                            <Button className="mr-2" onClick={() => discardChanges()}>Discard</Button>
                            <Button type="primary" onClick={() => onFinish()} htmlType="submit" >
                                Update
                            </Button>
                            </div> */}					
                        {/* </Card>                     */}
                    {/* </Col>						 */}
                </Row>
            </Form>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ContactInfoEditableDisplay));
