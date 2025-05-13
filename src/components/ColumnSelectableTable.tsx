
import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { SELECTABLE_HEAD_COLUMN_INDEX, SELECTABLE_HEAD_ROW_INDEX, useColumnSelectableTable, useColumnSelectableTableProps } from './useColumnSelectableTable';
import { getValue, isLengthGT0 } from '../lib/utils';

export function enhanceSpecialCode(text: string): ReactNode {
    if (typeof text !== "string") return text;
    // find _ and replace with bold text
    const escaped = text.replace(/_([^_]+)_/, (_, g1) => `<span class="font-bold">${g1}</span>`);
    return <span dangerouslySetInnerHTML={{ __html: escaped }} />;
}

type ReducerCallback<S, A> = (prev: A, curr: S, currIdx: number) => A;

type RangeFinderReducerState<S> = {
    started: boolean;
    curr?: S;
    currIdx?: number;
};

type RangeMatcherCallback<S, A> = (starter: boolean, state: RangeFinderReducerState<S>, prev: A, curr: S, currIdx: number) => A;

function CreateReduceCallbackFn<S, A>(
    matchFirst: (c: S) => boolean,
    matchNext: (c: S) => boolean,
    onMatch: RangeMatcherCallback<S, A>): ReducerCallback<S, A> {

    let state: RangeFinderReducerState<S> = { started: false };

    return (prev: A, curr: S, currIdx: number) => {
        if (matchFirst(curr)) {
            state.started = true;
            state.curr = curr;
            state.currIdx = currIdx;
            return onMatch(true, state, prev, curr, currIdx);
        }
        if (matchNext(curr)) {
            if (state.started)
                return onMatch(false, state, prev, curr, currIdx);
            return prev;
        }
        if (state.started) {
            state.started = false;
        }
        return prev;
    }
}

export type HeaderType = null | string | string[];

export type Baseconf = {
    header: HeaderType | null;
}

export type HeaderConf<T> = Baseconf & {
    field?: keyof T;
    headClassName?: string;
    contentClassName?: string;
    colSpan?: number;
    rowSpan?: number;
} & CellRender<T>;

export type BaseDefaultRendererType<T> = (o: T, ci: number, ri: number, horizontal?: boolean) => ReactNode;

export type DefaultRendererType = (o: any, ci: number, ri: number, horizontal?: boolean) => ReactNode;

export type CustomRenderer<T> = (o: T, ci: number, ri: number, r: BaseDefaultRendererType<T>) => ReactNode;

export type CellRender<T> = {
    cellRenderer?: CustomRenderer<T>,
}

export function cloneColumnSpec<T>(spec: HeaderConf<T>): HeaderConf<T> {
    return { ...spec };
}

const DefaultRenderer: BaseDefaultRendererType<any> =
    (obj: any, _colIdx: number, _rowIdx: number, horizontal?: boolean) => {
        if (Array.isArray(obj)) {
            return obj.map((subItem: any, subIdx: number | string) =>
                <span key={subIdx} className={horizontal ? "flex justify-center" : "content-start"} >
                    <span> {enhanceSpecialCode(subItem)} </span>
                </span>);
        }
        return obj;
    }

export const HorizontalRenderer: DefaultRendererType = (a, b, c) => DefaultRenderer(a, b, c, true);

export const VerticalRenderer: DefaultRendererType = (a, b, c) => DefaultRenderer(a, b, c, false);

export type ColumnSelectableTableProps<T> = Omit<useColumnSelectableTableProps, 'selectedClassName'> & {
    name?: string,
    noDataTextContent?: string,
    // before render data, you can do some preprocessing here
    beforeRender?: (dataToShow: T[]) => void,
    // to render a cell
    cellRenderer?: CustomRenderer<T>,
    // to render a column header cell
    columnHeadRenderer?: CustomRenderer<HeaderType>,
    // to render a row header cell
    rowHeadRenderer?: CustomRenderer<HeaderType>,
    /**
     * If true, the object will be shown in the column.
     * If false, the object will be shown in the row.
     * Default is false.
     */
    objectShowInColumn?: boolean;
    /**
     * Merge columns if the values are continously the same
     */
    mergeSameValuesInRow?: number[];
    /**
     * Class name of the root container
     */
    className?: string,
    dataSource: T[],
    columnConfs?: HeaderConf<T>[],
    rowConfs?: HeaderConf<T>[],
    classNames?: {
        headColumn?: string,
        headRow?: string,
        columnCell?: string,
        columnCellHeader?: string,
        selected?: string,
    },
    disallowHeadColumn?: boolean,
    getGridTemplateColumns?: (dataToShow: T[], columnLen: number) => string,
}

function updateConfs<T>(confs?: HeaderConf<T>[], classNames?: [{ header: string, contentClassName: string }]) {
    if (!confs) return;

    // deep copy it
    const cloned = confs.map((r, _i) => {
        return cloneColumnSpec(r);
    });

    // find continous rows
    const collapseByHeader = CreateReduceCallbackFn(
        (row: HeaderConf<any>) => row.header !== null,
        (row: HeaderConf<any>) => row.header === null,
        (starter, _state, prev: number[][], _curr: HeaderConf<any>, currIdx: number) => {
            if (starter) {
                prev.push([]);
            }
            prev[prev.length - 1].push(currIdx);
            return prev;
        }
    )

    const mergedRowIdxList = cloned.reduce(collapseByHeader, []);

    mergedRowIdxList?.forEach((rowIdxList: number[], idx) => {
        const clonedSpec = cloned[rowIdxList[0]];
        if (clonedSpec) {
            // calculate rowSpan
            if (rowIdxList.length > 1) {
                // clonedSpec.headClassName = clsx(clonedSpec.headClassName, `row-span-${rowIdxList.length}`);
                clonedSpec.rowSpan = rowIdxList.length;
            }
            if (classNames) {
                // merge content class name
                let found = classNames.find((c) => c.header === clonedSpec.header);
                if (found)
                    clonedSpec.contentClassName = clsx(clonedSpec.contentClassName, found.contentClassName);
            }
        }
    });
    return cloned;
}

function renderObject<T>(obj: T, colIdx: number, rowIdx: number, renderer?: (o: T, ci: number, ri: number, defaultRenderer: (o: any, ci: number, ri: number) => ReactNode) => ReactNode) {
    if (renderer) {
        return renderer(obj, colIdx, rowIdx, HorizontalRenderer);
    }
    return HorizontalRenderer(obj, colIdx, rowIdx);
}

function getStyle(val: any) {
    const style: any = {};
    const colSpan = val?.colSpan;
    if (colSpan) {
        // style.columnSpan = `span ${colSpan} / span ${colSpan}`;
        style.gridColumn = `span ${colSpan} / span ${colSpan}`;
    }
    const rowSpan = val?.rowSpan;
    if (rowSpan) {
        // style.rowSpan = `span ${rowSpan} / span ${rowSpan}`;
        style.gridRow = `span ${rowSpan} / span ${rowSpan}`;
    }
    return style;
}

function _ColumnSelectableTable<T extends Object>(props: ColumnSelectableTableProps<T>) {

    let columnConfs = props.columnConfs;
    let disallowHeadColumn = typeof props.disallowHeadColumn === "boolean" ? props.disallowHeadColumn : !columnConfs;
    const {
        allowSelect,
        mergeSameValuesInRow,
        dataSource,
        name,
        className,
        classNames,
        selectedIndex,
        unselectWhenClickTwice,
        rowConfs,
        noDataTextContent,
        beforeRender,
        cellRenderer,
        columnHeadRenderer,
        rowHeadRenderer,
        onSelectionChange,
        getGridTemplateColumns = (dd: T[], columnLen: number) => {
            if (rowConfs1 && rowConfs1.length > 0)
                return `auto repeat(${columnLen - 1},  minmax(1rem, 1fr))`;
            return `repeat(${columnLen},  minmax(1rem, 1fr))`;
        },
    } = props;

    const objectShowInColumn = rowConfs?.some((c) => c.field !== undefined);

    let mergeSameColumns = isLengthGT0(mergeSameValuesInRow);
    if (mergeSameColumns && !objectShowInColumn) {
        throw new Error(`mergeColumnsForRows conflicts with objectLayInColumn`)
    }

    if (!dataSource) {
        return <div>{noDataTextContent}</div>
    }

    if (objectShowInColumn) {
        if (!props.rowConfs) {
            return <div>主配置不正确</div>
        }
    }

    const rootRef = useRef<HTMLDivElement>(null);

    if (beforeRender) {
        beforeRender(dataSource);
    }

    const data0 = dataSource[0];

    const columnConfs1 = columnConfs ? useMemo(() => updateConfs(columnConfs), [columnConfs]) :
        Object.keys(data0).map((k) => ({ header: k, field: k, contentClassName: undefined, headClassName: undefined, cellRenderer: undefined }));

    const rowConfs1 = useMemo(() => updateConfs(rowConfs), [rowConfs]);

    const getColumnSelectableProps = useColumnSelectableTable({
        allowSelect,
        selectedIndex,
        onSelectionChange,
        unselectWhenClickTwice,
        selectedClassName: classNames?.selected,
    })

    let _data = dataSource;

    if (objectShowInColumn) {
        if (columnConfs1 && columnConfs1.length < _data.length)
            _data = dataSource.slice(0, columnConfs1.length);
    } else {
        if (rowConfs1 && rowConfs1.length < _data.length)
            _data = dataSource.slice(0, rowConfs1.length);
    }

    function* _Row(rowIdx: number): Generator<{ val: any, colIdx: number, colSpan?: number, rowSpan?: number }> {
        let val;
        // table head
        if (rowIdx == SELECTABLE_HEAD_ROW_INDEX) {
            // left most column
            if (rowConfs1 && columnConfs1 && !disallowHeadColumn)
                yield { val: "", colIdx: SELECTABLE_HEAD_COLUMN_INDEX };
            if (columnConfs1 && !disallowHeadColumn)
                for (let colIdx = 0; colIdx < columnConfs1.length; colIdx++) {
                    if (columnConfs1[colIdx].header == null) {
                        // yield null;
                    } else {
                        val = renderObject(columnConfs1[colIdx].header, colIdx, rowIdx, columnHeadRenderer);
                        yield { val, colIdx };
                    }
                }
        } else {
            // table content
            if (objectShowInColumn) {
                // left most column
                if (rowConfs1 && !disallowHeadColumn) {
                    if (rowConfs1[rowIdx]?.header == null) {
                        // yield null;
                    } else {
                        val = renderObject(rowConfs1[rowIdx].header, SELECTABLE_HEAD_COLUMN_INDEX, rowIdx, rowHeadRenderer);
                        yield { val, colIdx: SELECTABLE_HEAD_COLUMN_INDEX, rowSpan: rowConfs1[rowIdx].rowSpan };
                    }
                }
                for (let colIdx = 0; colIdx < _data.length; colIdx++) {
                    let oldColIdx = colIdx; // remember current idx
                    let oldValue = getValue(_data[oldColIdx], rowConfs1?.[rowIdx].field, rowIdx);
                    let colSpan = 0;
                    if (mergeSameColumns && mergeSameValuesInRow!.includes(rowIdx)) {
                        let next = _data[colIdx + 1];
                        let nextValue = getValue(next, rowConfs1?.[rowIdx].field, rowIdx);
                        while (next && nextValue === oldValue) {
                            next = _data[++colIdx + 1];
                            nextValue = getValue(next, rowConfs1?.[rowIdx].field, rowIdx);
                        }
                        colSpan = colIdx - oldColIdx + 1;
                    }
                    val = renderObject(oldValue, oldColIdx, rowIdx, rowConfs1?.[rowIdx]?.cellRenderer || cellRenderer);
                    if (colSpan > 1) {
                        yield { val, colIdx: oldColIdx, colSpan };
                    }
                    else
                        yield { val, colIdx: oldColIdx };
                }
            } else {
                // row head: the left most column
                if (rowConfs1) {
                    if (rowConfs1[rowIdx]?.header == null) {
                        // yield null;
                    } else {
                        val = renderObject(rowConfs1[rowIdx]?.header, SELECTABLE_HEAD_COLUMN_INDEX, rowIdx, rowHeadRenderer);
                        yield { val, colIdx: SELECTABLE_HEAD_COLUMN_INDEX, rowSpan: rowConfs1[rowIdx].rowSpan };
                    }
                }
                if (columnConfs1)
                    for (let colIdx = 0; colIdx < columnConfs1.length; colIdx++) {
                        // use `unknown` for hacking type
                        val = renderObject(getValue(_data[rowIdx], columnConfs1?.[colIdx]?.field as unknown as keyof T, colIdx), colIdx, rowIdx, columnConfs1?.[colIdx]?.cellRenderer || cellRenderer);
                        yield { val, colIdx };
                    }
            }
        }
    }

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        if (getGridTemplateColumns && rootRef && rootRef.current) {
            let columnLen = columnConfs1 ? columnConfs1?.length : _data.length;
            if (rowConfs1)
                columnLen += 1;
            rootRef.current.style.gridTemplateColumns = getGridTemplateColumns(_data, columnLen);
        }
    }, [_data]);

    return (
        <div className={clsx(className, allowSelect ? "cursor-pointer" : "", "overflow-x-auto")} ref={rootRef}>
            {
                // table head
                [..._Row(SELECTABLE_HEAD_ROW_INDEX)].map((v, colIdx) => {
                    if (v == null) {
                        console.warn(`v should not be null for rowIdx ${SELECTABLE_HEAD_ROW_INDEX}, colIdx ${colIdx}`)
                        return null;
                    }
                    const cls = clsx(
                        classNames?.headColumn,
                        v.colIdx == SELECTABLE_HEAD_COLUMN_INDEX ? classNames?.headRow : "",
                        columnConfs1?.[v.colIdx]?.headClassName ?? "",
                        rowConfs1?.[SELECTABLE_HEAD_ROW_INDEX]?.headClassName ?? "",
                    );
                    const selectableProps = getColumnSelectableProps(SELECTABLE_HEAD_ROW_INDEX, v.colIdx, cls, typeof v.colSpan != 'undefined' ? [v.colIdx, v.colIdx + v.colSpan] : undefined);
                    return <div
                        id={`${SELECTABLE_HEAD_ROW_INDEX},${v.colIdx}`}
                        key={`${SELECTABLE_HEAD_ROW_INDEX},${v.colIdx}`}
                        {...selectableProps}
                    >
                        {v && v.val}
                    </div>
                }
                )
            }
            {
                // table content
                (objectShowInColumn
                    ? rowConfs1 ? (rowConfs1?.map((_minorConf, minorConfIdx) => [..._Row(minorConfIdx)])) : []
                    : _data.map((_d, i) => [..._Row(i)])
                )
                    .map((row, rowIdx) => {
                        return row.map((v, colIdx) => {
                            if (v == null) {
                                return null;
                            }

                            const className = clsx(
                                v.colIdx >= 0 ? rowConfs1?.[rowIdx]?.contentClassName ?? "" : "",
                                rowIdx == 0 && !columnConfs1 ? classNames?.columnCellHeader : "",
                                classNames?.columnCell,
                                v.colIdx == SELECTABLE_HEAD_COLUMN_INDEX ? classNames?.headRow : "",
                                v.colIdx == SELECTABLE_HEAD_COLUMN_INDEX && rowConfs1?.[rowIdx]?.headClassName,
                            );

                            const style = getStyle(v);
                            const spanColIndexRange = typeof v.colSpan !== "undefined" ? [v.colIdx, v.colIdx + v.colSpan] : undefined;

                            return <div
                                id={`__columnSelectabletable__${rowIdx},${v.colIdx}`}
                                key={`__columnSelectabletable__${rowIdx},${v.colIdx}`}
                                style={style}
                                {...getColumnSelectableProps(rowIdx, v.colIdx, className, spanColIndexRange)}
                            >
                                {v && v.val}
                            </div>
                        })
                    })
            }
        </div>
    );
}

export const ColumnSelectableTable = React.memo(_ColumnSelectableTable) as typeof _ColumnSelectableTable;
