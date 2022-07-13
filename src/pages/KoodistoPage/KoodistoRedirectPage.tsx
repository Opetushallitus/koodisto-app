import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { koodistoListAtom } from '../../api/koodisto';
import { Loading } from '../../components/Loading';

export const KoodistoRedirectPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { koodistoUri } = useParams();
    const [koodistot] = useAtom(koodistoListAtom);
    useEffect(() => {
        const found = koodistot.find((koodisto) => koodisto.koodistoUri === koodistoUri);
        found && navigate(`${location.pathname}/${found.versio}`);
    }, [koodistot, koodistoUri, navigate, location]);
    return <Loading />;
};
