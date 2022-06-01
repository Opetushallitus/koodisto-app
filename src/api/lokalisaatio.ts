import { atom, Getter } from 'jotai';
import { API_LOKALISAATIO_PATH } from '../context/constants';
import { casMeLocaleAtom } from './kayttooikeus';
import gaxios from 'gaxios';
import { Locale } from '../types';

const urlAtom = atom(API_LOKALISAATIO_PATH);
type Lokalisaatio = { locale: Locale; key: string; value: string };

export const lokalisaatioAtom = atom(async (get: Getter): Promise<Lokalisaatio[]> => {
    const locale = get(casMeLocaleAtom);
    const url = get(urlAtom);
    const { data } = await gaxios.request<Lokalisaatio[]>({
        method: 'GET',
        url: `${url}?${new URLSearchParams({ category: 'koodisto', locale })}`,
    });
    return data;
});

export const lokalisaatioMessagesAtom = atom((get: Getter): Record<string, string> => {
    return get(lokalisaatioAtom).reduce((p: Record<string, string>, c: Lokalisaatio) => {
        return { ...p, [c.key]: c.value };
    }, {});
});
