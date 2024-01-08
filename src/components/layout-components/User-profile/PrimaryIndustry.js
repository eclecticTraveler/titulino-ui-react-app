import React from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {onIsToEditUserProfileChange}  from '../../../redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import IntlMessage from "../../util-components/IntlMessage";
import { Row, Col, Card, Form, Button, Select } from 'antd';
const { Option } = Select;

const setLocale = (isLocaleOn, localeKey) =>{		
	return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
}

const PrimaryIndustries = [
	'Home Care',
	'Home Health',
	'Hospice',
	'Skilled Nursing Facilities',
	'Long Term Acute Care',
	'Assisted Living',
	'Inpatient Rehab',
	'Independent Living',
  ];

const PrimaryIndustry = props => {
	const [form] = Form.useForm();
	const { onIsToEditUserProfileChange } = props;	

	form.setFieldsValue({
		primaryIndustry:'Home Care'

	});
		
	const discardChanges = () => {
		onIsToEditUserProfileChange(false);
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
							name="user_primary_industry"
							className="ant-advanced-search-form"
							initialValues={{
							}}
						>
						<Form.Item name="primaryIndustry" label="Select your primary Industry">
							<Select>
						{
							PrimaryIndustries.map(elm => (
								<Option value={elm} key={elm}>
									<span className="text-capitalize font-weight-semibold">{elm}</span>
								</Option>
							))
						}
							</Select>
						</Form.Item>
						<div className="mb-3">
						<Button className="mr-2" onClick={() => discardChanges()}>Discard</Button>
						<Button type="primary" onClick={() => onFinish()} htmlType="submit" >Update</Button>
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
		onIsToEditUserProfileChange: onIsToEditUserProfileChange
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {keycloakRedux, isToEditUserProfile} = lrn;
	return {keycloakRedux, isToEditUserProfile} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PrimaryIndustry));
