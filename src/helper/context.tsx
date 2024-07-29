import { createContext, useContext, useState } from "react";

type IDataContext = {
  userContent: any;
  changeUserContent: (content: any) => void;
  level: number;
  changeLevel: (id: number) => void;

  layout: string | null;
  pageTitle: string;
  pageUrl: string;
  domain: number;
  locale: number;
  selectedFile: string | null;
  folderRoute: Array<string>;
  changeLayout: (layout: string) => void;
  changePageTitle: (title: string) => void;
  changePageUrl: (url: string) => void;
  changeDomain: (id: number) => void;
  changeLocale: (id: number) => void;
  changeSelectedFile: (url: string | null) => void;
  changeFolderRoute: (folder: string) => void;
  removeFolderRoute: (mode?: "all") => void;
};

export const ActionContext = createContext<IDataContext>({
  userContent: [],
  changeUserContent: () => {},
  level: -1,
  changeLevel: () => {},

  layout: null,
  pageTitle: "orders",
  pageUrl: "/orders",
  domain: 0,
  locale: 0,
  selectedFile: "/noimage.jpg",
  folderRoute: [],
  changeLayout: () => {},
  changePageTitle: () => {},
  changePageUrl: () => {},
  changeDomain: () => {},
  changeLocale: () => {},
  changeSelectedFile: () => {},
  changeFolderRoute: () => {},
  removeFolderRoute: () => {},
});

export const useData = () => useContext(ActionContext);

export const DataProvider = ({ children }: any) => {
  //--------------------------start-------------------------------------------------
  const [level, setLevel] = useState<number>(0);
  const [userContent, setContent] = useState<any>([]);

  const changeUserContent = (content: any) => {
    setContent(content);
  };

  const changeLevel = (id: number) => {
    setLevel(id);
  };

  //--------------------------END-------------------------------------------------
  const [layout, setLayout] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string>("orders");
  const [pageUrl, setPageUrl] = useState<string>("/orders");
  const [domain, setDomain] = useState<number>(0);
  const [locale, setLocale] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [folderRoute, setFolderRoute] = useState<Array<string>>([]);

  const changeLayout = (layout: string | null) => {
    setLayout(layout);
  };

  const changePageTitle = (title: string) => {
    setPageTitle(title);
  };

  const changePageUrl = (url: string) => {
    setPageUrl(url);
  };

  const changeDomain = (id: number) => {
    setDomain(id);
  };

  const changeLocale = (id: number) => {
    setLocale(id);
  };

  const changeSelectedFile = (url: string | null) => {
    setSelectedFile(url);
  };

  const changeFolderRoute = (folder: string) => {
    const exits = folderRoute.find((e) => e === folder);
    if (!exits) {
      setFolderRoute((prev: Array<string>) => [...prev, folder]);
    }
  };

  const removeFolderRoute = (mode?: "all") => {
    if (mode === "all") {
      setFolderRoute([]);
    } else {
      if (folderRoute.length > 0) {
        setFolderRoute(folderRoute.slice(0, -1));
      }
    }
  };

  return (
    <ActionContext.Provider
      value={{
        level,
        changeLevel,
        userContent,
        changeUserContent,

        layout,
        pageTitle,
        pageUrl,
        domain,
        locale,
        selectedFile,
        folderRoute,
        changeLayout,
        changePageTitle,
        changePageUrl,
        changeDomain,
        changeLocale,
        changeSelectedFile,
        changeFolderRoute,
        removeFolderRoute,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
};
