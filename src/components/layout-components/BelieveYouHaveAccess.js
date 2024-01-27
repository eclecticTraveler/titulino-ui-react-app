import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';

class BelieveYouHaveAccess extends Component {

    displayLogInModal = () => {
       this.props.isTodisplayTrainingLoging = !this.props.isTodisplayTrainingLoging;
       this.props.displayTrainingLoginModal(this.props.isTodisplayTrainingLoging);
	};

    render(){
        return (
            <div>
                <div className="wrap-collabsible">
                <input id="collapsible" className="toggle" type="checkbox"></input>
                <label for="collapsible" className="lbl-toggle have-access">Do you believe you have access to this tool?</label>
                <div className="collapsible-content">
                <div className="content-inner">
                    <div className="have-access-solutions-container">
                        <div className="have-access-solutions">
                            <div>
                                <p>&#8226; Follow <a href="" target="_blank">this link</a> to login directly</p>
                            </div>
                            <div>
                                <p>&#8226; Send us an email to <a href="mailto:customersupport@.com">customersupport@.com</a></p>
                            </div> 
                            <div>
                                <p>OR</p>
                            </div>
                            <div>
                                <p className="inTheKnow-Login-link" onClick={() => this.displayLogInModal()}>&#8226; Click <span className="inTheKnow-Login-here">here</span> to enter your <strong>InTheKnow</strong> credentials</p>
                            </div>                  
                        </div>    
                    </div>
                </div>
                </div>
                </div>
            </div>
    );
  }
}

  function mapDispatchToProps(dispatch){
	return bindActionCreators({

	}, dispatch)
}

const mapStateToProps = ({}) => {
	// const {} = lrn ;
	// return {} 
};

export default connect(mapStateToProps, mapDispatchToProps)(BelieveYouHaveAccess);

