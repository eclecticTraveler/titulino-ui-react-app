import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {onShippingKeyTabChange, onIsToEditShippingAddressChange}  from '../../../redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import IntlMessage from "../../util-components/IntlMessage";
import { Row, Col, Card } from 'antd';

class AddressDisplay extends Component {

	setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	}	

    componentDidMount() {
	}

	render(){ 
		const selectedAddress = this.props.userAddresses?.find(a => a.AddressTypeId?.toLowerCase() === this.props.shippingTabKey);
		return (
			<div>
				<Row gutter={16}>
					<Col xs={24} sm={24} md={17}>
					<Card bordered={false}>
						<h4>{selectedAddress?.Address1}</h4>
						{selectedAddress?.Address2 && <h4>{selectedAddress?.Address2}</h4>}
						<h4>{`${selectedAddress?.City}, ${selectedAddress?.CountryDivisionId}, ${selectedAddress?.PostalCodeId}`}</h4>
						<h4>{selectedAddress?.CountryId}</h4>
					</Card>
					</Col>						
				</Row>
			</div>
		)
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		onShippingKeyTabChange: onShippingKeyTabChange,
		onIsToEditShippingAddressChange: onIsToEditShippingAddressChange
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {shippingTabKey, isToEditShippingAddress, userAddresses} = lrn;
	return {shippingTabKey, isToEditShippingAddress, userAddresses} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AddressDisplay));
