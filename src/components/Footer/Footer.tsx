import * as React from 'react';
import { FooterContainer, FooterLeftContainer, FooterRightContainer } from '../Containers';
import Button from '@opetushallitus/virkailija-ui-components/Button';
import { FormattedMessage } from 'react-intl';
import { IconWrapper } from '../IconWapper';
import { useNavigate } from 'react-router-dom';

type Props = {
    returnPath: string;
    save: () => void;
    localisationPrefix: 'KOODI' | 'KOODISTO';
};
export const Footer: React.FC<Props> = ({ returnPath, save, localisationPrefix }) => {
    const navigate = useNavigate();
    return (
        <FooterContainer>
            <FooterLeftContainer>
                <Button variant={'outlined'} name={`${localisationPrefix}_VERSIOI`}>
                    <FormattedMessage
                        id={`${localisationPrefix}_VERSIOI`}
                        defaultMessage={`Versioi ${localisationPrefix.toLowerCase()}`}
                    />
                </Button>
                <Button variant={'outlined'} name={`${localisationPrefix}_POISTA`}>
                    <IconWrapper icon={'ci:trash-full'} inline={true} height={'1.2rem'} />
                    <FormattedMessage
                        id={`${localisationPrefix}_POISTA`}
                        defaultMessage={`Poista ${localisationPrefix.toLowerCase()}`}
                    />
                </Button>
            </FooterLeftContainer>
            <FooterRightContainer>
                <Button
                    variant={'outlined'}
                    name={`${localisationPrefix}_PERUUTA`}
                    onClick={() => navigate(returnPath)}
                >
                    <FormattedMessage id={`${localisationPrefix}_PERUUTA`} defaultMessage={'Peruuta'} />
                </Button>
                <Button name={`${localisationPrefix}_TALLENNA`} onClick={save}>
                    <FormattedMessage id={`${localisationPrefix}_TALLENNA`} defaultMessage={'Tallenna'} />
                </Button>
            </FooterRightContainer>
        </FooterContainer>
    );
};
