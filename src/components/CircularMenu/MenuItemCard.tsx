import React, { type ComponentType, useState, useRef, useEffect } from 'react'
import cx from 'classnames'

// ICONS
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { MdAlternateEmail } from "react-icons/md";

// TYPES
import { type MenuItemType, type Point } from '../../types'

// HELPERS
const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + 
        Math.pow(p2.y - p1.y, 2)
    )
}

type MenuItemCardProps = {
    item: MenuItemType
    position: Point
    mousePosition: Point
    mouseInViewport: boolean
    mouseInMenu: boolean
    syntheticPosition?: Point
    debug?: boolean
    interactionModality: 'touch' | 'mouse'
    onHover?: (isHovering: boolean) => void
    onWidgetClick?: (item: MenuItemType) => void
}
const MenuItemCard = ({ 
    item,
    position,
    mousePosition,
    mouseInViewport,
    mouseInMenu,
    syntheticPosition,
    debug = false,
    interactionModality,
    onHover,
    onWidgetClick
}: MenuItemCardProps) => {
    // REFS
    const containerRef = useRef<HTMLDivElement>(null)

    // STATE
    // STATE > mouse
    const [isMouseHovering, setIsMouseHovering] = useState(false)
    const distanceToMouse = mouseInViewport ? calculateDistance(position, mousePosition) : Infinity
    // STATE > synthetic
    const [isSyntheticHovering, setIsSyntheticHovering] = useState(false)
    const distanceToSynthetic = mouseInViewport && syntheticPosition 
        ? calculateDistance(position, syntheticPosition) 
        : Infinity
    
    const EFFECT_DISTANCE = 235
    const opacity = syntheticPosition 
        ? Math.max(0, Math.min(1, 1 - (distanceToSynthetic / EFFECT_DISTANCE)))
        : 0

    // METHODS

    // USE EFFECTS
    useEffect(() => {
        if (!containerRef.current || !mouseInViewport) return
        
        const rect = containerRef.current.getBoundingClientRect()
        const isHovering = 
            mousePosition.x >= rect.left &&
            mousePosition.x <= rect.right &&
            mousePosition.y >= rect.top &&
            mousePosition.y <= rect.bottom
        
        setIsMouseHovering(isHovering)
    }, [mousePosition, mouseInViewport])
    
    useEffect(() => {
        if (!syntheticPosition || !containerRef.current || isMouseHovering) {
            setIsSyntheticHovering(false)
            return
        }
        
        const rect = containerRef.current.getBoundingClientRect()
        const isColliding = 
            syntheticPosition.x >= rect.left &&
            syntheticPosition.x <= rect.right &&
            syntheticPosition.y >= rect.top &&
            syntheticPosition.y <= rect.bottom
        
        setIsSyntheticHovering(isColliding)
    }, [syntheticPosition, isMouseHovering])

    return (
        <div 
            ref={containerRef}
            className="flex relative"
            onMouseEnter={() => {
                setIsMouseHovering(true)
                if (onHover) onHover(true)
            }}
            onMouseLeave={() => {
                setIsMouseHovering(false)
                if (onHover) onHover(false)
            }}
            style={{ opacity: interactionModality === 'touch' ? 1 : (isMouseHovering ? 1 : opacity) }}
        >
            <div 
                style={{ 
                    backgroundColor: (item.href || item.type === 'Widget') ? 'transparent' : (item?.hex ? `#${item.hex}` : 'white'),
                    color: (item.href || item.type === 'Widget') ? 'inherit' : (item?.hex && 'white'),
                }}
                className={cx(
                    "flex flex-col items-center justify-center",
                    "gap-2 px-2 py-1", 
                    "rounded-md",
                    "transition-all duration-150",
                    "pointer-events-auto",
                    {
                        "cursor-pointer": item.href || item.type === 'Widget',
                        "shadow-md": !item.href && item.type !== 'Widget'
                    }
                )}
                onClick={() => {
                    if (item.type === 'Widget' && onWidgetClick) {
                        onWidgetClick(item)
                    }
                }}
            >
                {item.href ? (
                    <Item {...{ item }} />
                ) : item.type === 'Widget' && item.Icon ? (
                    <div
                        style={{
                            backgroundColor: item.backgroundColor || 'white',
                            color: item.iconColor || 'black'
                        }}
                        className={cx(
                            "flex items-center gap-2",
                            "px-2 py-1",
                            "rounded-md shadow-md"
                        )}
                    >
                        {item.Icon}
                    </div>
                ) : (
                    <span className="text-nowrap">
                        {item.label}
                    </span>
                )}
            </div>
        </div>
    )
}

export const Item = ({ item }: {item: MenuItemType}) => {
    return (
        <a 
            href={item.href}
            style={{
                backgroundColor: item.backgroundColor || (item?.hex ? `#${item.hex}` : 'white'),
                color: item.iconColor || (item?.hex ? 'white' : 'black')
            }}
            className={cx(
                "no-underline",
                "flex items-center gap-2",
                "pointer-events-auto",
                "cursor-pointer",
                {"p-2": item.label.includes('Substack')},
                {"px-2 py-1": !item.label.includes('Substack')},
                "rounded-md shadow-md"
            )}
            target="_blank"
            rel="noopener noreferrer"
        >
            {item.Icon ? item.Icon : item.label}
        </a>
    )
}

export default MenuItemCard 