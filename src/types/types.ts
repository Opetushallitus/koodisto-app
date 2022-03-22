export type Kieli = 'EN' | 'FI' | 'SV';
export type ApiDate = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export type Metadata = {
    kieli: Kieli;
    nimi: string;
    kuvaus?: string;
    lyhytnimi?: string;
    kayttoohje?: string;
    kasite?: string;
    sisaltaamerkityksen?: string;
    eisisallamerkitysta?: string;
    huomioitavakoodi?: string;
    sisaltaakoodiston?: string;
};
