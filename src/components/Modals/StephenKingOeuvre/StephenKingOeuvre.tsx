import React from 'react'
import { BaseModal } from '../BaseModal'
import rankings from './Rankings'
import unread from './Unread'

type StephenKingOeuvreProps = {
  isOpen: boolean
  onClose: () => void
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

export const StephenKingOeuvre = ({ isOpen, onClose }: StephenKingOeuvreProps) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Stephen King Oeuvre" maxWidth="max-w-[450px]">
      <div className="space-y-8">
        <div>
          <p className="text text-gray-600 mb-4">I am reading all the Stephen King novels in their published order.</p>
          <h2 className="text-2xl font-bold mb-2">Top Rankings</h2>
          <ol className="space-y-2">
            {rankings.map((book) => {
              const rankColor = book.rank <= 3 ? 'text-yellow-500' : 'text-gray-600'
              
              return (
                <li key={book.rank} className="flex items-start gap-3">
                  <span className={`font-bold ${rankColor} min-w-[2rem]`}>{book.rank}.</span>
                  <div className="flex-1">
                    <div className="font-semibold">{book.title}</div>
                    <div className="text-sm text-gray-600">
                      {book.author} • Published {book.year_published}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Read in {book.year_read} • My {book.order_read}{getOrdinalSuffix(book.order_read)} Stephen King book
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Currently Reading</h3>
          <div className="space-y-2">
            {unread
              .filter((book) => book.is_reading)
              .map((book, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">📖</span>
                  <div>
                    <div className="font-semibold">{book.title}</div>
                    <div className="text-sm text-gray-600">
                      {book.author} • Published {book.year_published}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 space-y-2">
          <h3 className="text-xl font-bold mb-4">Up Next</h3>
            {unread
              .filter((book) => !book.is_reading)
              .map((book, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-600">
                  <span className="font-bold min-w-[1.5rem]">{index + 1}.</span>
                  <div>
                    <div>{book.title}</div>
                    <div className="text-sm text-gray-500">
                      {book.author} • Published {book.year_published}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
