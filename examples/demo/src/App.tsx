// import React from 'react';
import './App.css'

import { ColumnSelectableTable } from 'zk-react-component-lib'
import { Example1 } from './example1';
import { Example2 } from './example2';

const PeopleSelectableTable = ColumnSelectableTable<any>;

export const TestTable = () => {

  const data: any[] = [
    { name: '张三', age: 28, job: '工程师', email: 'zhangsan@example.com' },
    { name: '李四', age: 32, job: '设计师', email: 'lisi@example.com' },
    { name: '王五', age: 25, job: '产品经理', email: 'wangwu@example.com' }
  ];

  const columnConfs = [
    { header: '姓名', field: "name", headClassName: 'bg-yellow-100' },
    { header: '年龄', field: "age", headClassName: 'bg-red-100' },
    { header: '职业', field: "job", headClassName: 'bg-green-100' },
    { header: '邮箱', field: "email", headClassName: 'bg-blue-100' },
  ];

  const rowConfs = [
    { header: '第一行' },
    { header: '第二行' },
    { header: '第三行' },
  ];

  const rowConfs3 = [
    { header: '第一行' },
    { header: null },
    { header: '第三行' },
  ];


  return (
    <div>
      <Example1></Example1>
      <br />
      <hr />
      <br />
      <Example2></Example2>
      <br />
      <hr />
      <br />

      <PeopleSelectableTable
        objectShowInColumn={false}
        dataSource={data}
        rowConfs={rowConfs3}
        columnConfs={columnConfs}
        allowSelect={true}
        classNames={{
          headColumn: 'bg-gray-100',
          headRow: 'bg-gray-200',
          selected: 'bg-yellow-200',
        }}
        className="gap-1" />
      <br />
      <hr />
      <br />

      <PeopleSelectableTable
        objectShowInColumn={false}
        dataSource={data}
        rowConfs={rowConfs3}
        allowSelect={true}
        classNames={{
          headColumn: 'bg-gray-100',
          headRow: 'bg-gray-200',
          selected: 'bg-yellow-200',
        }}
        className="gap-1" />
    </div>
  )
};


function App() {
  return (
    <>
      <TestTable></TestTable>
    </>
  )
}

export default App
