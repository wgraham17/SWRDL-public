import React from 'react';
import { Helmet } from 'react-helmet';
import Logo from '../images/mark.png';
import AppleBadge from '../images/apple-badge';
import GooglePlayBadge from '../images/google-play-badge.png';

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
                <div className="download-badges">
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

export default IndexPage;
