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

export const ConfirmationDialog: React.FC<{
    close?: () => void;
    action: () => void;
    confirmationMessage: MessageDescriptor;
    buttonText: MessageDescriptor;
    children: JSX.Element;
}> = ({ close, action, confirmationMessage, buttonText, children }) => {
    const [confirmed, setConfirmed] = React.useState<boolean>(false);
    const toggle = () => setConfirmed(!confirmed);
    // id="VAHVISTA_POISTO" defaultMessage={'Vahvista poisto'}
    return (
        <ContentWrapper>
            <CloseWrapper id="close-dialog" role="button" onClick={close}>
                &times;
            </CloseWrapper>
            {children}
            <p>
                <input name="CONFIRMATION_CHECK" type="checkbox" onChange={toggle} checked={confirmed} />
                <FormattedMessage {...confirmationMessage} />
            </p>
            <ButtonWrapper>
                <Button name="CONFIRMATION_ACTION" onClick={action} disabled={!confirmed}>
                    <FormattedMessage {...buttonText} />
                </Button>
            </ButtonWrapper>
        </ContentWrapper>
    );
};
