import React, { Component, useState } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Button, Modal } from 'antd';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import { withRouter } from "react-router-dom";
import { onSelectingCorrectionToEdit } from 'redux/actions/Lrn';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = props => {
    const { tableData, tableColumns, isAllowedToEditTableData,isCorrectionModalOpened, onSelectingCorrectionToEdit, selectedCourse  } = props;

  const [form] = Form.useForm();

  const [data, setData] = useState(tableData); /// REDUX
  const [editingKey, setEditingKey] = useState(''); /// REDUX

  const isEditing = record => record.key === editingKey;

  const edit = record => {
    form.setFieldsValue({ ...record });
    // setEditingKey(record.key); // PROPS

  };

  const cancel = () => {
    setEditingKey('');
  };



  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  let columns = [
    ...tableColumns
  ];

  // if theey are integrated show button that says more info rather than edit but they wont be able to edit anything
  if(columns?.length > 0) {
    if(isAllowedToEditTableData){      
      columns.push(
        {
          title: 'Actions',
          dataIndex: 'operation',
          render: (text, record) => {
            const editable = isEditing(record);
            return editable ? (
              <span>
                <a
                  href="/#"
                  onClick={e => {
                    e.preventDefault()
                    save(record.key)          
                  }}
                  style={{
                    marginRight: 8,
                  }}
                >
                  Save
                </a>
                <Popconfirm title="Sure to cancel?" onConfirm={e => {
                  e.preventDefault()
                  cancel(record.key)
                }}>
                  <a href="/#">Cancel</a>
                </Popconfirm>
              </span>
            ) : (
              <Button disabled={editingKey !== ''} onClick={e => {
                e.preventDefault()                
                edit(record)
              }}>
                Edit
              </Button>
            );
          },
        }
      );
    }else{

    }

  }
  

  const components = {
    body: {
      cell: EditableCell,
    },
  };
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <div>
    <Form form={form} component={false}>
      <Table
        components={components}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form> 
    
    </div>

  );
};


const mapStateToProps = ({lrn}) => {
	const {selectedCorrectionRecord, isCorrectionModalOpened, selectedCourse, onSelectingCorrectionToEdit } = lrn;
	return {selectedCorrectionRecord, isCorrectionModalOpened, selectedCourse, onSelectingCorrectionToEdit} 
};

export default withRouter(connect(mapStateToProps, {onSelectingCorrectionToEdit})(EditableTable));

