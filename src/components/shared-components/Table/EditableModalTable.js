import React from 'react';
import { Table, Input, InputNumber, Form, Button } from 'antd';
import {connect} from 'react-redux';
import { onSelectingCorrectionToEdit, onCorrectionsModalChange } from 'redux/actions/Lrn';
import AbstractContactModalForm from '../../layout-components/User/AbstractContactModalForm';

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

const EditableModalTable = props => {
  const { tableData, tableColumns, isAllowedToEditTableData, onSelectingCorrectionToEdit, onCorrectionsModalChange, isToRenderActionButton, tableExpandables  } = props;
  const normalizedTableData = Array.isArray(tableData) ? tableData : [];
  const normalizedTableColumns = Array.isArray(tableColumns) ? tableColumns : [];
  // console.log("isAllowedToEditTableData++++++++++++");
  // console.log(isAllowedToEditTableData);
  // console.log("tableData++++++++++++");
  // console.log(tableData);
  // console.log("tableColumns++++++++++++");
  // console.log(tableColumns);

const displayMoreInfo = (record, isToEdit) => {
  onCorrectionsModalChange(true);
  onSelectingCorrectionToEdit(record);
  console.log("***********>");
  console.log(record)
};

const cancel = () => {
  onCorrectionsModalChange(false)
};


// const save = async key => {
//   try {
//     const row = await form.validateFields();
//     const newData = [...tableData];
//     const index = newData.findIndex(item => key === item.key);

//     if (index > -1) {
//       const item = newData[index];
//       newData.splice(index, 1, { ...item, ...row });
//       setData(newData);
//       setEditingKey('');
//     } else {
//       newData.push(row);
//       setData(newData);
//       setEditingKey('');
//     }
//   } catch (errInfo) {
//     console.log('Validate Failed:', errInfo);
//   }
// };

let columns = [
  ...normalizedTableColumns
];

let expandables = tableExpandables || undefined;


// if theey are integrated show button that says more info rather than edit but they wont be able to edit anything
if(columns?.length > 0 && isToRenderActionButton) {
  columns.push(
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (text, record) => {
        return (
          <span>
            <Button onClick={e => {
              e.preventDefault()
              displayMoreInfo(record, isAllowedToEditTableData)
            }}>
              {isAllowedToEditTableData ? 'Edit' : 'More info'}
            </Button>
          </span>
        );          
      },
    }
  );   
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
    }),
  };
});

return (
  <div>
    <Table
      components={isAllowedToEditTableData ? components : undefined}
      bordered
      dataSource={normalizedTableData}
      columns={mergedColumns}
      expandable={expandables}
      rowClassName="editable-row"
      rowKey={(record, index) => record?.key ?? record?.enrolleeId ?? index}
      pagination={{
        onChange: cancel,
      }}
      scroll={{
        x: 'calc(700px + 50%)',
        y: 440,    // Vertical scrolling with fixed height
      }}
    />
  {isToRenderActionButton ? <AbstractContactModalForm isToEditContent={isAllowedToEditTableData}/> : null}
  </div>

  );
};



const mapStateToProps = ({lrn}) => {
	const { selectedCorrectionRecord } = lrn;
	return { selectedCorrectionRecord } 
};

export default connect(mapStateToProps, {onSelectingCorrectionToEdit, onCorrectionsModalChange})(EditableModalTable);
