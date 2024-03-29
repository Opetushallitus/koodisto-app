import React from 'react';
import { FooterContainer, FooterLeftContainer, FooterRightContainer } from '../Containers';
import Button from '@opetushallitus/virkailija-ui-components/Button';
import { FormattedMessage } from 'react-intl';
import { IconWrapper } from '../IconWapper';
import { useNavigate } from 'react-router-dom';
import { Tila } from '../../types';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

type Props = {
    returnPath: string;
    save: () => void;
    localisationPrefix: 'KOODI' | 'KOODISTO';
    versionDialog?: (close: () => void) => React.ReactNode;
    removeDialog: (close: () => void) => React.ReactNode;
    state: Tila;
    latest: boolean;
    locked?: boolean;
};

const contentStyle = { width: '300px' };

export const Footer: React.FC<Props> = ({
    returnPath,
    save,
    localisationPrefix,
    versionDialog,
    removeDialog,
    state,
    latest,
    locked,
}) => {
    const navigate = useNavigate();
    return (
        <FooterContainer>
            <FooterLeftContainer>
                {versionDialog && (
                    <Popup
                        position="top left"
                        trigger={
                            <Button variant={'outlined'} name={`${localisationPrefix}_VERSIOI`} disabled={!latest}>
                                <FormattedMessage
                                    id={`${localisationPrefix}_VERSIOI`}
                                    defaultMessage={`Versioi ${localisationPrefix.toLowerCase()}`}
                                />
                            </Button>
                        }
                        {...{ contentStyle }}
                    >
                        {versionDialog}
                    </Popup>
                )}
                <Popup
                    position="top left"
                    trigger={
                        <Button variant={'outlined'} name={`${localisationPrefix}_POISTA`} disabled={locked}>
                            <IconWrapper icon={'ci:trash-full'} inline={true} height={'1.2rem'} />
                            <FormattedMessage
                                id={`${localisationPrefix}_POISTA`}
                                defaultMessage={`Poista ${localisationPrefix.toLowerCase()}`}
                            />
                        </Button>
                    }
                    {...{ contentStyle }}
                >
                    {removeDialog}
                </Popup>
            </FooterLeftContainer>
            <FooterRightContainer>
                <Button
                    variant={'outlined'}
                    name={`${localisationPrefix}_PERUUTA`}
                    onClick={() => navigate(returnPath)}
                >
                    <FormattedMessage id={`${localisationPrefix}_PERUUTA`} defaultMessage={'Peruuta'} />
                </Button>
                <Button name={`${localisationPrefix}_TALLENNA`} onClick={save} disabled={state !== 'LUONNOS'}>
                    <FormattedMessage id={`${localisationPrefix}_TALLENNA`} defaultMessage={'Tallenna'} />
                </Button>
            </FooterRightContainer>
        </FooterContainer>
    );
};
