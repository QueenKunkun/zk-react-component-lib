import { ColumnSelectableTable } from 'zk-react-component-lib'

const data = [
    { id: '1', name: 'John', age: 30, address: 'New York' },
    { id: '2', name: 'Jane', age: 25, address: 'Los Angeles' },
    { id: '3', name: 'Tom', age: 35, address: 'Chicago' },
    { id: '4', name: 'Mary', age: 20, address: 'Houston' },
]

const columnConfs: { header: string; field: keyof typeof data[0] }[] = [
    { header: 'ID', field: 'id' },
    { header: 'Name', field: 'name' },
    { header: 'Age', field: 'age' },
    { header: 'Address', field: 'address' },
]

export const Example2 = () => {
    return (
        <ColumnSelectableTable
            dataSource={data}
            columnConfs={columnConfs}
            rowConfs={[
                { header: '第一行', headClassName: 'bg-yellow-100' },
                { header: '第二行', headClassName: 'bg-red-100' },
                { header: '第三行', headClassName: 'bg-green-100' },
                { header: '第四行', headClassName: 'bg-blue-200' },
            ]}
            allowSelect={true}
            className="grid grid-cols-3 gap-1"
            classNames={{
                headColumn: 'bg-gray-100',
                selected: 'bg-yellow-200',
            }}
        />
    );
}