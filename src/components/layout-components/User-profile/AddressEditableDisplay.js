import React from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {onIsToEditShippingAddressChange}  from '../../../redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import IntlMessage from "../../util-components/IntlMessage";
import { Input, Row, Col, Card, Form, Upload, Button } from 'antd';
const { Dragger } = Upload;

const setLocale = (isLocaleOn, localeKey) =>{		
	return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
}


const AddressEditableDisplay = props => {
	const [form] = Form.useForm();
	const { onIsToEditShippingAddressChange, userAddresses, shippingTabKey } = props;	
	const selectedAddress = userAddresses?.find(a => a.AddressTypeId?.toLowerCase() === shippingTabKey);

	form.setFieldsValue({
		address1:selectedAddress?.Address1,
		address2:selectedAddress?.Address2,
		city: selectedAddress?.City,
		state: selectedAddress?.CountryDivisionId,
		zip: selectedAddress?.PostalCodeId

	});
		
		const rules = {
			address1: [
				{
					required: true,
					message: 'Please enter street information',
				}
			],
			city: [
				{
					required: true,
					message: 'Please enter city information',
				}
			],
			state: [
				{
					required: true,
					message: 'Please enter state information',
				}
			],		
			zip: [		
				{
					required: true,
					message: 'Please enter zip information',
				}
			]
	}

	const discardChanges = () => {
		onIsToEditShippingAddressChange(false);
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

	return(	
		<div>
			<Row gutter={16}>
				<Col xs={24} sm={24} md={17}>
					<Card bordered={false}>
						<Form
							layout="vertical"
							form={form}
							name="user_addresses"
							className="ant-advanced-search-form"
							initialValues={{
							}}
						>
						<div>Street address 1:</div>
						<Form.Item name="address1" rules={rules.address1}>
							<Input placeholder="Address #1" />
						</Form.Item>
						<div>Street address 2 (optional):</div>
						<Form.Item name="address2">								
							<Input placeholder="Address #2 (optional)" />
						</Form.Item>
						<div>City:</div>
						<Form.Item name="city" rules={rules.city}>								
							<Input placeholder="City" />
						</Form.Item>
						<div>State:</div>
						<Form.Item name="state" rules={rules.state}>
							<Input placeholder="State" />
						</Form.Item>
						<div>Zip-Code:</div>
						<Form.Item name="zip" rules={rules.zip}>								
							<Input placeholder="Zip code" />
						</Form.Item>
						<div className="mb-3">
						<Button className="mr-2" onClick={() => discardChanges()}>Discard</Button>
						<Button type="primary" onClick={() => onFinish()} htmlType="submit" >
							Update
						</Button>
					</div>
					</Form>
					</Card>
				</Col>						
			</Row>
		</div>		
	)
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		onIsToEditShippingAddressChange: onIsToEditShippingAddressChange
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {isToEditShippingAddress, shippingTabKey, userAddresses} = lrn;
	return {isToEditShippingAddress, shippingTabKey, userAddresses} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AddressEditableDisplay));
