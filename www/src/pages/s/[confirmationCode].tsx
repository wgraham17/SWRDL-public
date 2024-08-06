import React from 'react';
import { Helmet } from 'react-helmet';
import Logo from '../../images/mark.png';

interface PageParams {
    params: { confirmationCode: string };
}

export default function SetupRecoveryPage({ params: { confirmationCode } }: PageParams) {
    return (
        <>
            <Helmet>
                <title>SWRDL, the Social Word Game!</title>
            </Helmet>
            <main className="main">
                <img className="logo" src={Logo} alt="SWRDL Logo" />
                <section className="join-container">
                    <span>Finish Setting Up Account Recovery</span>
                    <a href={`swrdl://setup-recovery/${confirmationCode}`}>Click here if SWRDL does not launch.</a>
                </section>
            </main>
        </>
    );
}
