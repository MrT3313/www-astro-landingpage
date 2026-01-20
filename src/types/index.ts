import React, { type ReactNode } from 'react'

export type Point = {
  x: number
  y: number
}

export type Vector = {
  start: Point
  end: Point | null
  length_in_px: number
} 

export interface MenuItemType {
  type: "Project" | "Social" | "Personal" | "Widget"
  isLive: boolean
  label: string
  href?: string | null
  hex?: string
  backgroundColor?: string
  iconColor?: string
  Icon?: React.ReactNode
  segments: number[]
}

export interface WeeklySubmissionData {
  dates?: {
    start: string
    end: string
  }
  articles: Array<{
    markdown_link: string
  }>
  books: Array<{
    title: string
  }>
  podcasts: any[]
}