import React from 'react';
import styled from 'styled-components';
import type { PageKoodi } from '../../types';
import { InfoFields } from './InfoFields';

const NameContainer = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
    li div {
        display: inline-block;
        min-width: 2rem;
    }
`;

export const KoodiInfo: React.FC<Pick<PageKoodi, 'koodi'>> = ({ koodi }: Pick<PageKoodi, 'koodi'>) => {
    const fields = [
        {
            header: {
                id: 'NIMI',
                defaultMessage: 'Nimi',
            },
            value: (
                <NameContainer>
                    {koodi.metadata.map((meta) => (
                        <li key={meta.kieli}>
                            <div>{meta.kieli}</div>
                            <div>{meta.nimi}</div>
                        </li>
                    ))}
                </NameContainer>
            ),
        },
        {
            header: {
                id: 'KOODIARVO',
                defaultMessage: 'Koodiarvo',
            },
            value: koodi.koodiArvo,
        },
        {
            header: {
                id: 'KOODISTOSIVU_AVAIN_URI_TUNNUS',
                defaultMessage: 'URI-tunnus',
            },
            value: koodi.koodiUri,
        },
        {
            header: {
                id: 'VOIMASSA',
                defaultMessage: 'Voimassa',
            },
            value: koodi.voimassaAlkuPvm,
        },
        {
            header: {
                id: 'KUVAUS',
                defaultMessage: 'Kuvaus',
            },
            value: koodi.metadata[0].kuvaus || '-',
        },
        {
            header: {
                id: 'UPDATED',
                defaultMessage: 'Päivitetty',
            },
            value: `${koodi.paivitysPvm} (${koodi.paivittajaOid})`,
        },
    ];

    return <InfoFields fields={fields} />;
};
