import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    MainHeaderContainer,
    MainContainer,
    MainContainerRow,
    MainContainerRowTitle,
    MainContainerRowContent,
} from '../../components/Containers';
import { FormattedMessage, useIntl } from 'react-intl';
import { CrumbTrail } from '../../components/CrumbTrail';
import { fetchPageKoodi, updateKoodi, createKoodi } from '../../api/koodi';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Koodi } from '../../types';
import { Loading } from '../../components/Loading';
import Input from '@opetushallitus/virkailija-ui-components/Input';
import { Footer } from '../../components/Footer';
import { DatePickerController, InputArrayController } from '../../components/controllers';
import { success } from '../../components/Notification';

const successNotification = (koodiUri: string) => {
    success({
        title: (
            <FormattedMessage
                id={'KOODI_TALLENNUS_MESSAGE_TITLE'}
                defaultMessage={'Koodi tallennettiin onnistuneesti.'}
            />
        ),
        message: (
            <FormattedMessage
                id={'KOODI_TALLENNUS_MESSAGE'}
                defaultMessage={'Tallennettiin koodi uri:lla {koodiUri}'}
                values={{ koodiUri }}
            />
        ),
    });
};

export const KoodiMuokkausPage: React.FC = () => {
    const { koodiUri, koodiVersio } = useParams();
    const isEditing = koodiUri && koodiVersio;
    const [searchParams] = useSearchParams();
    const newKoodiKoodistoUri = searchParams.get('koodistoUri');
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const formReturn = useForm<Koodi>({
        shouldUseNativeValidation: true,
        defaultValues: {
            metadata: [{ kieli: 'FI' }, { kieli: 'SV' }, { kieli: 'EN' }],
            koodistoUri: newKoodiKoodistoUri || '',
        },
    });
    useEffect(() => {
        if (isEditing) {
            (async () => {
                setLoading(true);
                const data = await fetchPageKoodi(koodiUri, +koodiVersio);
                data && formReturn.reset(data);
                setLoading(false);
            })();
        }
    }, [koodiUri, koodiVersio, formReturn, isEditing]);
    const save = async (koodi: Koodi) => {
        if (isEditing) await persist(koodi, updateKoodi);
        else await persist(koodi, createKoodi);
    };
    const persist = async (koodi: Koodi, persistFunction: (koodi: Koodi) => Promise<Koodi | undefined>) => {
        setLoading(true);
        const data = await persistFunction(koodi);
        setLoading(false);
        if (data) {
            successNotification(data.koodiUri);
            formReturn.reset(data);
            navigate(`/koodi/view/${data.koodiUri}/${data.versio}`);
        }
    };
    return (loading && <Loading />) || <KoodiMuokkausPageComponent {...formReturn} save={save} />;
};
const KoodiMuokkausPageComponent: React.FC<{ save: (a: Koodi) => void } & UseFormReturn<Koodi>> = ({
    register,
    handleSubmit,
    save,
    control,
    getValues,
}) => {
    const { koodiUri, koodiVersio } = useParams();
    const { formatMessage } = useIntl();
    return (
        <>
            <CrumbTrail trail={[{ key: koodiUri || 'newKoodiUri', label: koodiUri || '' }]} />
            <MainHeaderContainer>
                <FormattedMessage id={'KOODI_MUOKKAA_SIVU_TITLE'} defaultMessage={'Muokkaa koodia'} tagName={'h1'} />
            </MainHeaderContainer>
            <MainContainer>
                <MainContainerRow>
                    <MainContainerRowTitle id={'FIELD_TITLE_koodiArvo'} defaultMessage={'Arvo'} />
                    <MainContainerRowContent>
                        <Input {...register('koodiArvo')} />
                    </MainContainerRowContent>
                </MainContainerRow>
                <MainContainerRow>
                    <InputArrayController<Koodi>
                        control={control}
                        getValues={getValues}
                        title={{ id: 'FIELD_ROW_TITLE_NIMI', defaultMessage: 'Nimi*' }}
                        fieldPath={'nimi'}
                        rules={{
                            required: formatMessage({
                                id: 'NIMI_PAKOLLINEN',
                                defaultMessage: 'Sy??t?? nimi',
                            }),
                        }}
                    />
                </MainContainerRow>
                <MainContainerRow>
                    <InputArrayController<Koodi>
                        control={control}
                        getValues={getValues}
                        title={{ id: 'FIELD_ROW_TITLE_LYHYTNIMI', defaultMessage: 'Lyhenne' }}
                        fieldPath={'lyhytNimi'}
                    />
                </MainContainerRow>
                <MainContainerRow>
                    <MainContainerRowTitle id={'FIELD_TITLE_voimassaAlkuPvm'} defaultMessage={'Voimassa'} />
                    <MainContainerRowContent>
                        <DatePickerController<Koodi>
                            name={'voimassaAlkuPvm'}
                            control={control}
                            rules={{
                                required: formatMessage({
                                    id: 'ALKUPVM_PAKOLLINEN',
                                    defaultMessage: 'Valitse aloitusp??iv??m????r??.',
                                }),
                            }}
                        />
                    </MainContainerRowContent>
                </MainContainerRow>
                <MainContainerRow>
                    <MainContainerRowTitle id={'FIELD_TITLE_voimassaLoppuPvm'} defaultMessage={'Voimassa loppu'} />
                    <MainContainerRowContent>
                        <DatePickerController<Koodi> name={'voimassaLoppuPvm'} control={control} />
                    </MainContainerRowContent>
                </MainContainerRow>
                <MainContainerRow>
                    <InputArrayController<Koodi>
                        large={true}
                        control={control}
                        getValues={getValues}
                        title={{ id: 'FIELD_ROW_TITLE_KUVAUS', defaultMessage: 'Kuvaus' }}
                        fieldPath={'kuvaus'}
                    />
                </MainContainerRow>
            </MainContainer>
            <Footer
                returnPath={(koodiUri && `/koodi/view/${koodiUri}/${koodiVersio}`) || '/'}
                save={handleSubmit((a) => save(a))}
                localisationPrefix={'KOODI'}
            />
        </>
    );
};
