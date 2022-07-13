import React from 'react';
import { KoodistoTablePage } from './pages/KoodistoTablePage';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { Notification } from './components/Notification';
import { KoodistoPage, KoodistoMuokkausPage, KoodistoRedirectPage } from './pages/KoodistoPage';
import KoodiPage from './pages/KoodiPage';
import { Loading } from './components/Loading';
import { KoodiMuokkausPage } from './pages/KoodiMuokkausPage';

export const PageBase = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    flex-wrap: nowrap;
    min-height: 87vh;
`;

const App: React.FC = () => {
    return (
        <BrowserRouter basename={'/koodisto-app'}>
            <Notification />
            <PageBase>
                <React.Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path={'/'} element={<KoodistoTablePage />} />
                        <Route path={'/koodistoRyhma/:koodistoRyhmaUri'} element={<KoodistoTablePage />} />
                        <Route path="/koodisto/view/:koodistoUri" element={<KoodistoRedirectPage />} />
                        <Route path="/koodisto/view/:koodistoUri/:versio" element={<KoodistoPage />} />
                        <Route path="/koodisto/edit/:koodistoUri/:versio" element={<KoodistoMuokkausPage />} />
                        <Route path="/koodisto/edit" element={<KoodistoMuokkausPage />} />
                        <Route path="/koodi/view/:koodiUri/:koodiVersio" element={<KoodiPage />} />
                        <Route path="/koodi/edit/:koodiUri/:koodiVersio" element={<KoodiMuokkausPage />} />
                        <Route path="/koodi/edit" element={<KoodiMuokkausPage />} />

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </React.Suspense>
            </PageBase>
        </BrowserRouter>
    );
};

export default App;
