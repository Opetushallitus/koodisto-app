import { API_BASE_PATH, API_INTERNAL_PATH } from '../context/constants';
import { atom, Getter } from 'jotai';
import { ApiDate, Kieli, Koodi, Metadata } from '../types/types';
import { casMeLangAtom } from './kayttooikeus';
import { parseApiDate, translateMetadata } from '../utils/utils';
import axios from 'axios';
import { errorHandlingWrapper } from './errorHandling';

export type TablePageKoodisto = {
    koodistoUri: string;
    versio: number;
    voimassaAlkuPvm?: Date;
    voimassaLoppuPvm?: Date;
    nimi?: string;
    ryhmaNimi?: string;
    ryhmaId?: number;
    koodiCount: number;
};

export type KoodistoVersio = {
    versio: number;
    paivitysPvm: Date;
    voimassaAlkuPvm: ApiDate;
    voimassaLoppuPvm: ApiDate;
    tila: string;
    version: number;
    metadata: Metadata[];
};

export type KoodistoRelation = {
    codesUri: string;
    codesVersion: number;
    passive: boolean;
    nimi: {
        fi: string;
        sv: string;
        en: string;
    };
    kuvaus: {
        fi: string;
        sv: string;
        en: string;
    };
};

export type KoodistoPageKoodisto = {
    koodistoUri: string;
    resourceUri: string;
    omistaja: string | null;
    organisaatioOid: string;
    organisaatioNimi?: string;
    lukittu: boolean | null;
    codesGroupUri: string;
    version: number;
    versio: number;
    paivitysPvm: ApiDate;
    paivittajaOid: string;
    voimassaAlkuPvm: ApiDate;
    voimassaLoppuPvm: ApiDate;
    tila: string;
    metadata: Metadata[];
    codesVersions: number[];
    withinCodes: KoodistoRelation[];
    includesCodes: KoodistoRelation[];
    levelsWithCodes: KoodistoRelation[];
};
type RyhmaMetadata = {
    id: number;
    uri: string;
    kieli: Kieli;
    nimi: string;
};
type ApiKoodistoList = {
    koodistoUri: string;
    versio: number;
    koodistoRyhmaMetadata: RyhmaMetadata[];
    metadata: Metadata[];
    voimassaAlkuPvm: ApiDate;
    voimassaLoppuPvm: ApiDate;
    koodiCount: number;
};
const urlAtom = atom<string>(`${API_INTERNAL_PATH}/koodisto`);

export const koodistoListAtom = atom<Promise<ApiKoodistoList[]>>(async (get: Getter) => {
    const { data } = await axios.get<ApiKoodistoList[]>(get(urlAtom));
    return data;
});

const apiKoodistoListToKoodistoList = (a: ApiKoodistoList, lang: Kieli): TablePageKoodisto => {
    const nimi = translateMetadata(a.metadata, lang)?.nimi;
    const ryhmaNimi = translateMetadata(
        !!a.koodistoRyhmaMetadata ? a.koodistoRyhmaMetadata : [{ kieli: 'FI', nimi: 'N/A' }],
        lang
    )?.nimi;
    return {
        ryhmaId: a.koodistoRyhmaMetadata?.[0]?.id || undefined,
        koodistoUri: a.koodistoUri,
        versio: a.versio,
        voimassaAlkuPvm: a.voimassaAlkuPvm && parseApiDate(a.voimassaAlkuPvm),
        voimassaLoppuPvm: a.voimassaLoppuPvm && parseApiDate(a.voimassaLoppuPvm),
        nimi,
        ryhmaNimi,
        koodiCount: a.koodiCount,
    };
};

export const koodistoAtom = atom<TablePageKoodisto[]>((get: Getter) => {
    const lang = get(casMeLangAtom);
    return get(koodistoListAtom).map((a) => apiKoodistoListToKoodistoList(a, lang));
});

export const fetchKoodisByKoodisto = async (koodistoUri: string): Promise<Koodi[] | undefined> => {
    return errorHandlingWrapper(async () => {
        const { data } = await axios.get<Koodi[]>(`${API_BASE_PATH}/json/${koodistoUri}/koodi`);
        return data;
    });
};

export const fetchKoodistoByUriAndVersio = async (
    koodistoUri: string,
    versio: string
): Promise<KoodistoPageKoodisto | undefined> => {
    return errorHandlingWrapper(async () => {
        const { data } = await axios.get<KoodistoPageKoodisto>(`${API_BASE_PATH}/codes/${koodistoUri}/${versio}`);
        return data;
    });
};
