"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, Globe, Tag, Plus } from "lucide-react"

export function RecordDetails() {
  const [showAllValues, setShowAllValues] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    lists: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-lg font-medium" onClick={() => toggleSection("details")}>
            <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.details ? "" : "-rotate-90"}`} />
            Record Details
          </button>
        </div>

        {expandedSections.details && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Globe className="h-4 w-4" />
                Domains
              </div>
              <div className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-sm">apple.com</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <NameIcon className="h-4 w-4" />
                Name
              </div>
              <div>Apple</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <DescriptionIcon className="h-4 w-4" />
                Description
              </div>
              <div className="truncate max-w-[200px]">Apple is a multinational technology corporation that...</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="h-4 w-4" />
                Team
              </div>
              <div className="text-gray-400">Set Team</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Tag className="h-4 w-4" />
                Categories
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                <span className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded text-xs">Computer Hardware</span>
                <span className="bg-green-900/30 text-green-400 px-2 py-0.5 rounded text-xs">Retail</span>
                <span className="bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded text-xs">Mobile</span>
                <span className="bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded text-xs">B2C</span>
                <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">+4</span>
              </div>
            </div>

            <button
              className="flex items-center gap-1 text-gray-400 text-sm"
              onClick={() => setShowAllValues(!showAllValues)}
            >
              Show all values
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-lg font-medium" onClick={() => toggleSection("lists")}>
            <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.lists ? "" : "-rotate-90"}`} />
            Lists
          </button>
          <button className="text-gray-400 hover:text-white">
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add to list</span>
          </button>
        </div>

        {expandedSections.lists && (
          <div className="text-gray-400 text-sm">This record has not been added to any lists</div>
        )}
      </div>
    </div>
  )
}

function NameIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2H2v10h10V2z" />
      <path d="M12 12H2v10h10V12z" />
      <path d="M22 2h-10v20h10V2z" />
    </svg>
  )
}

function DescriptionIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
