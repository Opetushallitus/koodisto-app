import React, { ErrorInfo } from 'react';
import ReactDOM from 'react-dom';
import gaxios from 'gaxios';
import Cookies from 'universal-cookie';
import { Provider, useAtom } from 'jotai';
import { ROOT_OID } from './context/constants';
import './index.css';
import { ErrorPage } from './pages/ErrorPage';
import { Loading } from './components/Loading';
import { Raamit } from './components/Raamit';
import createTheme from '@opetushallitus/virkailija-ui-components/createTheme';
import { ThemeProvider } from 'styled-components';
import { casMeLocaleAtom } from './api/kayttooikeus';
import { IntlProvider } from 'react-intl';
import { lokalisaatioMessagesAtom } from './api/lokalisaatio';
import App from './App';

const theme = createTheme();
const cookies = new Cookies();
gaxios.instance.defaults = {
    headers: {
        'Caller-Id': `${ROOT_OID}.koodisto-app`,
        CSRF: cookies.get('CSRF'),
    },
};

export class ErrorBoundary extends React.Component<unknown, { hasError: boolean }> {
    constructor(props: unknown) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        const { hasError } = this.state;
        if (hasError) {
            return <ErrorPage>Service Unavailable</ErrorPage>;
        }
        return this.props.children;
    }
}

const Initialize: React.FC = ({ children }) => {
    const [casMeLocale] = useAtom(casMeLocaleAtom);
    const [messages] = useAtom(lokalisaatioMessagesAtom);
    return (
        <IntlProvider locale={casMeLocale} defaultLocale={'fi'} messages={messages}>
            {children}
        </IntlProvider>
    );
};
ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <Provider>
                <ErrorBoundary>
                    <React.Suspense fallback={<Loading />}>
                        <Initialize>
                            <Raamit>
                                <App />
                            </Raamit>
                        </Initialize>
                    </React.Suspense>
                </ErrorBoundary>
            </Provider>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
