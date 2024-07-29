import { ProgressBar } from "@/components/ProgressBar";
import { DataProvider } from "@/helper/context";
import { AdminLayout } from "@/layout";
import { GOOGLE_CLIENT_ID } from "@/lib/utils";
import "@/styles/globals.css";
import { AppPropsWithLayout } from "@/types/next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConfigProvider } from "antd";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import { SSRProvider } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Toastify.css";
config.autoAddCss = false;

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="_globalsign-domain-verification"
          content="TD0fMFM1DnZtKbWRPSe85-vG7Vnhe-9Tpg5xzLE7HA"
        />
        <title>Од онлайн дэлгүүр</title>
        <meta name="description" content="Star хүргэлтийн апп" />
        <link rel="icon" href="/assets/guru_logo/favicon.ico" />
      </Head>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <SessionProvider session={session}>
          <ConfigProvider
            theme={{
              token: {
                fontSize: 12,
                // Seed Token
                // colorPrimary: "#912424",
                borderRadius: 2,

                // Alias Token
                colorBgContainer: "#FFFFFF",
              },
            }}
          >
            <SSRProvider>
              <ProgressBar />
              <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
              <DataProvider>
                <AdminLayout hideHeader={Component.hideHeader ?? false}>
                  <Component {...pageProps} />
                </AdminLayout>
              </DataProvider>
            </SSRProvider>
          </ConfigProvider>
        </SessionProvider>
      </GoogleOAuthProvider>
    </>
  );
}

export default MyApp;
