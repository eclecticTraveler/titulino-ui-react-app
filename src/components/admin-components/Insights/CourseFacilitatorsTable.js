import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Spin, Empty, Table, Tag, Typography } from 'antd';
import { onFetchingCourseFacilitators } from 'redux/actions/AdminTools';

const { Text } = Typography;

const columns = [
  {
    title: 'Course',
    dataIndex: 'courseCodeId',
    key: 'courseCodeId',
    sorter: (a, b) => a.courseCodeId.localeCompare(b.courseCodeId),
    render: v => <Tag>{v}</Tag>
  },
  {
    title: 'Facilitator',
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: v => <Text copyable>{v}</Text>
  }
];

const CourseFacilitatorsTable = ({ user, onFetchingCourseFacilitators }) => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!user?.emailId) return;
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      const result = await onFetchingCourseFacilitators(user.emailId);
      if (!cancelled) {
        setEntries(result?.entries ?? []);
        setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [user?.emailId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spin size="default" style={{ display: 'block', margin: '24px auto' }} />;

  if (!entries.length) return <Empty description="No facilitators assigned to any course yet." style={{ margin: '24px auto' }} />;

  return (
    <Table
      dataSource={entries}
      columns={columns}
      rowKey={r => `${r.courseCodeId}-${r.contactInternalId}`}
      size="small"
      pagination={false}
      defaultSortOrder="ascend"
    />
  );
};

const mapStateToProps = ({ grant }) => ({ user: grant.user });

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ onFetchingCourseFacilitators }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CourseFacilitatorsTable);
