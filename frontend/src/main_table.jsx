import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import * as XLSX from 'xlsx';
import { getMainData } from './datasource';
import Filters from './filters';
import RecordModal from './record_modal';
import './index.css';

const CustomTable = ({ colorBgContainer, borderRadiusLG, folderId }) => {
  const [mainData, setMainData] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState(mainData);
  const [recModalVisible, setRecModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const now = new Date(); // Получаем текущую дату и время
  const year = now.getFullYear(); // Получаем текущий год
  const month = ('0' + (now.getMonth() + 1)).slice(-2); // Получаем текущий месяц и добавляем нули спереди, если месяц меньше 10
  const day = ('0' + now.getDate()).slice(-2); // Получаем текущий день месяца и добавляем нули спереди, если день меньше 10
  const hours = ('0' + now.getHours()).slice(-2); // Получаем текущее часы и добавляем нули спереди, если часы меньше 10
  const minutes = ('0' + now.getMinutes()).slice(-2); // Получаем текущие минуты и добавляем нули спереди, если минуты меньше 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableLoading(true);
        const response = await getMainData(folderId); // Передаем folderId
        setMainData(response);
        setTableLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTableLoading(false);
      }
    };
    if (folderId) {
      fetchData();
    }
  }, [folderId]);

  useEffect(() => {
    handleFilterSubmit({});
  }, [mainData]);

  const onClickRow = (record) => {
    setSelectedRecord(record);
    setRecModalVisible(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setRecModalVisible(false);
  };

  const handleFilterSubmit = (filters) => {
    let filteredData = [...mainData];
    const textFilters = [
      'document_number',
      'document_title',
      'discipline',
      'document_type',
      'revision_status',
      'revision_step',
      'revision_description',
      'language'
    ];
    textFilters.forEach(filterKey => {
      if (filters[filterKey]) {
        if (filterKey === 'language' || filterKey === 'discipline') {
          filteredData = filteredData.filter(item => item[filterKey].toLowerCase() === filters[filterKey].toLowerCase());
        } else {
          filteredData = filteredData.filter(item => item[filterKey].toLowerCase().includes(filters[filterKey].toLowerCase()));
        }
      }
    });
    if (filters.created && filters.created.length === 2) {
      const startDate = filters.created[0].startOf('day').toDate();
      const endDate = filters.created[1].endOf('day').toDate();
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.created);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    setFilteredDataSource(filteredData);
  };

  const handleDelete = (id) => {
    setMainData((prevData) => prevData.filter((item) => item.id !== id));
    setFilteredDataSource((prevData) => prevData.filter((item) => item.id !== id));
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 0,
      ellipsis: true,
      hidden: true,
    },
    {
      title: 'Document Number',
      dataIndex: 'document_number',
      key: 'document_number',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Title',
      dataIndex: 'document_title',
      key: 'document_title',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Native Title',
      dataIndex: 'document_title_native',
      key: 'document_title_native',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Discipline',
      dataIndex: 'discipline',
      key: 'discipline',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Document Type',
      dataIndex: 'document_type',
      key: 'document_type',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Revision Status',
      dataIndex: 'revision_status',
      key: 'revision_status',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Revision Step',
      dataIndex: 'revision_step',
      key: 'revision_step',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Revision Description',
      dataIndex: 'revision_description',
      key: 'revision_description',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Revision Number',
      dataIndex: 'revision_number',
      key: 'revision_number',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: 100,
      ellipsis: true,
    },
  ];

  const rowStyle = {
    height: '24px',
  };

  const cellStyle = {
    padding: '4px 8px',
  };

  return (
    <div style={{ padding: 20, background: colorBgContainer, borderRadius: borderRadiusLG, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Filters onSubmit={handleFilterSubmit} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table
            columns={columns.filter((column) => !column.hidden)}
            dataSource={filteredDataSource}
            loading={tableLoading}
            rowClassName={(record) =>
              `custom-table-row no-wrap hover-cursor ${
                record.revision_status === 'Active' ? 'custom-table-row-active' : ''
              }`
            }
            pagination={{ pageSize: 19, showSizeChanger: false }}
            rowKey={'id'}
            components={{
              body: {
                row: (props) => <tr {...props} style={rowStyle} />,
                cell: (props) => <td {...props} style={cellStyle} />,
              },
            }}
            onRow={(record) => {
              return {
                onClick: () => onClickRow(record),
              };
            }}
          />
          <RecordModal
            record={selectedRecord}
            visible={recModalVisible}
            onClose={closeModal}
            onDelete={(id) => {
              handleDelete(id);
              handleFilterSubmit({}); // Вызов функции обновления после удаления
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomTable;
