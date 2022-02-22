import React, { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  CogIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";

import "./Sidebar.css";
import { ProviderResults, ProviderResultType } from "../../providers/providers";
import { log } from "../../utils/log";
import ResultCard from "../../containers/ResultCard";
import { useHotkeys } from "react-hotkeys-hook";
import { sendMessageToActiveTab } from "../../utils/tabs";
import {
  HOTKEYS_CLOSE_SIDEBAR,
  HOTKEYS_TOGGLE_SIDEBAR,
} from "../../shared/constants";

const Sidebar = () => {
  console.log("============ IM in Sidebar ============");
  const [providerData, setProviderData] = useState<ProviderResults>({
    resultType: ProviderResultType.Ok,
    hackerNews: [],
    reddit: [],
  });

  useEffect(() => {
    log.debug("Sending message about the window URL");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // since only one tab should be active and in the current window at once
      // the return variable should only have one entry
      const activeTab = tabs[0];
      const activeTabUrl = activeTab.url; // or do whatever you need

      log.debug("Active url", activeTabUrl);
      chrome.runtime.sendMessage(
        { windowUrl: activeTabUrl },
        (response: ProviderResults) => {
          log.debug("Printing provider data from background script...");
          log.debug(response);
          setProviderData(response);
        }
      );
    });
  }, [setProviderData]);

  const onCardClick = () => {};
  const setClickedUrl = () => {};

  // Send a message to the extension (alternative: use redux?) to close
  const closeSideBar = () => sendMessageToActiveTab({ closeSideBar: true });
  const toggleSideBar = () => sendMessageToActiveTab({ toggleSideBar: true });

  // Hotkeys to control the sidebar visibility.
  // Note: The SideBar is reimplementing the same hotkey shortcuts because it will be within an iFrame
  useHotkeys(HOTKEYS_TOGGLE_SIDEBAR, toggleSideBar);
  useHotkeys(HOTKEYS_CLOSE_SIDEBAR, closeSideBar);

  return (
    <div className="h-full w-full flex flex-row">
      {/*{clickedUrl && (*/}
      {/*  <div className="h-full w-[50vw] bg-slate-100 flex flex-col">*/}
      {/*    Hi*/}
      {/*    /!*<iframe src={clickedUrl} title="Selected Article" />*!/*/}
      {/*  </div>*/}
      {/*)}*/}
      <div className="h-screen w-full bg-slate-100 flex flex-col">
        <div className="px-2 space-x-2 items-center text-sm h-10 shrink-0 bg-white border border-slate-300 flex flex-row">
          <div className="cursor-pointer" onClick={closeSideBar}>
            <ChevronRightIcon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="grow" />
          <div className="cursor-pointer">
            <CogIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div className="cursor-pointer">
            <QuestionMarkCircleIcon className="h-5 w-5 text-slate-500" />
          </div>
        </div>
        <div className="text-left p-3 space-y-3 scrollbar scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-100 grow">
          <p className="text-lg text-blue-700">Backlinks</p>
          <div className="space-y-2">
            <div className="align-bottom space-x-2 flex flex-row">
              {/*<img*/}
              {/*  alt="Hacker News Icon"*/}
              {/*  className="my-auto h-4 w-4"*/}
              {/*  // src={hackerNewsLogo}*/}
              {/*  src={chrome.runtime.getURL(hackerNewsLogo)}*/}
              {/*/>*/}
              <p className="my-1 text-slate-500">Hacker News</p>
            </div>
            {providerData.hackerNews.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                onCardClick={onCardClick}
              />
            ))}
          </div>
          <div className="space-y-2">
            <div className="align-bottom space-x-2 flex flex-row">
              {/*<img*/}
              {/*  alt="Reddit Icon"*/}
              {/*  className="my-auto h-5 w-5"*/}
              {/*  // src={redditLogo}*/}
              {/*  src={chrome.runtime.getURL(redditLogo)}*/}
              {/*/>*/}
              <p className="my-1 text-slate-500">Reddit</p>
            </div>
            {providerData.reddit.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                onCardClick={setClickedUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;