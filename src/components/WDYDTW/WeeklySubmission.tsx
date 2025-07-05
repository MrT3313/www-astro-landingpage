import React from 'react'
import cx from 'classnames'
import { useMemo } from 'react'
import type { WeeklySubmissionData } from '../../types'
import moment from 'moment'

// COMPONENTS

const WeeklySubmission = ({ 
  data,
  index,
  total,
  onClick,
  isOpenFull
}: { 
  data: WeeklySubmissionData
  index: number
  total: number 
  onClick: () => void | null
  isOpenFull: boolean
}) => {
  // Calculate random values that will change when key changes (component remounts)
  const { rotation, xOffset, yOffset } = useMemo(() => ({
    // Calculate a random rotation between -5 and 5 degrees
    rotation: (Math.random() * 10 - 5) * (index + 1) * 0.5,
    // Calculate random offsets for a more natural scattered look
    xOffset: (Math.random() * 20 - 10),
    yOffset: (Math.random() * 20 - 10)
  }), []) // Empty dependency array since we want new values on every mount
  const createDateFromYMD = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10))
    return new Date(year, month - 1, day) // month is 0-indexed in JS Date
  }

  return (
    <div 
      className={cx(
        'w-[90%]',
        'bg-white',
        'border-2 border-gray-400/60',
        'p-2',
        'rounded',
        'transition-all duration-500 ease-in-out',
        'hover:shadow-lg',
        {
          'absolute': !isOpenFull,
          'max-h-[200px] overflow-y-auto': !isOpenFull,
        },
        'scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100'
      )}
      style={!isOpenFull ? {
        // Centered stacked cards when not full
        transform: `translate(-50%, -50%) rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px)`,
        top: '50%',
        left: '50%',
        zIndex: 1,
      } : {
        // Just rotation and offset when full
        transform: `rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px)`,
      }}
      {...onClick && { onClick }}
    >
      {data.dates && (
        <div className={cx(
          "flex gap-2",
          "bg-white py-1 border-b mb-2",
          "text-sm"
        )}>
          <span>{`(${moment(data.dates.start).format('ddd')}) ${createDateFromYMD(data.dates.start).toLocaleDateString()}`}</span>
          <span>-</span>
          <span>{`(${moment(data.dates.end).format('ddd')}) ${createDateFromYMD(data.dates.end).toLocaleDateString()}`}</span>
        </div>
      )}

      {/* TASKS */}
      {data.tasks?.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.tasks.map((task, i) => (
            <div key={i} className="flex flex-col pl-2">
              {task.category && task.title && (
                <span className="font-medium">{`${task.category} - ${task.title}`}</span>
              )}
              {task.category && !task.title && (
                <span className="font-medium">{`${task.category}`}</span>
              )}
              {!task.category && task.title && (
                <span className="font-medium">{`${task.title}`}</span>
              )}
              <ul className="list-disc leading-none pl-6" style={{ listStyleType: 'disc' }}>
                {task.updates.map((update, idx) => (
                  <li key={idx} className="">
                    <span className="text-xs text-gray-600 mt-1">{update}</span>
                  </li>
                ))}
              </ul>
              {task.link && <span className="text-sm italic mt-1">
                <a 
                  href={task.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#4a90e2] hover:underline text-xs"
                  onClick={(e) => e.stopPropagation()}
                >{task.link}</a>
              </span>}
            </div>
          ))}
        </div>
      )}

      {/* LOGS */}
      {/* <div className="flex flex-col gap-2">
        <span className="font-bold">Logs:</span>
        <div className="flex flex-col gap-2">
          <span className="font-bold">Running:</span>
          
        </div>
      </div> */}
    </div>
  )
}

export { WeeklySubmission }