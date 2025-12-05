import Head from "next/head"



export const DefaultHead = () => {
    return (
        <Head>
            <title>Flume</title>
            <meta name="description" content="Learn and build on Solana with a visual playground." />
            <meta name="image" content="/og.png" />
            <meta property="og:title" content={"Flume"} />
            <meta property="og:description" content={"Learn and build on Solana with a visual playground."} />
            <meta property="og:image" content="/og.png" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://flume.app" />
            <meta property="og:site_name" content={"Flume"} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={"Flume"} />
            <meta name="twitter:description" content={"Learn and build on Solana with a visual playground"} />
            <meta name="twitter:image" content="/og.png" />
            <meta name="twitter:image:alt" content={"Learn and build on Solana with a visual playground"} />
            <meta name="twitter:site" content={"@flume_app"} />
            <meta name="twitter:creator" content={"@flume_app"} />
            <link rel="icon" href="/favicon.ico" />
        </Head>
    )
}
