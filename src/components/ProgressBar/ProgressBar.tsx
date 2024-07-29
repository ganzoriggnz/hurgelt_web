import { Router } from "next/router";
import NProgress from "nprogress";

Router.events.on("routeChangeStart", () => {
  NProgress.start();
});

Router.events.on("routeChangeComplete", () => {
  NProgress.done(true);
});

export default function ProgressBar() {
  return null;
}
