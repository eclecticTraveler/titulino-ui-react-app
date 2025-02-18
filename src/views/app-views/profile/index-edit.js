import React, {Component} from 'react'
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import { ImageSvg } from '../../../assets/svg/icon';
import {getAllLanguageCourses, setUserCourseConfiguration, setUserSelectedCourse, setUserNativeLanguage}  from '../../../redux/actions/Lrn';
import PageHeaderAlt from '../../../components/layout-components/PageHeaderAlt'
import IconFallback from "../../../components/util-components/IconFallback";
import { withRouter } from "react-router-dom";
import { onLocaleChange, onCourseChange } from '../../../redux/actions/Theme'
import Flex from '../../../components/shared-components/Flex'
import IntlMessage from "../../../components/util-components/IntlMessage";
import Accordion from 'react-bootstrap/Accordion';
import RenderOnlyOnAuthenticated from "../../../components/RenderOnlyOnAuthenticated"
import CustomIcon from '../../../components/util-components/CustomIcon';
import { 
	UserAddOutlined, 
	FileExcelOutlined, 
	PrinterOutlined, 
	PlusOutlined, 
	EllipsisOutlined, 
	StopOutlined, 
	ReloadOutlined,
	EditOutlined,
	SettingOutlined,
	LoadingOutlined
  } from '@ant-design/icons'; 
import { Input, Row, Col, Card, Form, Upload, InputNumber, message, Select } from 'antd';
import AvatarStatus from '../../../components/shared-components/AvatarStatus';
const { Dragger } = Upload;
const { Option } = Select;

class Profile extends Component {


	setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	}	

    componentDidMount() {
	}


	render(){ 
		// If not authenticated then send them back to main
		if(!this.props.authenticated){
			this.props.history.push('/');	
		}
		const imageUploadProps = {
			name: 'file',
			  multiple: true,
			  listType: "picture-card",
			  showUploadList: false,
			action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76'
		  }
		  
		  const beforeUpload = file => {
			const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
			if (!isJpgOrPng) {
			  message.error('You can only upload JPG/PNG file!');
			}
			const isLt2M = file.size / 1024 / 1024 < 2;
			if (!isLt2M) {
			  message.error('Image must smaller than 2MB!');
			}
			return isJpgOrPng && isLt2M;
		  }
		  
		  const categories = ['Cloths', 'Bags', 'Shoes', 'Watches', 'Devices']
		  const tags = ['Cotton', 'Nike', 'Sales', 'Sports', 'Outdoor', 'Toys', 'Hobbies' ]


		const rules = {
		name: [
			{
				required: true,
				message: 'Please enter product name',
			}
		],
		description: [
			{
				required: true,
				message: 'Please enter product description',
			}
		],
		price: [
			{
				required: true,
				message: 'Please enter product price',
			}
		],
		comparePrice: [		
		],
		taxRate: [		
			{
				required: true,
				message: 'Please enter tax rate',
			}
		],
		cost: [		
			{
				required: true,
				message: 'Please enter item cost',
			}
		]
	}

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
		

        return(	
			<div>
				{/* <div className="single-web-account-modal">
				<div className="single-web-account-modal-content">
				<IconFallback path={"/img/mainnav/Experience.svg"} />
				<h1>Profile</h1>						
				</div>
				</div> */}
				{/* <PageHeaderAlt className="border-bottom" overlap>
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
				</PageHeaderAlt> */}
					<Row gutter={16}>
						<Col xs={24} sm={24} md={17}>
							<Card title="Basic Info">
								<Form.Item name="name" label="Product name" rules={rules.name}>
									<Input placeholder="Product Name" />
								</Form.Item>
								<Form.Item name="description" label="Description" rules={rules.description}>
									<Input.TextArea rows={4} />
								</Form.Item>
							</Card>
							<Card title="Pricing">
								<Row gutter={16}>
									<Col xs={24} sm={24} md={12}>
										<Form.Item name="price" label="Price" rules={rules.price}>
										<InputNumber
											className="w-100"
											formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
											parser={value => value.replace(/\$\s?|(,*)/g, '')}
										/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={24} md={12}>
										<Form.Item name="comparePrice" label="Compare price" rules={rules.comparePrice}>
											<InputNumber
												className="w-100"
												value={0}
												formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
												parser={value => value.replace(/\$\s?|(,*)/g, '')}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={24} md={12}>
										<Form.Item name="cost" label="Cost per item" rules={rules.cost}>
											<InputNumber
												className="w-100"
												formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
												parser={value => value.replace(/\$\s?|(,*)/g, '')}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={24} md={12}>
										<Form.Item name="taxRate" label="Tax rate" rules={rules.taxRate}>
											<InputNumber
												className="w-100"
												min={0}
												max={100}
												formatter={value => `${value}%`}
												parser={value => value.replace('%', '')}
											/>
										</Form.Item>
									</Col>
								</Row>
							</Card>
						</Col>
						<Col xs={24} sm={24} md={7}>
							<Card title="Media">
								<Dragger {...imageUploadProps} beforeUpload={beforeUpload} onChange={e=> this.props.handleUploadChange(e)}>
									{
										this.props.uploadedImg ? 
										<img src={this.props.uploadedImg} alt="avatar" className="img-fluid" /> 
										: 
										<div>
											{
												this.props.uploadLoading ? 
												<div>
													<LoadingOutlined className="font-size-xxl text-primary"/>
													<div className="mt-3">Uploading</div>
												</div> 
												: 
												<div>
													<CustomIcon className="display-3" svg={ImageSvg}/>
													<p>Click or drag file to upload</p>
												</div>
											}
										</div>
									}
								</Dragger>
							</Card>
							<Card title="Organization">
								<Form.Item name="category" label="Category" >
									<Select className="w-100" placeholder="Category">
										{
											categories.map(elm => (
												<Option key={elm} value={elm}>{elm}</Option>
											))
										}
									</Select>
								</Form.Item>
								<Form.Item name="tags" label="Tags" >
								<Select mode="tags" style={{ width: '100%' }} placeholder="Tags">
									{tags.map(elm => <Option key={elm}>{elm}</Option>)}
								</Select>
								</Form.Item>
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
	const {languageCourses, nativeLanguage} = lrn;
	return {languageCourses, nativeLanguage} 
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile));
