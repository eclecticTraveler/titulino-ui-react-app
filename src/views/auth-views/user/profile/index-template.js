import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {getAllLanguageCourses, setUserCourseConfiguration, setUserNativeLanguage}  from '../../../../redux/actions/Lrn';
import PageHeaderAlt from '../../../../components/layout-components/PageHeaderAlt'
import IconFallback from "../../../../components/util-components/IconFallback";
import { withRouter } from "react-router-dom";
import { onLocaleChange, onCourseChange } from '../../../../redux/actions/Theme'
import Flex from '../../../../components/shared-components/Flex'
import IntlMessage from "../../../../components/util-components/IntlMessage";
import Accordion from 'react-bootstrap/Accordion';
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
import AvatarStatus from '../../../../components/shared-components/AvatarStatus';
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
		if(!this.props.authenticated){
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

		  const tabListNoTitle = [
			{
			  key: 'article',
			  tab: 'article',
			},
			{
			  key: 'app',
			  tab: 'app',
			},
			{
			  key: 'project',
			  tab: 'project',
			},
		  ];

		  const contentListNoTitle = {
			article: <p>article content</p>,
			app: <p>app content</p>,
			project: <p>project content</p>,
		  };

        return(	
			<div>
				{/* <div className="single-web-account-modal">
				<div className="single-web-account-modal-content">
				<IconFallback path={"/img/mainnav/Experience.svg"} />
				<h1>Profile</h1>						
				</div>
				</div> */}
								<div className="container">
	

				<Row gutter={16}>				
				<Card className="border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-3">"Add New Product" </h2>
							<div className="mb-3">
								<Button className="mr-2">Discard</Button>
								<Button type="primary">
									Add
								</Button>
							</div>
						</Flex>
					</div>
				</Card>

					<Col lg={8}>
						<Card title="Card title" bordered={true}>
						Card content
						
							<Card type="inner" title="Inner Card title" actions={[
								<SettingOutlined key="setting" />,
								<EditOutlined key="edit" />,
								<EllipsisOutlined key="ellipsis" />,
								]}
								cover={
									<img
									  alt="example"
									  src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
									/>
								  }>
							Inner Card content

							</Card>
							<Card
							style={{ marginTop: 16 }}
							type="inner"
							title="Inner Card title"
							extra={<a href="#">More</a>}
							>
							Inner Card content
							</Card>
						</Card>
					</Col>
					<Col lg={8}>
						<Card title="Card title" bordered={true}>
						Card content
						</Card>
						<Card title="Card title" bordered={true}>
							<Card
							style={{ width: '100%' }}
							tabList={tabListNoTitle}
							activeTabKey={this.noTitleKey}
							onTabChange={key => {
								this.onTabChange(key, 'noTitleKey');
							}}
							>
							{/* {contentListNoTitle[this.state.noTitleKey]} */}
							</Card>
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Card title" bordered={true}>
						Card content
							<Card
							style={{ width: '100%' }}
							tabList={tabListNoTitle}
							activeTabKey={this.noTitleKey}
							onTabChange={key => {
								this.onTabChange(key, 'noTitleKey');
							}}
							>
							{contentListNoTitle["article"]}
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
		setUserCourseConfiguration: setUserCourseConfiguration,
		getAllLanguageCourses: getAllLanguageCourses,
		onCourseChange: onCourseChange,
		setUserNativeLanguage: setUserNativeLanguage,
		onLocaleChange: onLocaleChange
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {languageCourses, nativeLanguage} = lrn;
	return {languageCourses, nativeLanguage} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
