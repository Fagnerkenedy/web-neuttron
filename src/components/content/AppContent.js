import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import './styles.css'
import DataTable from './table/DataTable';
import TableControls from './selection/TableControls';
import SearchInputField from './SearchInputFields'
import { useDataTable } from './table/DataTableHooks';
import { useSelection } from './selection/SelectionHooks';
import { usePagination } from './selection/PaginationHooks';
import DataTableWithSearch from './DataTableWithSearch';
import { useOutletContext } from 'react-router-dom';
import Kanban from './Kanban'

const { Content, Sider } = Layout;

const onSearch = (value, _e, info) => console.log(info?.source, value);

const AppContent = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const { columns, tableData, loading } = useDataTable();
    const { rowSelection, hasSelected, start, selectedRowKeys } = useSelection();
    const { currentPage, pageSize, onPageChange, onPageSizeChange, startIndex, endIndex } = usePagination();
    const currentData = tableData.slice(startIndex, endIndex);
    const totalTableWidth = columns.reduce((acc, col) => acc + col.width, 0);
    const { darkMode } = useOutletContext();
    const [layoutType, setLayoutVisualization] = useState('tabela')

    return (
        <Content className='content'>
            <TableControls
                hasSelected={hasSelected}
                selectedRowKeys={selectedRowKeys}
                start={start}
                totalItems={tableData.length}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                currentPage={currentPage}
                setLayoutVisualization={setLayoutVisualization}
            />
            {layoutType == 'tabela' ? (

                <Layout
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {/* <Sider
                        className='sider'
                        style={{
                            background: colorBgContainer,
                        }}
                        width={200}
                    >
                        <SearchInputField onSearch={onSearch} />
                    </Sider> */}

                    <Content style={{ border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }} className='dataTable'>
                        <DataTableWithSearch
                            columns={columns}
                            data={tableData}
                            rowSelection={rowSelection}
                            currentData={currentData}
                            totalTableWidth={totalTableWidth}
                            loading={loading}
                        />
                    </Content>
                </Layout >
            ) : (
                <Kanban data={tableData} />
            )}
        </Content >
    );
};

export default AppContent;
