import { ColumnSelectableTable } from 'zk-react-component-lib'

const data = [
    { id: '1', name: 'John', age: 30, address: 'New York' },
    { id: '2', name: 'Jane', age: 25, address: 'Los Angeles' },
    { id: '3', name: 'Tom', age: 35, address: 'Chicago' },
    { id: '4', name: 'Mary', age: 20, address: 'Houston' },
]

export const Example1 = () => {
    return (
        <ColumnSelectableTable
            dataSource={data}
            columnConfs={[
                { header: 'ID', field: 'id', headClassName: 'bg-yellow-100' },
                { header: 'Name', field: 'name', headClassName: 'bg-red-100' },
                { header: 'Age', field: 'age', headClassName: 'bg-green-100' },
                { header: 'Address', field: 'address', headClassName: 'bg-blue-100' },
            ]}
            allowSelect={true}
            className="gap-1"
            classNames={{
                headColumn: 'bg-gray-100',
                headRow: 'bg-gray-200',
                selected: 'bg-yellow-200',
            }}
        />
    );
}