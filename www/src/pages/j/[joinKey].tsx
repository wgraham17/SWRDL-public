import React from 'react';
import { Helmet } from 'react-helmet';
import Logo from '../../images/mark.png';
import AppleBadge from '../../images/apple-badge';
import GooglePlayBadge from '../../images/google-play-badge.png';

interface PageParams {
    params: { joinKey: string };
}

export default function JoinPage({ params: { joinKey } }: PageParams) {
    return (
        <>
            <Helmet>
                <title>SWRDL, the Social Word Game!</title>
                <meta property="og:title" content="Join my game on SWRDL!" />
                <meta property="og:description" content="You've been invited to join a SWRDL game." />
                <meta property="og:image" content="https://swrdl.app/join_og.png" />
            </Helmet>
            <main className="main">
                <img className="logo" src={Logo} alt="SWRDL Logo" />
                <section className="join-container">
                    <span>Joining your game...</span>
                    <a href={`swrdl://join/${joinKey}`}>Click here if SWRDL does not launch.</a>
                </section>
                <div className="download-badges">
                    <h4>Don&apos;t have SWRDL yet?</h4>
                    <a href="https://apps.apple.com/us/app/swrdl/id1626877943">
                        <AppleBadge className="apple-badge" />
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=app.swrdl">
                        <img src={GooglePlayBadge} alt="Get SWRDL on Google Play" className="google-badge" />
                    </a>
                </div>
            </main>
            <footer>
                <span>App Store and the Apple logo are trademarks of Apple Inc.</span>
                <span>Google Play and the Google Play logo are trademarks of Google LLC.</span>
            </footer>
        </>
    );
}
