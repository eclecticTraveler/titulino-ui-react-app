import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {getAllLanguageCourses, setUserCourseConfiguration, setUserSelectedCourse, setUserNativeLanguage}  from '../../../redux/actions/Lrn';
import IconFallback from "../../../components/util-components/IconFallback";
import { withRouter } from "react-router-dom";
import { onLocaleChange, onCourseChange } from '../../../redux/actions/Theme'
import IntlMessage from "../../../components/util-components/IntlMessage";
import Accordion from 'react-bootstrap/Accordion';
import RenderOnlyOnAuthenticated from "../../../components/RenderOnlyOnAuthenticated"
import { 
	UserAddOutlined, 
	FileExcelOutlined, 
	PrinterOutlined, 
	PlusOutlined, 
	EllipsisOutlined, 
	StopOutlined, 
	ReloadOutlined,
	EditOutlined,
	SettingOutlined
  } from '@ant-design/icons'; 
import { Row, Col, Button, Card, Avatar, Dropdown, Table, Menu, Tag } from 'antd';
import AvatarStatus from '../../../components/shared-components/AvatarStatus';
const { Meta } = Card;

class Profile extends Component {


	setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	}	

    componentDidMount() {
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

		const latestTransactionOption = (
			<Menu>
			  <Menu.Item key="0">
				<span>
				  <div className="d-flex align-items-center">
					<ReloadOutlined />
					<span className="ml-2">Refresh</span>
				  </div>
				</span>
			  </Menu.Item>
			  <Menu.Item key="1">
				<span>
				  <div className="d-flex align-items-center">
					<PrinterOutlined />
					<span className="ml-2">Print</span>
				  </div>
				</span>
			  </Menu.Item>
			  <Menu.Item key="12">
				<span>
				  <div className="d-flex align-items-center">
					<FileExcelOutlined />
					<span className="ml-2">Export</span>
				  </div>
				</span>
			  </Menu.Item>
			</Menu>
		  );

		const NewMembersData = [{
			img: "/img/avatars/thumb-2.jpg",
			title: "Software Engineer",
			name: "Terrance Moreno",
		},
		{
			img: "/img/avatars/thumb-3.jpg",
			title: "UI/UX Designer",
			name: "Ron Vargas",
		},
		{
			img: "/img/avatars/thumb-4.jpg",
			title: "HR Executive",
			name: "Luke Cook",
		},
		{
			img: "/img/avatars/thumb-5.jpg",
			title: "Frontend Developer",
			name: "Joyce Freeman",
		},
		{
			img: "/img/avatars/thumb-6.jpg",
			title: "Compliance Manager",
			name: "Samantha Phillips",
		}]
		const newJoinMemberOption = (
			<Menu>
			  <Menu.Item key="0">
				<span>
				  <div className="d-flex align-items-center">
					<PlusOutlined />
					<span className="ml-2">Add all</span>
				  </div>
				</span>
			  </Menu.Item>
			  <Menu.Item key="1">
				<span>
				  <div className="d-flex align-items-center">
					<StopOutlined />
					<span className="ml-2">Disable all</span>
				  </div>
				</span>
			  </Menu.Item>
			</Menu>
		  )

        return(	
			<div>
				{/* <div className="single-web-account-modal">
				<div className="single-web-account-modal-content">
				<IconFallback path={"/img/mainnav/Experience.svg"} />
				<h1>Profile</h1>						
				</div>
				</div> */}
				<Row gutter={16}>
					<Col xs={24} sm={24} md={24} lg={7}>
						<Card title="Profile" hoverable
    					cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}>
							<h2>Hello World card 1</h2>
							<Meta title="Hello World card" description="Hello World!!" />
						</Card>
					</Col>
					<Col xs={24} sm={24} md={24} lg={17}>					
						<Card title="Industry" hoverable extra={this.cardDropdown(newJoinMemberOption)}>
							<h2>Industry </h2>
						</Card>
						<Card title="Addresses" extra={this.cardDropdown(newJoinMemberOption)}>
							<Row gutter={16}>
								<Col lg={8}>
									<Card title="Address 1" hoverable extra={this.cardDropdown(newJoinMemberOption)}>
									<h2>Address 1 </h2>
									</Card>
								</Col>
								<Col lg={8}>
									<Card title="Address 2" hoverable extra={this.cardDropdown(newJoinMemberOption)}>
									<h2>Address 2 </h2>
									</Card>
								</Col>
								<Col lg={8}>
									<Card title="Address 3" hoverable actions={[
										<SettingOutlined key="setting" />,
										<EditOutlined key="edit" />,
										this.cardDropdown(newJoinMemberOption),
										]}>
									<h2>Address 3 </h2>
									<Meta
									avatar={
									<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
									}
									title="Card title"
									description="This is the description"
									/>
									</Card>
								</Col>
							</Row>
						</Card>
					</Col>
				</Row>
			</div>		
		)
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		setUserCourseConfiguration: setUserCourseConfiguration,
		getAllLanguageCourses: getAllLanguageCourses,
		setUserSelectedCourse: setUserSelectedCourse,
		onCourseChange: onCourseChange,
		setUserNativeLanguage: setUserNativeLanguage,
		onLocaleChange: onLocaleChange
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {languageCourses, nativeLanguage, keycloakRedux} = lrn;
	return {languageCourses, nativeLanguage, keycloakRedux} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
