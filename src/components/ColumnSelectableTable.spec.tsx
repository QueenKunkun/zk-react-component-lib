import { ColumnSelectableTable, HeaderType, HeaderConf } from "./ColumnSelectableTable";
import { expect, test } from 'vitest'
// import { fireEvent, render, screen } from "@testing-library/react";
import { render } from 'vitest-browser-react'

type People = {
    name: string;
    age: number;
    job: string;
    email: string;
}

const PeopleSelectableTable = ColumnSelectableTable<People>;

const data: People[] = [
    { name: '张三', age: 28, job: '工程师', email: 'zhangsan@example.com' },
    { name: '李四', age: 32, job: '设计师', email: 'lisi@example.com' },
    { name: '王五', age: 25, job: '产品经理', email: 'wangwu@example.com' }
];

const columnConfs: HeaderConf<People>[] = [
    { header: '姓名', field: 'name' },
    { header: '年龄', field: 'age' },
    { header: '职业', field: 'job' },
    { header: '邮箱', field: 'email' }
];

const columnConfsWithColor: HeaderConf<People>[] = [
    { header: '姓名', field: "name", headClassName: 'bg-red-100' },
    // { header: '年龄', field: "age", headClassName: 'bg-red-100', cellRenderer: (v, colIdx, rowIdx) => v[colIdx] + ADD_AGE },
    { header: '年龄', field: "age", headClassName: 'bg-red-100' },
    { header: '职业', field: "job", headClassName: 'bg-green-100' },
    { header: '邮箱', field: "email", headClassName: 'bg-blue-100' },
];

const rowConfs: HeaderConf<People>[] = [
    { header: '第一' },
    { header: '第二' },
    { header: '第三' },
];

const rowConfsWithSpan: HeaderConf<People>[] = [
    { header: '第一' },
    { header: null },
    { header: '第三' },
];

const classNames = {
    headColumn: 'bg-gray-100',
    headRow: 'bg-gray-200',
    selected: 'bg-yellow-200',
};

function getExpectedTable(data: People[], rowConfs?: HeaderConf<People>[], columnConfs?: HeaderConf<People>[]) {
    const expectedTable = [];

    if (!rowConfs && !columnConfs) {
        return data.map(d => Object.values(d));
    }

    const objectInColumn = columnConfs && columnConfs.some(c => c.field);

    if (columnConfs) {
        const row = ['', ...columnConfs.map(c => c && c.header)];
        expectedTable.push(row);
        if (!rowConfs) {
            row.shift();
        }
    }

    if (objectInColumn) {
        data.forEach((d, ii) => {
            const row = [];
            if (rowConfs) {
                row.push(rowConfs[ii] && rowConfs[ii].header);
            }
            if (columnConfs) {
                row.push();
            }
        });
    }

    if (rowConfs) {
        expectedTable.push(...rowConfs.map((r, i) => {
            const row: (HeaderType)[] = ['', ...data.map(d => d[r.field!].toString())];
            if (!columnConfs) {
                row.shift();
            } else {
                const x = columnConfs[i];
                row[0] = x && x.header;
            }
            return row;
        }));
    }

    return expectedTable;
}

function cellRenderer(specialId: number) {
    return (row: any, colIdx: number, rowIdx: number) => {
        const cell = row[colIdx];
        if (colIdx === specialId) {
            return <span>{cell}</span>
        }
        return cell;
    }
}

test('table with no column and row headers', () => {

    const expectedTable = [
        ['张三', '28', '工程师', 'zhangsan@example.com'],
        ['李四', '32', '设计师', 'lisi@example.com'],
        ['王五', '25', '产品经理', 'wangwu@example.com'],
    ];

    const { container, debug } = render(<PeopleSelectableTable
        dataSource={data}
        allowSelect={true}
        classNames={classNames}
        className="" />
    );
    assertResult(container, expectedTable, 4);
})

test('table with column headers 1', () => {
    const expectedTable = [
        ['姓名', '年龄', '职业', '邮箱'],
        ['张三', '28', '工程师', 'zhangsan@example.com'],
        ['李四', '32', '设计师', 'lisi@example.com'],
        ['王五', '25', '产品经理', 'wangwu@example.com'],
    ];
    console.log(columnConfs);
    const { container, debug } = render(<PeopleSelectableTable
        dataSource={data}
        columnConfs={columnConfs}
        allowSelect={true}
        classNames={classNames}
        className="" />
    );
    assertResult(container, expectedTable, 4);
})

test('table with row headers 1', () => {
    const expectedTable = [
        ['第一', '张三', '28', '工程师', 'zhangsan@example.com'],
        ['第二', '李四', '32', '设计师', 'lisi@example.com'],
        ['第三', '王五', '25', '产品经理', 'wangwu@example.com'],
    ];

    const { container, debug } = render(<PeopleSelectableTable
        dataSource={data}
        rowConfs={rowConfs}
        allowSelect={true}
        classNames={classNames}
        className="" />
    );
    assertResult(container, expectedTable, 5);
})

test('table with row headers with span', () => {
    const expectedTable = [
        ['第一', '张三', '28', '工程师', 'zhangsan@example.com'],
        [null, '李四', '32', '设计师', 'lisi@example.com'],
        ['第三', '王五', '25', '产品经理', 'wangwu@example.com'],
    ];

    const { container, debug } = render(<PeopleSelectableTable
        dataSource={data}
        rowConfs={rowConfsWithSpan}
        allowSelect={true}
        classNames={classNames}
        className="" />
    );
    assertResult(container, expectedTable, 5);
})

test('table with both column and row headers', () => {

    const expectedTable = [
        ['', '姓名', '年龄', '职业', '邮箱'],
        ['第一', '张三', '28', '工程师', 'zhangsan@example.com'],
        ['第二', '李四', '32', '设计师', 'lisi@example.com'],
        ['第三', '王五', '25', '产品经理', 'wangwu@example.com'],
    ];

    const { container, debug } = render(<PeopleSelectableTable
        objectShowInColumn={true}
        dataSource={data}
        rowConfs={rowConfs}
        columnConfs={columnConfsWithColor}
        // cellRenderer={cellRenderer(specialId)}
        allowSelect={true}
        classNames={classNames}
        className="" />);

    assertResult(container, expectedTable, 5);
})

test('table with row and column headers transposed', () => {

    const expectedTable = [
        ['', '第一', '第二', '第三'],
        ['姓名', '张三', '李四', '王五'],
        ['年龄', '28', '32', '25'],
        ['职业', '工程师', '设计师', '产品经理'],
        [
            "邮箱",
            "zhangsan@example.com",
            "lisi@example.com",
            "wangwu@example.com",
        ]
    ]

    const { container, debug } = render(<PeopleSelectableTable
        objectShowInColumn={true}
        dataSource={data}
        rowConfs={columnConfsWithColor}
        columnConfs={rowConfs}
        // cellRenderer={cellRenderer(specialId)}
        allowSelect={true}
        classNames={classNames}
        className="" />);

    assertResult(container, expectedTable, 4);
})

test('table with column headers and row headers with row spans', () => {

    const expectedTable = [
        ['', '姓名', '年龄', '职业', '邮箱'],
        ['第一', '张三', '28', '工程师', 'zhangsan@example.com'],
        [null, '李四', '32', '设计师', 'lisi@example.com'],
        ['第三', '王五', '25', '产品经理', 'wangwu@example.com'],
    ];

    const { container, debug } = render(<PeopleSelectableTable
        objectShowInColumn={true}
        dataSource={data}
        rowConfs={rowConfsWithSpan}
        columnConfs={columnConfsWithColor}
        // cellRenderer={cellRenderer(specialId)}
        allowSelect={true}
        classNames={classNames}
        className="" />);

    assertResult(container, expectedTable, 5);
})

function assertResult(container: HTMLElement, expectedTable: HeaderType[][], columnLen: number) {
    const { table, spanCells, positions } = extractCells(container, columnLen);
    const tableContent = table.map(t => t.map(c => c && c.textContent));
    equals(table, expectedTable, -1);
}

function equals(table: (Element | null)[][], expectedTable: HeaderType[][], specialId: number) {
    expect(table.length).toBe(expectedTable.length);
    for (let rowIdx = 0; rowIdx < table.length; rowIdx++) {
        const row = table[rowIdx];
        const expectedRow = expectedTable[rowIdx];
        expect(row.length).toBe(expectedRow.length);
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
            if (row[colIdx]) {
                expect(row[colIdx]?.textContent).toBe(expectedRow[colIdx]);
            } else {
                expect(expectedRow[colIdx]).toBeNull();
            }
            if (colIdx == specialId + 1 && rowIdx > 1) {
                // expect(cell.children[0].tagName).toBe('SPAN');
            }
        }
    }
}

function extractCells(rootContainer: HTMLElement, columnCount: number) {
    const tableContent = rootContainer.querySelectorAll('div div div');

    const table: (Element | null)[][] = [];
    const spanCells: string[][] = [];
    const positions: (DOMRect | null)[] = [];

    const findSpanCells = (cell: Element, row: number, col: number, i: number) => {
        if (!cell) return;
        // console.log(cell.getAttributeNames());
        if (cell.getAttributeNames().length > 2) {

        }

        // find rowspan and colspan
        let rowspan = 1;
        let colspan = 1;

        const styleAttt = cell.getAttribute('style');
        if (styleAttt) {
            // this is not acurate, but just a hard coded way, but it works for now
            let mm = styleAttt.match(/grid-row:.*(\d+)/);
            if (mm) {
                rowspan = parseInt(mm[1]);
                if (rowspan <= 1) return;
            }

            mm = styleAttt.match(/grid-column:.*(\d+)/);
            if (mm) {
                colspan = parseInt(mm[1]);
                if (colspan <= 1) return;
            }
        } else {
            // old way, obsolete, keep it just for compatibility
            const rowspanAttt = cell.getAttribute('rowspan');
            if (rowspanAttt) {
                rowspan = parseInt(rowspanAttt);
            }
            const colspanAtt = cell.getAttribute('colspan');
            if (colspanAtt) {
                colspan = parseInt(colspanAtt);
            }
            if (rowspan <= 1 && colspan <= 1) return;
        }

        for (let i = 0; i < rowspan; i++) {
            for (let j = 0; j < colspan; j++) {
                spanCells[row + i] = spanCells[row + i] || [];
                spanCells[row + i][col + j] = `${row + i}-${col + j}`; // value is not important, jsut a flag
            }
        }
    }

    const isSpanCell = (row: number, col: number) => {
        if (spanCells[row] && spanCells[row][col] !== undefined) {
            return true;
        }
        return false;
    }

    for (let i = 0, rowId = 0, colId = 0; i < tableContent.length;) {
        table[rowId] = table[rowId] || [];
        if (!isSpanCell(rowId, colId)) {
            // colId = i % columnCount;
            // rowId = Math.floor(i / columnCount);
            const cell = tableContent[i];
            table[rowId].push(cell!);
            positions.push(cell && cell.getBoundingClientRect());
            findSpanCells(cell, rowId, colId, i);
            i++;
        } else {
            table[rowId].push(null);
        }
        colId++;
        if (colId >= columnCount) {
            colId = 0;
            rowId++;
        }
    }
    return { table, spanCells, positions };
}
