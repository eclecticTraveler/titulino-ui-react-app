import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {onShippingKeyTabChange, onIsToEditShippingAddressChange}  from '../../../redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import IntlMessage from "../../util-components/IntlMessage";
import AddressEditableDisplay from "./AddressEditableDisplay";
import AddressDisplay from "./AddressDisplay";

class Address extends Component {

	setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	}	

    componentDidMount() {

	}

	componentDidUpdate() {

	}

	render(){ 
		if(this.props.isToEditShippingAddress){
			return(	
				<div>
					<AddressEditableDisplay/>				
				</div>		
			)
		}
		return (
			<div>
				<AddressDisplay/>
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
	const {shippingTabKey, isToEditShippingAddress} = lrn;
	return {shippingTabKey, isToEditShippingAddress} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Address));
