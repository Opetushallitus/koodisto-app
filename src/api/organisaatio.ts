import axios from 'axios';
import { errorHandlingWrapper } from './errorHandling';
import { OrganisaatioNimi, SelectOption } from '../types';
import { atom, Getter, Atom } from 'jotai';
import { sortBy } from 'lodash';
import { translateMultiLocaleText } from '../utils';
import { casMeLocaleAtom } from './kayttooikeus';

const urlAtom = atom<string>('/organisaatio-service');

type Organisaatio = {
    oid: string;
    nimi: OrganisaatioNimi;
};

export const fetchOrganisaatioNimi = async (oid: string): Promise<OrganisaatioNimi | undefined> => {
    return errorHandlingWrapper(async () => {
        const { data } = await axios.get<Organisaatio>(`/organisaatio-service/api/${oid}`);
        return data.nimi;
    });
};

const organisaatioNamesAtom = atom<Promise<Organisaatio[]>>(async (get: Getter) => {
    const { data } = await axios.get<{
        numHits: number;
        organisaatiot: Organisaatio[];
    }>(
        `${get(
            urlAtom
        )}/api/hae?aktiiviset=true&lakkautetut=true&suunnitellut=true&organisaatiotyyppi=organisaatiotyyppi_05`
    );
    return data.organisaatiot;
});
export const organisaatioSelectAtom: Atom<SelectOption[]> = atom((get) => {
    const names = get(organisaatioNamesAtom);
    const locale = get(casMeLocaleAtom);
    return sortBy(
        names.map((organisaatioName) => ({
            value: organisaatioName.oid,
            label: `${translateMultiLocaleText({
                multiLocaleText: organisaatioName.nimi,
                locale,
                defaultValue: organisaatioName.oid,
            })} ${organisaatioName.oid}`,
        })),
        [(o: SelectOption) => o.label]
    );
});
