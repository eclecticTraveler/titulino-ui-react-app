import React, { Component } from 'react';
import EditableModalTable from './EditableModalTable';

export class AbstractTable extends Component {

  render() {
     return (
      <EditableModalTable tableData={this.props.tableData}
                          tableColumns={this.props.tableColumns}
                          isAllowedToEditTableData={this.props.isAllowedToEditTableData}
                          selectionToRenderInModal={this.props.selectionToRenderInModal}
                          isToRenderActionButton={this.props.isToRenderActionButton}
                          isToMakeRowsSelectable={this.props.isToMakeRowsSelectable}/>
    )
  }
}


export default AbstractTable;
