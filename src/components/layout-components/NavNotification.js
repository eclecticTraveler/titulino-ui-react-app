import React, { useState } from 'react';
import { Menu, Dropdown, Badge, Avatar, List, Button } from 'antd';
import { 
  MailOutlined, 
  BellOutlined, 
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import Flex from '../../components/shared-components/Flex';

// Function to get the appropriate icon based on the icon name
const getIcon = (icon) => {
  switch (icon) {
    case 'mail':
      return <MailOutlined />;
    case 'alert':
      return <WarningOutlined />;
    case 'check':
      return <CheckCircleOutlined />;
    default:
      return <MailOutlined />;
  }
};

// Function to generate the notification body
const getNotificationBody = (list) => {
  return list?.length > 0 ? (
    <List
      size="small"
      itemLayout="horizontal"
      dataSource={list}
      renderItem={(item) => (
        <List.Item className="list-clickable">
          <Flex alignItems="center">
            <div className="pr-3">
              {item.img ? (
                <Avatar src={`/img/avatars/${item.img}`} />
              ) : (
                <Avatar className={`ant-avatar-${item.type}`} icon={getIcon(item.icon)} />
              )}
            </div>
            <div className="mr-3">
              <span className="font-weight-bold text-dark">{item.name} </span>
              <span className="text-gray-light">{item.desc}</span>
            </div>
            <small className="ml-auto">{item.time}</small>
          </Flex>
        </List.Item>
      )}
    />
  ) : (
    <div className="empty-notification">
      <img src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg" alt="empty" />
      <p className="mt-3">You have viewed all notifications</p>
    </div>
  );
};

export const NavNotification = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);

  // Handle visibility change of the dropdown
  const handleVisibleChange = (flag) => {
    setVisible(flag);
  };

  const notificationList = (
    <div className="nav-dropdown nav-notification">
      <div className="nav-notification-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Notification</h4>
        <Button type="link" onClick={() => setData([])} size="small">
          Clear
        </Button>
      </div>
      <div className="nav-notification-body">
        {getNotificationBody(data)}
      </div>
      {data.length > 0 && (
        <div className="nav-notification-footer">
          <a className="d-block" href="#/">
            View all
          </a>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown 
      placement="bottomRight"
      overlay={notificationList}
      onVisibleChange={handleVisibleChange}
      visible={visible}
      trigger={['click']}
    >
      <div className="nav-icon-container">
        <Badge count={data.length}>
          <BellOutlined className="nav-icon mx-auto" style={{ fontSize: '110%' }} />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NavNotification;
