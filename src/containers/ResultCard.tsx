import { ChatIcon, ThumbUpIcon } from "@heroicons/react/solid";
import React from "react";
import ReactTooltip from "react-tooltip";

import { ProviderQueryType, ResultItem } from "../providers/providers";
import {
  COLOR_IF_OUTSIDE_HASH,
  KEY_BOLD_INITIAL_CHARS_OF_WORDS,
  KEY_FONT_SIZES,
  KEY_INCOGNITO_MODE,
  KEY_SHOULD_COLOR_FOR_SUBMITTED_BY,
  KEY_SHOULD_USE_OLD_REDDIT_LINK,
} from "../shared/constants";
import { EventType, sendEventsToServerViaWorker } from "../shared/events";
import { useSettingsStore } from "../shared/settings";
import { hashStringToColor } from "../utils/color";
import { boldFrontPortionOfWords } from "../utils/formatText";
import Badge from "./Badge";

interface Props {
  cardPosition: number;
  result: ResultItem;
}

const logForumResultEvent = (
  eventType: EventType,
  cardPosition: number,
  result: ResultItem,
  isIncognitoMode: boolean
) => {
  sendEventsToServerViaWorker(
    {
      eventType,
      resultCardPosition: cardPosition,
      resultProviderType: result.providerType,
      resultProviderQueryType: result.providerQueryType,
      resultCleanedTriggerUrl: result.cleanedTriggerUrl,
      resultProviderRequestUrl: result.providerRequestUrl,
      resultSubmittedUrl: result.submittedUrl,
      resultSubmittedDate: result.submittedDate,
      resultSubmittedUpvotes: result.submittedUpvotes,
      resultSubmittedTitle: result.submittedTitle,
      resultSubmittedBy: result.submittedBy,
      resultSubmittedByLink: result.submittedByLink,
      resultCommentsCount: result.commentsCount,
      resultCommentsLink: result.commentsLink,
      resultSubSourceName: result.subSourceName,
      resultSubSourceLink: result.subSourceLink,
    },
    isIncognitoMode
  );
};

const replaceRedditLink = (
  url: string,
  shouldUseOldRedditLink: boolean
): string => {
  return shouldUseOldRedditLink
    ? url
    : url.replace("old.reddit.com", "reddit.com");
};

const replaceRedditLinksInResult = (
  result: ResultItem,
  shouldUseOldRedditLink: boolean
): ResultItem => {
  return {
    ...result,
    submittedUrl: replaceRedditLink(
      result.submittedUrl,
      shouldUseOldRedditLink
    ),
    submittedByLink: replaceRedditLink(
      result.submittedByLink,
      shouldUseOldRedditLink
    ),
    commentsLink: replaceRedditLink(
      result.commentsLink,
      shouldUseOldRedditLink
    ),
    subSourceLink: replaceRedditLink(
      result.subSourceLink,
      shouldUseOldRedditLink
    ),
  };
};

const ResultCard = (props: Props) => {
  const { result, cardPosition } = props;
  const [
    settings,
    setValueAll,
    setKeyValue,
    isPersistent,
    error,
    isLoadingStore,
  ] = useSettingsStore();

  const shouldUseOldRedditLink = settings[KEY_SHOULD_USE_OLD_REDDIT_LINK];
  const boldInitialCharsOfWords = settings[KEY_BOLD_INITIAL_CHARS_OF_WORDS];
  const fontSizes = settings[KEY_FONT_SIZES];
  const isIncognitoMode = settings[KEY_INCOGNITO_MODE];
  const colorForSubmittedBy = settings[KEY_SHOULD_COLOR_FOR_SUBMITTED_BY]
    ? hashStringToColor(result.submittedBy)
    : COLOR_IF_OUTSIDE_HASH;

  const resultWithReplacedLink = replaceRedditLinksInResult(
    result,
    shouldUseOldRedditLink
  );

  const onCardClick = (url: string) => {
    window.open(url, "_blank");
  };

  const createOnClickLogForumEvent = (eventType: EventType) => {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      logForumResultEvent(
        eventType,
        cardPosition,
        resultWithReplacedLink,
        isIncognitoMode
      );
      e.stopPropagation();
    };
  };

  return (
    <div
      className="flex cursor-pointer flex-col space-y-2 p-3"
      onClick={() => {
        logForumResultEvent(
          EventType.CLICK_SIDEBAR_FORUM_RESULT_TITLE,
          cardPosition,
          resultWithReplacedLink,
          isIncognitoMode
        );
        onCardClick(resultWithReplacedLink.commentsLink);
      }}
    >
      {resultWithReplacedLink.providerQueryType ===
        ProviderQueryType.EXACT_URL && (
        // data-iscapture="true" allow us to immediately dismiss tooltip on user scroll
        <div
          data-tip="This result contains an exact link to your current page."
          data-iscapture="true"
        >
          <Badge>EXACT MATCH</Badge>
        </div>
      )}
      {resultWithReplacedLink.subSourceName !== "" && (
        <div className="flex flex-row space-x-1">
          <div
            className={`${fontSizes.subText} font-medium text-indigo-500 hover:underline`}
          >
            <a
              href={resultWithReplacedLink.subSourceLink}
              target="_blank"
              onClick={createOnClickLogForumEvent(
                EventType.CLICK_SIDEBAR_FORUM_RESULT_SUB_SOURCE
              )}
            >
              {resultWithReplacedLink.subSourceName}
            </a>
          </div>
        </div>
      )}
      <div
        className={`${fontSizes.mainText} font-normal text-black dark:text-zinc-300 space-x-2 hover:underline`}
      >
        <img
          alt="Source Icon"
          className="inline h-4 w-4"
          src={chrome.runtime.getURL(resultWithReplacedLink.providerIconUrl)}
        />
        <a
          href={resultWithReplacedLink.commentsLink}
          target="_blank"
          rel="noreferrer"
          onClick={createOnClickLogForumEvent(
            EventType.CLICK_SIDEBAR_FORUM_RESULT_TITLE
          )}
        >
          {boldInitialCharsOfWords
            ? boldFrontPortionOfWords(resultWithReplacedLink.submittedTitle)
            : resultWithReplacedLink.submittedTitle}
        </a>
      </div>
      <div className={`${fontSizes.subText} flex flex-row flex-wrap space-x-3`}>
        <div className="flex flex-row items-center space-x-1">
          <strong className="text-slate-500">
            {resultWithReplacedLink.commentsCount}
          </strong>
          <ChatIcon className="h-3 w-3 text-slate-300" />
        </div>
        <div className="flex flex-row items-center space-x-1">
          <strong className="text-slate-500">
            {resultWithReplacedLink.submittedUpvotes}
          </strong>
          <ThumbUpIcon className="h-3 w-3 text-slate-300" />
        </div>
        <div className="text-slate-600">
          {resultWithReplacedLink.submittedDate}
        </div>
        <div className="grow" />
        <div className={`text-[11px] ${colorForSubmittedBy} hover:underline`}>
          <a
            href={resultWithReplacedLink.submittedByLink}
            target="_blank"
            onClick={createOnClickLogForumEvent(
              EventType.CLICK_SIDEBAR_FORUM_RESULT_AUTHOR
            )}
          >
            {resultWithReplacedLink.submittedBy}
          </a>
        </div>
        <ReactTooltip
          arrowColor="transparent"
          place="top"
          type="dark"
          effect="solid"
          delayShow={500}
        />
      </div>
    </div>
  );
};

export default ResultCard;
