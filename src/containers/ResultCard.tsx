import React from 'react';
import { ResultItem } from '../providers/providers';
import { ChatIcon, ThumbUpIcon } from '@heroicons/react/solid';

interface Props {
  result: ResultItem;
  onCardClick: (url: string) => void;
}

const ResultCard = (props: Props) => {
  const { result, onCardClick } = props;
  return (
    <div className="p-3 space-y-2 flex flex-col bg-white border border-slate-300 rounded">
      <div className="hover:underline text-md font-medium text-blue-800">
        <a
          href={result.comments_link}
          onClick={() => onCardClick(result.comments_link)}
          target="_blank"
          rel="noreferrer"
        >
          {result.submitted_title}
        </a>
      </div>
      <div className="text-xs space-x-3 flex flex-row">
        <div className="flex flex-row space-x-1">
          <strong className="text-slate-500">{result.submitted_upvotes}</strong>
          <ThumbUpIcon className="h-3 w-3 text-slate-300 mt-0.5" />
        </div>
        <div className="flex flex-row space-x-1">
          <strong className="text-slate-500">{result.comments_count}</strong>
          <ChatIcon className="h-3 w-3 text-slate-300 mt-0.5" />
        </div>
        <div className="text-slate-600">{result.submitted_date}</div>
        <div className="grow" />
        <div className="text-[10px] text-slate-600">{result.submitted_by}</div>
      </div>
    </div>
  );
};

export default ResultCard;