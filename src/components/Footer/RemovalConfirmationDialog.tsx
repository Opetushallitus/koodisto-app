import React from 'react';
import styled from 'styled-components';
import Button from '@opetushallitus/virkailija-ui-components/Button';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

const CloseWrapper = styled.div`
    position: absolute;
    top: 0;
    right: 0.4rem;
    font-size: x-large;
    color: #bbbbbb;
    cursor: pointer;
`;

const ButtonWrapper = styled.div`
    margin-top: 1rem 0;
`;

const ContentWrapper = styled.div`
    margin: 1rem;
    > p > input {
        margin-right: 0.5rem;
    }
`;

const RemovalConfirmationDialog: React.FC<{
    close?: () => void;
    action: () => void;
    msgkey: MessageDescriptor;
    children: JSX.Element;
}> = ({ close, action, msgkey, children }) => {
    const [confirmed, setConfirmed] = React.useState<boolean>(false);
    const toggle = () => setConfirmed(!confirmed);
    return (
        <ContentWrapper>
            <CloseWrapper id="close-dialog" role="button" onClick={close}>
                &times;
            </CloseWrapper>
            {children}
            <p>
                <input name="REMOVE_CONFIRMATION" type="checkbox" onChange={toggle} checked={confirmed} />
                <FormattedMessage {...msgkey} />
            </p>
            <ButtonWrapper>
                <Button name="REMOVE_ACTION" onClick={action} disabled={!confirmed}>
                    <FormattedMessage id="VAHVISTA_POISTO" defaultMessage={'Vahvista poisto'} />
                </Button>
            </ButtonWrapper>
        </ContentWrapper>
    );
};

export default RemovalConfirmationDialog;
