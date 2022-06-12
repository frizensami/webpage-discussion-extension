import React, { useEffect, useState } from "react";
import { stripHtml } from "string-strip-html";

import { Comment, ProviderType } from "../providers/providers";
import { classNames } from "../utils/classNames";
import { log } from "../utils/log";

export interface Props {
  shouldShowComments: boolean;
  commentsUrl: string;
  providerType: ProviderType;
  fontSizes: any;
}

const ResultCardComments = (props: Props) => {
  const { shouldShowComments, commentsUrl, providerType, fontSizes } = props;
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [hasFetchedComments, setHasFetchedComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (shouldShowComments && !hasFetchedComments) {
      setHasFetchedComments(true);
      log.debug("Sending message to bg script for comments.");
      chrome.runtime.sendMessage(
        { getComments: true, commentsUrl, providerType },
        (newComments: Comment[]) => {
          log.debug("Comments:");
          log.debug(newComments);
          setComments(newComments);
          setIsLoadingComments(false);
        }
      );
    }
  }, [shouldShowComments]);

  return (
    <div>
      {" "}
      {isLoadingComments && (
        <div className="z-50 flex h-full w-full flex-col items-center justify-center overflow-hidden p-5 bg-gray-700 opacity-75">
          <div className="loader mb-4 h-12 w-12 rounded-full border-4 border-t-4 ease-linear" />
          <h2 className="text-center text-base font-semibold text-white">
            Loading comments...
          </h2>
        </div>
      )}
      {shouldShowComments && !isLoadingComments && comments.length === 0 && (
        <div className="flex flex-col space-y-2 bg-gray-100">
          <div
            className={`${fontSizes.subText} text-black text-sm space-x-2 text-semibold`}
          >
            No comments found.
          </div>
        </div>
      )}
      {shouldShowComments && !isLoadingComments && comments.length > 0 && (
        <div className="space-y-2">
          {" "}
          <div className="flex flex-col space-y-2 bg-gray-100">
            <div
              className={`${fontSizes.subText} text-black text-sm space-x-2 text-semibold`}
            >
              Top Comments
            </div>
            <ul>
              {comments.map((comment: Comment, index) => (
                <li>
                  <p className="text-gray-500">
                    {stripHtml(comment.text).result}
                  </p>
                  <p>{comment.author}</p>
                  <br />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCardComments;
