import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Koodi } from '../../types';
import { useIntl, FormattedDate } from 'react-intl';
import { Table } from '../../components/Table';
import { translateMetadata } from '../../utils';
import { useAtom } from 'jotai';
import { casMeLangAtom } from '../../api/kayttooikeus';
import { ColumnDef } from '@tanstack/react-table';

type Props = { koodiList: Koodi[] };
export const KoodiTable: React.FC<Props> = ({ koodiList }) => {
    const { formatMessage } = useIntl();
    const [lang] = useAtom(casMeLangAtom);
    const data = useMemo<Koodi[]>(
        () => [...koodiList].sort((a, b) => a.koodiArvo.localeCompare(b.koodiArvo)),
        [koodiList]
    );
    const [, setFilteredCount] = useState<number>(data.length);

    // this is for message extraction to work properly
    formatMessage({
        id: 'KOODI_TAULUKKO_FILTTERI_PLACEHOLDER',
        defaultMessage: 'Hae nimellä tai koodiarvolla',
    });

    const columns = React.useMemo<ColumnDef<Koodi>[]>(
        () => [
            {
                header: formatMessage({ id: 'TAULUKKO_KOODI_KOODIARVO', defaultMessage: 'Koodiarvo' }),
                columns: [
                    {
                        id: 'koodiarvo',
                        header: '',
                        enableColumnFilter: true,
                        filterFn: (row, columnId, value) => {
                            return (
                                row.original.koodiArvo.toLowerCase().includes(value.toLowerCase()) ||
                                row.original.metadata.find((a) => a.nimi.toLowerCase().includes(value.toLowerCase())) ||
                                value.length === 0
                            );
                        },
                        accessorFn: (values: Koodi) => values.koodiArvo,
                        cell: (info) => <div>{info.getValue()}</div>,
                    },
                ],
            },
            {
                header: formatMessage({ id: 'TAULUKKO_KOODI_VERSIO', defaultMessage: 'Versio' }),
                columns: [
                    {
                        id: 'versio',
                        cell: (info) => <div>{info.row.original.versio}</div>,
                    },
                ],
            },
            {
                header: formatMessage({ id: 'TAULUKKO_KOODI_NIMI', defaultMessage: 'Nimi' }),
                columns: [
                    {
                        id: 'nimi',
                        cell: (info) => (
                            <Link to={`/koodi/view/${info.row.original.koodiUri}/${info.row.original.versio}`}>
                                {translateMetadata({ metadata: info.row.original.metadata, lang })?.nimi}
                            </Link>
                        ),
                    },
                ],
            },
            {
                header: formatMessage({ id: 'TAULUKKO_KOODI_VOIMASSA', defaultMessage: 'Voimassa' }),
                columns: [
                    {
                        id: 'voimassa',
                        cell: (info) => <FormattedDate value={info.getValue()} />,
                    },
                ],
            },
            {
                header: formatMessage({ id: 'TAULUKKO_KOODI_PAIVITETTY', defaultMessage: 'Päivitetty' }),
                columns: [
                    {
                        id: 'paivitetty',
                        cell: (info) => <FormattedDate value={info.getValue()} />,
                    },
                ],
            },
        ],
        [formatMessage, lang]
    );

    return (
        <Table<Koodi>
            columns={columns}
            data={data}
            onFilter={(rows) => setFilteredCount(rows.length)} // triggers re-render
        />
    );
};
