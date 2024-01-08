import React from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import { onSelectingCorrectionToEdit, onCorrectionsModalChange } from 'redux/actions/Lrn';
import { withRouter } from "react-router-dom";
import ContactInfoDisplay from './ContactInfoDisplay';
import ContactInfoEditableDisplay from './ContactInfoEditableDisplay';
import { Modal } from 'antd';

const AbstractContactModalForm = props => {	
    const { selectedCorrectionRecord, isCorrectionModalOpened, onSelectingCorrectionToEdit, onCorrectionsModalChange, isToEditContent, match } = props;

	  const handleOk = () => {
		onSelectingCorrectionToEdit(selectedCorrectionRecord);
		onCorrectionsModalChange(false);
	  };
	
	  const handleCancel = () => {
		onCorrectionsModalChange(false);
	  };

	const modalTitle = isToEditContent ? `Edit ${match?.params?.relationType} Information` : `${match?.params?.relationType} Information`;
	return(	
		<div>
			<Modal title={modalTitle} visible={isCorrectionModalOpened} onOk={handleOk} onCancel={handleCancel} width={1000} footer={null}>
				{
					isToEditContent ? 
					<ContactInfoEditableDisplay/>
					:
					<ContactInfoDisplay/>
				}				
      		</Modal>
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
	const {selectedCorrectionRecord, isCorrectionModalOpened } = lrn;
	return {selectedCorrectionRecord, isCorrectionModalOpened} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AbstractContactModalForm));
