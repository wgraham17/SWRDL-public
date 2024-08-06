import React from 'react';
import { Helmet } from 'react-helmet';
import Logo from '../../images/mark.png';

interface PageParams {
    params: { recoveryToken: string };
}

export default function RecoverPage({ params: { recoveryToken } }: PageParams) {
    return (
        <>
            <Helmet>
                <title>SWRDL, the Social Word Game!</title>
            </Helmet>
            <main className="main">
                <img className="logo" src={Logo} alt="SWRDL Logo" />
                <section className="join-container">
                    <span>Finish Account Recovery</span>
                    <a href={`swrdl://recover/${recoveryToken}`}>Click here if SWRDL does not launch.</a>
                </section>
            </main>
        </>
    );
}
