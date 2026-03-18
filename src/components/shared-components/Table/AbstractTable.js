import React, { Component } from 'react';
import { Table } from 'antd';
import EditableModalTable from './EditableModalTable';

const deriveColumnKey = (column, index, parentPath = []) => {
  if (column?.key !== undefined && column?.key !== null) return String(column.key);
  if (Array.isArray(column?.dataIndex)) return column.dataIndex.join('.');
  if (typeof column?.dataIndex === 'string' && column.dataIndex.trim()) return column.dataIndex;
  if (typeof column?.title === 'string' && column.title.trim()) return `${parentPath.join('-')}-${column.title}-${index}`;
  return `${parentPath.join('-')}-col-${index}`;
};

const normalizeFilters = (filters) => {
  if (!Array.isArray(filters)) return undefined;

  return filters
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const rawValue = item.value ?? item.key ?? item.text ?? index;
      return {
        text: item.text ?? String(rawValue),
        value: rawValue
      };
    })
    .filter(Boolean);
};

const sanitizeColumnsForAntd = (columns, parentPath = []) => {
  if (!Array.isArray(columns)) return [];

  return columns
    .map((column, index) => {
      if (!column || typeof column !== 'object') return null;

      const columnKey = deriveColumnKey(column, index, parentPath);
      const hasChildren = Array.isArray(column.children) && column.children.length > 0;
      const normalizedFilters = normalizeFilters(column.filters);

      const nextColumn = {
        ...column,
        key: columnKey
      };

      if (hasChildren) {
        nextColumn.children = sanitizeColumnsForAntd(column.children, [...parentPath, columnKey]);
      } else if (nextColumn.children) {
        delete nextColumn.children;
      }

      if (normalizedFilters && normalizedFilters.length > 0) {
        nextColumn.filters = normalizedFilters;
      } else {
        delete nextColumn.filters;
        delete nextColumn.onFilter;
      }

      // Keep sorter only when AntD can safely consume it.
      if (!(typeof nextColumn.sorter === 'function' || nextColumn.sorter === true)) {
        delete nextColumn.sorter;
        delete nextColumn.sortDirections;
        delete nextColumn.defaultSortOrder;
      }

      if (nextColumn.filterSearch !== true) {
        delete nextColumn.filterSearch;
      }

      return nextColumn;
    })
    .filter(Boolean);
};

const buildFallbackColumns = (rows) => {
  const firstRow = Array.isArray(rows) ? rows[0] : null;
  if (!firstRow || typeof firstRow !== 'object') return [];

  return Object.keys(firstRow)
    .filter((key) => key !== 'key')
    .slice(0, 10)
    .map((key) => ({
      title: key,
      dataIndex: key,
      key
    }));
};

export class AbstractTable extends Component {

  render() {
    const {
      tableData,
      tableColumns,
      tableExpandables,
      isAllowedToEditTableData,
      isToRenderActionButton,
      selectionToRenderInModal,
      isToMakeRowsSelectable
    } = this.props;

    const normalizedTableData = Array.isArray(tableData) ? tableData : [];
    const normalizedTableColumns = sanitizeColumnsForAntd(tableColumns);
    const resolvedColumns =
      Array.isArray(normalizedTableColumns) && normalizedTableColumns.length > 0
        ? normalizedTableColumns
        : buildFallbackColumns(normalizedTableData);

    // Read-only tables (Insights) should bypass edit/modal wrappers.
    if (!isAllowedToEditTableData && !isToRenderActionButton) {
      return (
        <div style={{ overflowX: 'auto' }}>
          <Table
            size="middle"
            bordered
            dataSource={normalizedTableData}
            columns={resolvedColumns}
            expandable={tableExpandables}
            rowClassName="editable-row"
            rowKey={(record, index) => record?.key ?? record?.enrolleeId ?? index}
            pagination={{ pageSize: 20, showSizeChanger: true }}
          />
        </div>
      );
    }

     return (
      <EditableModalTable
        tableData={tableData}
        tableColumns={tableColumns}
        tableExpandables={tableExpandables}
        isAllowedToEditTableData={isAllowedToEditTableData}
        selectionToRenderInModal={selectionToRenderInModal}
        isToRenderActionButton={isToRenderActionButton}
        isToMakeRowsSelectable={isToMakeRowsSelectable}
      />
    )
  }
}


export default AbstractTable;
