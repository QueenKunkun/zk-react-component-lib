import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

export interface useColumnSelectableTableProps {
    allowSelect?: boolean,
    selectedIndex?: number,
    unselectWhenClickTwice?: boolean,
    onSelectionChange?: (columnIndex: number) => void
    selectedClassName?: string,
}

export const SELECTABLE_HEAD_COLUMN_INDEX = -100000;
export const SELECTABLE_HEAD_ROW_INDEX = -100000;

export const UNSELECTED_INDEX = -1;

export function useColumnSelectableTable({
    allowSelect,
    selectedClassName,
    selectedIndex: originalSelectedIndex,
    onSelectionChange,
    unselectWhenClickTwice = true,
}: useColumnSelectableTableProps) {
    const [selectedIndex, setSelectedIndex] = useState(UNSELECTED_INDEX);
    // console.log(`useColumnSelectableTable selectedIndex=${selectedIndex}`)

    const setSelectedColumnIndex = useCallback((columnIndex: number) => {

        if (columnIndex === selectedIndex) return;
        onSelectionChange?.(columnIndex);
        setSelectedIndex(columnIndex);
    }, [onSelectionChange, selectedIndex, unselectWhenClickTwice]);

    useEffect(() => {
        if (originalSelectedIndex !== undefined) {
            setSelectedColumnIndex(originalSelectedIndex);
        }
    }, [originalSelectedIndex]);

    return (_rowIdx: number, colIdx: number, className?: string, spanColIndexRange?: number[]) => {
        let isChildrenSelected = false;
        if (spanColIndexRange) {
            isChildrenSelected = spanColIndexRange && spanColIndexRange[0] <= selectedIndex && selectedIndex < spanColIndexRange[1];
        }
        const isSelected = selectedIndex === colIdx || isChildrenSelected;
        const onSelect = colIdx >= 0
            ? setSelectedColumnIndex
            : undefined;
        return {
            'aria-selected': isSelected,
            onClick: () => {
                const ci = unselectWhenClickTwice && colIdx === selectedIndex ? UNSELECTED_INDEX : colIdx;
                allowSelect && onSelect?.(ci)
            },
            className: clsx(className,
                isSelected ? selectedClassName : "",
            ),
        };
    }
}
