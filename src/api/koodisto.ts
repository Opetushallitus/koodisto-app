import { API_BASE_PATH, API_INTERNAL_PATH } from '../context/constants';
import { atom, Getter } from 'jotai';
import {
    ApiDate,
    Kieli,
    Koodi,
    ListKoodisto,
    Metadata,
    PageKoodisto,
    KoodistoRelation,
    OrganisaatioNimi,
    Locale,
    Tila,
} from '../types';
import { casMeLangAtom } from './kayttooikeus';
import { parseApiDate, translateMetadata, parseUIDate, translateMultiLocaleText } from '../utils';
import { errorHandlingWrapper } from './errorHandling';
import axios from 'axios';
import { fetchOrganisaatioNimi } from './organisaatio';
import type { MapToApiObject, BaseKoodisto } from '../types';

const urlAtom = atom<string>(`${API_INTERNAL_PATH}/koodisto`);

type ApiRyhmaMetadata = {
    id: number;
    uri: string;
    kieli: Kieli;
    nimi: string;
};

type ApiBaseKoodisto = MapToApiObject<BaseKoodisto>;

export type ApiPageKoodisto = ApiBaseKoodisto & {
    lockingVersion: number;
    koodistoRyhmaUri: string;
    resourceUri: string;
    omistaja: string;
    organisaatioOid: string;
    koodistoRyhmaMetadata: Metadata[];
    paivitysPvm: ApiDate;
    paivittajaOid: string;
    tila: Tila;
    koodistoVersio: number[];
    sisaltyyKoodistoihin: KoodistoRelation[];
    sisaltaaKoodistot: KoodistoRelation[];
    rinnastuuKoodistoihin: KoodistoRelation[];
    koodiList: Koodi[];
    metadata: Metadata[];
};
type ApiListKoodisto = ApiBaseKoodisto & {
    metadata: Metadata[];
    koodistoRyhmaMetadata: ApiRyhmaMetadata[];
    koodiCount: number;
};

type CreateKoodistoDataType = {
    voimassaAlkuPvm: ApiDate;
    voimassaLoppuPvm?: ApiDate;
    omistaja: string;
    organisaatioOid: string;
    metadataList: Metadata[];
};
type UpdateKoodistoDataType = CreateKoodistoDataType & {
    tila: Tila;
    codesGroupUri: string;
    koodistoUri: string;
    versio: number;
    lockingVersion: number;
};

const apiKoodistoListToKoodistoList = (a: ApiListKoodisto, lang: Kieli): ListKoodisto => {
    console.log(a.metadata, a.koodistoRyhmaMetadata);
    const nimi = translateMetadata({ metadata: a.metadata, lang })?.nimi;
    const ryhmaNimi = translateMetadata({ metadata: a.koodistoRyhmaMetadata, lang })?.nimi;
    return {
        ryhmaUri: a.koodistoRyhmaMetadata?.[0]?.uri || undefined,
        koodistoUri: a.koodistoUri,
        versio: a.versio,
        voimassaAlkuPvm: a.voimassaAlkuPvm && parseApiDate(a.voimassaAlkuPvm),
        voimassaLoppuPvm: a.voimassaLoppuPvm && parseApiDate(a.voimassaLoppuPvm),
        nimi,
        ryhmaNimi,
        koodiCount: a.koodiCount,
    };
};

const apiKoodistoListAtom = atom<Promise<ApiListKoodisto[]>>(async (get: Getter) => {
    const { data } = await axios.get<ApiListKoodisto[]>(get(urlAtom));
    return data;
});

export const koodistoListAtom = atom<ListKoodisto[]>((get: Getter) => {
    const lang = get(casMeLangAtom);
    return get(apiKoodistoListAtom).map((a) => apiKoodistoListToKoodistoList(a, lang));
});

export const fetchKoodiListByKoodisto = async ({
    koodistoUri,
    koodistoVersio,
}: {
    koodistoUri: string;
    koodistoVersio?: number;
}): Promise<Koodi[] | undefined> => {
    return errorHandlingWrapper(async () => {
        const { data } = await axios.get<Koodi[]>(`${API_BASE_PATH}/json/${koodistoUri}/koodi`, {
            params: koodistoVersio !== undefined ? { koodistoVersio } : {},
        });
        return data;
    });
};

export const updateKoodisto = async ({
    koodisto,
    lang,
}: {
    koodisto: PageKoodisto;
    lang: Kieli;
}): Promise<PageKoodisto | undefined> => {
    return upsertKoodisto({
        koodisto,
        lang,
        mapper: mapPageKoodistoToUpdatePageKoodisto,
        path: `${API_INTERNAL_PATH}/koodisto`,
    });
};
export const createKoodisto = async ({
    koodisto,
    lang,
}: {
    koodisto: PageKoodisto;
    lang: Kieli;
}): Promise<PageKoodisto | undefined> => {
    return upsertKoodisto({
        koodisto,
        lang,
        mapper: mapPageKoodistoToCreatePageKoodisto,
        path: `${API_INTERNAL_PATH}/koodisto/${koodisto.koodistoRyhmaUri.value}`,
    });
};
export const upsertKoodisto = async <T>({
    koodisto,
    lang,
    mapper,
    path,
}: {
    koodisto: PageKoodisto;
    lang: Kieli;
    mapper: (a: PageKoodisto) => T;
    path: string;
}): Promise<PageKoodisto | undefined> => {
    return errorHandlingWrapper(async () => {
        const { data: apiKoodisto } = await axios.post<ApiPageKoodisto>(path, mapper(koodisto));
        return (
            apiKoodisto && {
                ...mapApiPageKoodistoToPageKoodisto({
                    api: apiKoodisto,
                    lang,
                    organisaatioNimi: await fetchOrganisaatioNimi(apiKoodisto.organisaatioOid),
                }),
            }
        );
    });
};

const mapApiPageKoodistoToPageKoodisto = ({
    api,
    lang,
    organisaatioNimi,
}: {
    api: ApiPageKoodisto;
    lang: Kieli;
    organisaatioNimi?: OrganisaatioNimi;
}): PageKoodisto => {
    const metadata = [...api.metadata];
    (['FI', 'SV', 'EN'] as Kieli[]).forEach(
        (kieli) => metadata.find((a) => a.kieli === kieli) || api.metadata.push({ ...metadata[0], kieli })
    );
    return {
        ...api,
        organisaatioNimi,
        koodistoRyhmaUri: {
            label: translateMetadata({ metadata: api.koodistoRyhmaMetadata, lang })?.nimi || api.koodistoRyhmaUri,
            value: api.koodistoRyhmaUri,
        },
        organisaatioOid: {
            label: `${translateMultiLocaleText({
                multiLocaleText: organisaatioNimi,
                locale: lang.toLowerCase() as Locale,
                defaultValue: api.organisaatioOid,
            })} ${api.organisaatioOid}`,
            value: api.organisaatioOid,
        },
        voimassaAlkuPvm: api.voimassaAlkuPvm && parseApiDate(api.voimassaAlkuPvm),
        voimassaLoppuPvm: api.voimassaLoppuPvm && parseApiDate(api.voimassaLoppuPvm),
        paivitysPvm: parseApiDate(api.paivitysPvm),
    };
};

function mapPageKoodistoToCreatePageKoodisto(koodisto: PageKoodisto): CreateKoodistoDataType {
    return {
        omistaja: koodisto.omistaja,
        metadataList: koodisto.metadata,
        organisaatioOid: koodisto.organisaatioOid.value,
        voimassaAlkuPvm: koodisto.voimassaAlkuPvm && parseUIDate(koodisto.voimassaAlkuPvm),
        voimassaLoppuPvm: koodisto.voimassaLoppuPvm && parseUIDate(koodisto.voimassaLoppuPvm),
    };
}

function mapPageKoodistoToUpdatePageKoodisto(koodisto: PageKoodisto): UpdateKoodistoDataType {
    return {
        lockingVersion: koodisto.lockingVersion,
        tila: koodisto.tila,
        versio: koodisto.versio,
        codesGroupUri: koodisto.koodistoRyhmaUri.value,
        koodistoUri: koodisto.koodistoUri,
        ...mapPageKoodistoToCreatePageKoodisto(koodisto),
    };
}

export const fetchPageKoodisto = async ({
    koodistoUri,
    versio,
    lang,
}: {
    koodistoUri: string;
    versio: number;
    lang: Kieli;
}): Promise<PageKoodisto | undefined> => {
    return errorHandlingWrapper(async () => {
        const { data: apiPageKoodisto } = await axios.get<ApiPageKoodisto>(
            `${API_INTERNAL_PATH}/koodisto/${koodistoUri}/${versio}`
        );
        if (apiPageKoodisto) {
            const organisaatioNimi = await fetchOrganisaatioNimi(apiPageKoodisto.organisaatioOid);
            return { ...mapApiPageKoodistoToPageKoodisto({ api: apiPageKoodisto, lang, organisaatioNimi }) };
        } else {
            return undefined;
        }
    });
};
