import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {onShippingKeyTabChange, onIsToEditShippingAddressChange, onIsToEditUserProfileChange, onAddressRequestLoad}  from '../../../redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import IntlMessage from "../../../components/util-components/IntlMessage";
import Address from "../../../components/layout-components/User-profile/Address";
import BillingView from "../../../components/layout-components/User-profile/BillingView";
import PrimaryIndustry from "../../../components/layout-components/User-profile/PrimaryIndustry";
import { 
	EllipsisOutlined, 
  } from '@ant-design/icons'; 
import { Row, Col, Card, Dropdown } from 'antd';
const { Meta } = Card;

class Profile extends Component {

	setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	}	

    componentDidMount() {
		this.props.onAddressRequestLoad()
	}

	cardDropdown = (menu) => (
		<Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
		  <a href="/#" className="text-gray font-size-lg" onClick={e => e.preventDefault()}>
			<EllipsisOutlined />
		  </a>
		</Dropdown>
	  )

	render(){ 
		// If not authenticated then send them back to main
		if(!this.props.keycloakRedux.authenticated){
			this.props.history.push('/');	
		}

		  // we will pass the type of address through redux rather than through component props
		  const shippingContentList = {
			physical: <Address/>,
			shipping: <Address/>,
			billing: <BillingView/>,
			mailing: <Address/>,
		  };

        return(	
			<div>
				<div className="container customerName" >
				<Row gutter={16}>	
					<Col lg={8}>			
						<Card bordered={true}>
						<h1>User Profile</h1>		
							<Card bordered={false}
								cover={
									<img
									alt="company logo"
									src="https://info.homecarepulse.com/hubfs/Inform%20Letter%20Templates/Caregiver_XM.png"
									/>
								}>
									<Meta title="Username" description="here goes the username" />
									<br/>
									<Meta title="Registered Email" description="temp@temp.com" />
							</Card>
						</Card>
					</Col>
					<Col lg={16}>
					<Card title="General Information"  style={{ width: '100%' }} 
						  actions={[																				
							!this.props.isToEditUserProfile ? <span onClick={() => this.props.onIsToEditUserProfileChange(true)}>EDIT</span> : <span></span>,
							]}>


						<Card bordered={false}>							
							{!this.props.isToEditUserProfile ? <Meta title="Primary Industry" description="Home care" /> : <PrimaryIndustry />}
							<br/>
							<Meta title="Company Name" description="Fallen Angels" />
						</Card>
					</Card>
					<Card title="Addresses on File" bordered={true} >
						<Card							
							tabList={this.props.tabIndexedAddresses}
							activeTabKey={this.props.shippingTabKey}
							onTabChange={key => {
								this.props.onShippingKeyTabChange(key);
							}}
							actions={[
								(!this.props.isToEditShippingAddress && this.props.shippingTabKey !== "billing") ? <span onClick={() => this.props.onIsToEditShippingAddressChange(true)}>EDIT</span> : <span></span>,
								]}
							>
							{shippingContentList[this.props.shippingTabKey]}
							
							</Card>
						</Card>

					</Col>
				</Row>
				</div>
				
			</div>		
		)
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		onShippingKeyTabChange: onShippingKeyTabChange,
		onIsToEditShippingAddressChange: onIsToEditShippingAddressChange,
		onIsToEditUserProfileChange: onIsToEditUserProfileChange,
		onAddressRequestLoad: onAddressRequestLoad
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {keycloakRedux, shippingTabKey, isToEditShippingAddress, isToEditUserProfile, userAddresses, tabIndexedAddresses} = lrn;
	return {keycloakRedux, shippingTabKey, isToEditShippingAddress, isToEditUserProfile, userAddresses, tabIndexedAddresses} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
