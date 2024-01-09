import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import { onDummyDataLoad, onRequestingGraphForLandingDashboard } from 'redux/actions/Lrn';
import { Menu, Dropdown, Button, message, Tooltip, Row, Col, Card, Tabs, Table, DatePicker, Space} from 'antd';
import { DownOutlined, ApartmentOutlined, UserOutlined, HomeOutlined, AuditOutlined, CalendarOutlined } from '@ant-design/icons';
import InternalIFrame from '../../../../src/components/layout-components/InternalIFrame';
import AbstractTable from '../../../components/shared-components/Table/AbstractTable';
import Loading from '../../../components/shared-components/Loading';
import { Column } from "@ant-design/plots";


const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Meta } = Card;


class CourseLevel extends Component {

  onChange = (date, dateString) => {
    console.log(date, dateString);
    alert(date);
  };


  getContactRelationshipType = (param) => {
    if(param?.toString().toLowerCase() === "clients"){
        return "Client"
    }else if (param?.toString().toLowerCase() === "caregivers"){
        return "Caregiver"
    }else{
        return "Caregiver";
    }
}

    componentDidMount() {                
        this.props.onDummyDataLoad(); 
        this.props.onRequestingGraphForLandingDashboard();
    }

    handleButtonClick = (e) => {
        console.log(e)
        if(e.domEvent.target.outerText){
            message.info(`${e.domEvent.target.outerText} is currently selected`);
        }else{
            message.info('Please select location agency');
        }
      }
      
    handleMenuClick = (e) => {
        message.info('This Region was selected');
        console.log('E', e);
        console.log('Key', e.key);   
        console.log('outerText', e.domEvent.target.outerText);
        
      }

    handleClick = (e) => {
        message.info('This handleClick was selected');
        console.log('clicckk', e);
        console.log('click', e.key); 
   
      }

    loadDashboard = () => {
          message.info('Loading ')
      }

    render() {
        console.log("this.props*************")
     
    
       console.log(this.props.graphData);

       const contactRelations = [
        {
          label: '1st menu item',
          key: '1',
          icon: <UserOutlined />,
        },
        {
          label: '2nd menu item',
          key: '2',
          icon: <UserOutlined />,
        },
        {
          label: '3rd menu item',
          key: '3',
          icon: <UserOutlined />,
        },
      ];

      const items = [
        {
          label: '1st menu item',
          key: '1',
          icon: <UserOutlined />,
        },
        {
          label: '2nd menu item',
          key: '2',
          icon: <UserOutlined />,
        },
        {
          label: '3rd menu item',
          key: '3',
          icon: <UserOutlined />,
        },
      ];
     

        // const locations = [];
        // // const companyGroups = 

        // const links = {};

        // const menuTabs = [...Array(2).keys()].map(i => (            
        //     <TabPane tab={`Tab-${i}`} key={i}>
        //         <Suspense>
        //              <div id="exago-report-container-id">
        //              Content of tab {i}
        //                  {/* <InternalIFrame iFrameUrl={`https://www.youtube.com/embed/tgbNymZ7vqY`}/> */}
        //             </div>
        //         </Suspense>  
        //     </TabPane>
        // ))

        
        // const items = [
        //     { label: 'item 1 label', key: 'item-1', title:'dolor' },
        //     { label: 'item 2 label', key: 'item-2', disabled:false }, 
        //     { label: 'item 4 label', key: 'item-4', disabled:false, icon: null, children: null }, 
        //     {
        //       label: 'sub menu',
        //       key: 'submenu',
        //       icon: <ApartmentOutlined />,
        //       onTitleClick: this.handleMenuClick,
        //       children: [{ label: 'item 3', key: 'submenu-item-1' }]
        
        //     },
        //   ];
          
        const menu = (
            <Menu items={items} onClick={this.handleMenuClick}>  
            </Menu>
          );

        //   .ant-dropdown-menu {
        //     max-height: 250px;
        //     overflow: auto;
        // }
        
        // .locations-layout-start {
        //     float: left;
        // }
        
        // .locations-layout {
        //     float: left;
        //     margin-left: 25px;
        // }
        
        // .locations-layout-end {
        //     
        //     margin-bottom: 70px;
        //    
        // }

        //   locations-layout-start
        //   locations-layout-end
        //   locations-layout
        // return (
        //     <div >
        //         <div >
        //             <div className="company-group">
        //                 <Dropdown.Button onClick={this.handleButtonClick} overlay={menu} icon={<ApartmentOutlined />}>
        //                      Dropdown
        //                 </Dropdown.Button>                        
        //             </div>

        //             <Button type="primary" loading={false} onClick={this.loadDashboard} disabled={false}>Interviews</Button>
        //             <Button type="primary">Dashboard</Button>
        //         </div>


        //         <div >  
        //                 <Tabs defaultActiveKey="1">
        //                     {menuTabs}
        //                 </Tabs>                                                                    
        //             </div>

        //         {/* <LandingWrapper course={match?.params?.level} coursePath={location.pathname}/>               */}
        //     </div>
        // )
        
        /// CORRECTIONS TABLE
        // let dataToRender = this.props.dummyJSONdata?.map((c, i) => 
        // (
        //   {
        //     index: i,
        //     key: c.ContactCorrectionId,
        //     firstName: c.Contact.FirstName,
        //     lastName: c.Contact.LastName,
        //     fieldName: c.CorrectionFieldName,
        //     incorrectValue: c.CorrectionValue,
        //     notes: c.CorrectionNotes,
        //     fullCorrectionObj: c
        //   }
        // ));

        // let allContactExternalSourcesEditAllowedFlags = this.props.dummyJSONdata?.map((c, i) => (
        //   {
        //     contactExternalSources: c.Contact.Contact_ExternalSource?.map((es) => (
        //       {
        //         isContactEditAllowedFlag: es.ExternalSource.IsContactEditAllowed
        //       }
        //     ))
        //   }
        // ));

        // let isContactEditAllowedFlags = [];
        // for (let i = 0; i < allContactExternalSourcesEditAllowedFlags?.length; i++) {
        //   for (let j = 0; j < allContactExternalSourcesEditAllowedFlags[i]?.contactExternalSources?.length; j++) {
        //     isContactEditAllowedFlags.push(allContactExternalSourcesEditAllowedFlags[i]?.contactExternalSources[j]?.isContactEditAllowedFlag);
        //   }
        // }

        // let isToAllowEditTableData = !isContactEditAllowedFlags?.includes(false);
        // let firstNameFilter = [];
        // let firstNameTracker = [];
        // let lastNameFilter = [];
        // let lastNameTracker = [];
        // let fieldNameFilter = [];
        // let fieldNameTracker = [];
        // let incorrectValue = [];
        // let incorrectTracker = [];
        // let notesFilter = [];
        // let notesTracker = [];

        // console.log("isContactEditAllowedFlags");
        // console.log(isContactEditAllowedFlags);

        // for (let i = 0; i < dataToRender?.length; i++) {
        //   if(!firstNameTracker.includes(dataToRender[i].firstName)){
        //     firstNameFilter.push({
        //       text: dataToRender[i].firstName,
        //       value: dataToRender[i].firstName
        //     });
        //     firstNameTracker.push(dataToRender[i].firstName);
        //   }
  
        //   if(!lastNameTracker.includes(dataToRender[i].lastName)){
        //     lastNameFilter.push({
        //       text: dataToRender[i].lastName,
        //       value: dataToRender[i].lastName
        //     });
        //     lastNameTracker.push(dataToRender[i].lastName);
        //   }

        //   if(!fieldNameTracker.includes(dataToRender[i].fieldName)){
        //     fieldNameFilter.push({
        //       text: dataToRender[i].fieldName,
        //       value: dataToRender[i].fieldName
        //     });
        //     fieldNameTracker.push(dataToRender[i].fieldName);
        //   }

        //   if(!incorrectTracker.includes(dataToRender[i].incorrectValue)){
        //     incorrectValue.push({
        //       text: dataToRender[i].incorrectValue,
        //       value: dataToRender[i].incorrectValue
        //     });
        //     incorrectTracker.push(dataToRender[i].fieldName);
        //   }

        //   if(!notesTracker.includes(dataToRender[i].notes)){
        //     notesFilter.push({
        //       text: dataToRender[i].notes,
        //       value: dataToRender[i].notes
        //     });
        //   }
        //   notesTracker.push(dataToRender[i].notes);
        // }


        
        // const correctionColumns = [
        //     {
        //         title: 'First Name',
        //         dataIndex: 'firstName',
        //         width: '15%',
        //         editable: true,
        //         filters: [
        //           ...firstNameFilter
        //         ],
        //         filterMode: 'menu',
        //         filterSearch: true,
        //         onFilter: (value, record) => record.firstName.startsWith(value),                
        //         sorter: {
        //           compare: (a, b) => a.firstName.length - b.firstName.length,
        //           multiple: 3,
        //         }
        //       },
        //       {
        //         title: 'Last Name',
        //         dataIndex: 'lastName',
        //         width: '15%',
        //         editable: true,
        //         filters: [
        //           ...lastNameFilter
        //         ],
        //         onFilter: (value, record) => record.lastName.indexOf(value) === 0,
        //         sorter: (a, b) => a.lastName.length - b.lastName.length,
        //       },
        //       {
        //         title: 'Field Name',
        //         dataIndex: 'fieldName',
        //         width: '15%',
        //         editable: true,
        //         filters: [
        //           ...fieldNameFilter
        //         ],
        //         onFilter: (value, record) => record.fieldName.indexOf(value) === 0,
        //         sorter: (a, b) => a.fieldName.length - b.fieldName.length,
        //       },
        //       {
        //         title: 'Incorrect Value',
        //         dataIndex: 'incorrectValue',
        //         width: '20%',
        //         editable: true,
        //         filters: [
        //           ...incorrectValue
        //         ],
        //         onFilter: (value, record) => record.incorrectValue.indexOf(value) === 0,
        //         sorter: (a, b) => a.incorrectValue.length - b.incorrectValue.length,
        //       },
        //       {
        //         title: 'Notes',
        //         dataIndex: 'notes',
        //         width: '40%',
        //         editable: true,
        //         filters: [
        //           ...notesFilter
        //         ],
        //         onFilter: (value, record) => record.notes.indexOf(value) === 0,
        //         sorter: (a, b) => a.notes.length - b.notes.length,
        //       }
        // ];
      
        // return (
        //     <div>
        //         <h1>Number of Corrections</h1>
        //         <div>
        //             {/* <AbstractTable tableData={dataToRender} tableColumns={correctionColumns} isAllowedToEditTableData={isToAllowEditTableData}/> */}
        //         </div>
        //         <div>
        //             {/* <InternalIFrame iFrameUrl={`https://www.youtube.com/embed/tgbNymZ7vqY`}/> */}
        //         </div>                
        //     </div>
        // )

        if(this.props.graphData){
          const config = {
            data: this.props.graphData,
            xField: "quarter",
            yField: "score",
            seriesField: "type",
            isGroup: true,
            legend: true,
            yAxis: {
              title: {
                text:'NPS Score',
                position: 'center',
                style: {
                  fontSize: 20
                }
              }
            },
            columnStyle: {
              radius: [10, 10, 0, 0]
            },
            label: {
              //  label
              position: 'top',
              // 'top', 'middle', 'bottom'
              layout: [
                {
                  type: 'interval-adjust-position',
                },
                {
                  type: 'interval-hide-overlap',
                }, 
                {
                  type: 'adjust-color',
                },
              ],
            },
            legend: {
              layout: 'horizontal',
              position: 'top'
            }
          };

          return (

<div className="container customerName" >
				<Row gutter={24}>	
					<Col lg={24}>			
						<Card title="My Clients" bordered={true}>
                <h1>BAYADA Home Health Care - Corporate</h1>
            </Card>
            <Card bordered={true}>
            <Row gutter={[16, 16]}>
                <Col span={6}  offset={1}> 
                <div>
                  Contact Relations:
                    </div>        
                  <Dropdown.Button onClick={this.handleButtonClick} overlay={menu} icon={<AuditOutlined />}>
                        Contact Relations
                  </Dropdown.Button> 
                </Col>                
                <Col span={6}> 
                <div>
                    Frequency:
                    </div>
                    <Dropdown.Button onClick={this.handleButtonClick} overlay={menu} icon={<CalendarOutlined />}>
                        Frequency
                    </Dropdown.Button>  
                </Col>
                <Col span={6}>               
                   <div>
                      Data Range:
                    </div>
                    <RangePicker  onChange={this.onChange} />
                </Col>                
            </Row>
						</Card>
            <Card bordered={true} >
            <Row gutter={[16, 16]}>
                <Col span={3}  offset={1}>
                  <h4>General</h4>              
                </Col>
                <Col span={4}>
                  <h4>NPS Score</h4>                 
                </Col>
                <Col span={4}>
                  <h4>Promoters</h4>  
                  <div># of Responses (9-10)</div>                 
                </Col>
                <Col span={4}>
                  <h4>Passives</h4>
                  <div># of Responses (7-8)</div>                  
                </Col>
                <Col span={4}>
                  <h4>Detractors</h4>    
                  <div># of Responses (1-6)</div>          
                </Col>
                <Col span={4}>
                  <h4>Total</h4>                
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={3}  offset={1}>          
                  <h3 style={{color:'black'}}>HomeCare Industry</h3>
                </Col>
                <Col span={4}>               
                  <h1 style={{color:'black'}}>60.0</h1>
                </Col>
                <Col span={4}>                 
                  <h1 style={{color:'#3CA292'}}>69%</h1>
                </Col>
                <Col span={4}>               
                  <h1 style={{color:'#E5981C'}}>22%</h1>
                </Col>
                <Col span={4}>           
                  <h1 style={{color:'#d17059'}}>9%</h1>
                </Col>
                <Col span={4}>             
                  <h1 style={{color:'black'}}>---</h1>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col span={3}  offset={1}>        
                  <h3  style={{color:'black'}}>BAYADA Home Health Care - Corporate</h3>
                </Col>
                <Col span={4}>                
                  <h1 style={{color:'black'}}>56.6</h1>
                </Col>
                <Col span={4}>               
                  <h1 style={{color:'#3CA292'}}>69%</h1>
                  <h4 style={{color:'#3CA292'}}>(16,551)</h4>
                </Col>
                <Col span={4}>
                  <h1 style={{color:'#E5981C'}}>22%</h1>
                  <h4 style={{color:'#E5981C'}}>(4,609)</h4>
                </Col>
                <Col span={4}>
                  <h1 style={{color:'#d17059'}}>9%</h1>
                  <h4 style={{color:'#d17059'}}>(2,927)</h4>
                </Col>
                <Col span={4}>
                  <h1 style={{color:'black'}}>24,087</h1>                
                </Col>
            </Row>
            </Card>
					</Col>
					<Col lg={24}>
					<Card title=""  style={{ width: '100%' }} >
                <div id="general-experience-tabs-t">  
                  <Tabs defaultActiveKey="1">
                      <TabPane tab="CORP NPS" key="1">
                            <div id="exago-report-container-id">
                            <Column {...config} />
                            </div>
                      </TabPane>
                      <TabPane tab="CORP OSAT" key="2">
                              <div id="exago-report-container-id">
                              {/* <Column {...config} /> */}
                              Hello World
                              </div>
                      </TabPane>
                  </Tabs>                                             
              </div>
					</Card>
          <Card title="My Clients" bordered={true}>
                <h1>BAYADA Home Health Care - Corporate</h1>
            </Card>
            <Card title="My Clients" bordered={true}>
                <h1>BAYADA Home Health Care - Corporate</h1>
            </Card>
            <Card title="My Clients" bordered={true}>
                <h1>BAYADA Home Health Care - Corporate</h1>
            </Card>
					</Col>
				</Row>
				</div>
          )
        }
        else {
          return (
            <div>
                 <Loading cover="content"/>
            </div>
          )
        }


    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
        onDummyDataLoad:onDummyDataLoad,
        onRequestingGraphForLandingDashboard: onRequestingGraphForLandingDashboard
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage, dummyJSONdata, selectedCorrectionRecord, isCorrectionModalOpened, graphData } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, dummyJSONdata, selectedCorrectionRecord, isCorrectionModalOpened, graphData }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);