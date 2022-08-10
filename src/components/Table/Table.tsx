import React, { ReactNode, useEffect, useMemo, HTMLProps } from 'react';
import styled from 'styled-components';
import { useIntl } from 'react-intl';
import Input from '@opetushallitus/virkailija-ui-components/Input';
import Select from '@opetushallitus/virkailija-ui-components/Select';
import { ValueType } from 'react-select';
import { SelectOptionType } from '../../types';
import {
    Column,
    Row,
    useReactTable,
    HeaderGroup,
    Table as ReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    ColumnFiltersState,
    getFilteredRowModel,
    getFacetedUniqueValues,
    getFacetedRowModel,
    CellContext,
    HeaderContext,
    RowData,
} from '@tanstack/react-table';
import { IconWrapper } from '../IconWapper';
import { uniq, uniqBy } from 'lodash';

declare module '@tanstack/table-core' {
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        filterPlaceHolder?: string;
    }
}

const TableContainer = styled.div<{ modal: boolean }>`
    overflow-x: scroll;
    overflow-y: hidden;
    padding: ${(props) => (props.modal ? 0 : 1)}rem;
    border: ${(props) => (props.modal ? 0 : 1)}px solid #cccccc;
`;
const TableElement = styled.table`
    width: 100%;
    min-height: 5vh;
    max-height: 60vh;
    border-spacing: 0;
`;
const Th = styled.th`
    text-align: left;
`;
const Td = styled.td`
    font-family: Roboto, Arial Unicode MS, Arial, sans-serif;
    font-weight: 400;
`;
const Tr = styled.tr``;
const Thead = styled.thead`
    ${Tr}:first-child ${Th} {
        border-bottom: 1px solid rgba(151, 151, 151, 0.5);
    }
`;

const Tbody = styled.tbody`
    ${Tr}:nth-child(even) {
        background: rgba(245, 245, 245, 1);
    }

    ${Tr}:nth-child(odd) {
        background: rgba(255, 255, 255, 0);
    }
`;

const FilterContainer = styled.div`
    margin-top: 1rem;
    margin-bottom: 1rem;
    margin-right: 1rem;
`;
const SelectContainer = styled(FilterContainer)`
    min-width: 17rem;
`;

const InputContainer = styled(FilterContainer)`
    max-width: 25rem;
`;

type TableProps<T extends object> = {
    columns: ColumnDef<T>[];
    data: T[];
};

export const Table = <T extends object>({
    columns,
    data,
    onFilter,
    children,
    modal,
    setSelected,
}: TableProps<T> & {
    children?: ReactNode;
    modal?: boolean;
    onFilter?: (rows: Row<T>[]) => void;
    setSelected?: (selectedRows: T[]) => void;
}) => {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const appliedColumns = useMemo(
        () => [
            ...((setSelected && [
                {
                    id: 'select',
                    header: (prop: HeaderContext<T, unknown>) => (
                        <IndeterminateCheckbox
                            {...{
                                checked: prop.table.getIsAllRowsSelected(),
                                indeterminate: prop.table.getIsSomeRowsSelected(),
                                onChange: prop.table.getToggleAllRowsSelectedHandler(),
                            }}
                        />
                    ),
                    cell: (prop: CellContext<T, unknown>) => (
                        <div className="px-1">
                            <IndeterminateCheckbox
                                {...{
                                    checked: prop.row.getIsSelected(),
                                    indeterminate: prop.row.getIsSomeSelected(),
                                    onChange: prop.row.getToggleSelectedHandler(),
                                }}
                            />
                        </div>
                    ),
                },
            ]) ||
                []),
            ...columns,
        ],
        [columns, setSelected]
    );
    const table = useReactTable<T>({
        columns: appliedColumns,
        data,
        state: {
            columnFilters,
            rowSelection,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedRowModel: getFacetedRowModel(),
        onColumnFiltersChange: setColumnFilters,

        onRowSelectionChange: setRowSelection,
    });

    useEffect(
        () =>
            onFilter &&
            onFilter(
                (columnFilters.length > 0 && table.getFilteredRowModel().rows) || table.getFilteredRowModel().rows
            ),
        [table, columnFilters, onFilter]
    );

    useEffect(
        () =>
            setSelected &&
            setSelected(
                (Object.keys(rowSelection).length > 0 && table.getSelectedRowModel().rows.map((a) => a.original)) || []
            ),
        [rowSelection, setSelected, table]
    );
    return (
        <TableContainer modal={!!modal}>
            <TableElement>
                <Thead>
                    {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => {
                        return (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <Th key={header.id} colSpan={header.colSpan}>
                                            {!header.isPlaceholder && (
                                                <>
                                                    <div>
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    </div>
                                                    {header.column.getCanFilter() && (
                                                        <div>
                                                            <Filter column={header.column} table={table} />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </Th>
                                    );
                                })}
                            </Tr>
                        );
                    })}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map((row: Row<T>) => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {' '}
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Td>
                                    );
                                })}
                            </Tr>
                        );
                    })}
                </Tbody>
            </TableElement>

            {children}
        </TableContainer>
    );
};
const ResetFilter = ({ resetFilters }: { resetFilters: (() => void) | undefined }) =>
    resetFilters ? (
        <IconWrapper
            id="clear-filter"
            onClick={resetFilters}
            icon="ci:off-outline-close"
            color={'gray'}
            height={'1.5rem'}
        />
    ) : (
        <IconWrapper icon="ci:search" color={'gray'} height={'1.5rem'} />
    );

function Filter<T>({ column, table }: { column: Column<T, unknown>; table: ReactTable<T> }) {
    const { formatMessage } = useIntl();
    const columnFilterValue = column.getFilterValue();
    const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);
    const sortedUniqueValues = React.useMemo(
        () =>
            (typeof firstValue === 'number' && []) ||
            (typeof firstValue === 'string' && uniq(Array.from(column.getFacetedUniqueValues().keys())).sort()) ||
            uniqBy(Array.from(column.getFacetedUniqueValues().keys()), (a: SelectOptionType) => a.value).sort(
                (a: SelectOptionType, b: SelectOptionType) => a.label.localeCompare(b.label)
            ),
        [column, firstValue]
    );
    return (
        (typeof firstValue === 'string' && (
            <InputContainer>
                <DebouncedInput
                    value={(columnFilterValue ?? '') as string}
                    onChange={(value) => column.setFilterValue(value)}
                    placeholder={column.columnDef.meta?.filterPlaceHolder}
                    suffix={
                        <ResetFilter
                            resetFilters={column.getIsFiltered() ? () => column.setFilterValue(undefined) : undefined}
                        ></ResetFilter>
                    }
                />
            </InputContainer>
        )) || (
            <SelectContainer>
                <Select
                    onChange={(values: ValueType<SelectOptionType>) => column.setFilterValue(values)}
                    placeholder={formatMessage({
                        id: 'TAULUKKO_DROPDOWN_FILTTERI',
                        defaultMessage: 'Valitse arvo listalta',
                    })}
                    isMulti={true}
                    value={(column.getFilterValue() as ValueType<{ label: string; value: string }>) || []}
                    options={sortedUniqueValues.map((a: SelectOptionType) => ({ label: a.label, value: a.value }))}
                />
            </SelectContainer>
        )
    );
}

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
    suffix?: JSX.Element;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue);

    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [debounce, onChange, value]);

    return (
        <Input
            {...props}
            value={value}
            onChange={(e: React.FormEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
        />
    );
}

function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ref = React.useRef<HTMLInputElement>(null!);

    React.useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = !rest.checked && indeterminate;
        }
    }, [ref, indeterminate, rest.checked]);

    return <input type="checkbox" ref={ref} className={className + ' cursor-pointer'} {...rest} />;
}
