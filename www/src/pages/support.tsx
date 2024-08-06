import React from 'react';
import { Helmet } from 'react-helmet';
import Logo from '../images/mark.png';

function IndexPage() {
    return (
        <>
            <Helmet>
                <title>SWRDL, the Social Word Game!</title>
                <meta property="og:title" content="SWRDL, the Social Word Game!" />
                <meta property="og:image" content="https://swrdl.app/join_og.png" />
            </Helmet>
            <main className="main">
                <img className="logo" src={Logo} alt="SWRDL Logo" />
                <section className="join-container">
                    <span>Need support with SWRDL?</span>
                    <a href="mailto:hello@swrdl.app">Email us! hello@swrdl.app</a>
                </section>
            </main>
        </>
    );
}

export default IndexPage;
