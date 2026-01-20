import React, { useState, useEffect, useRef, useCallback } from 'react'
import cx from 'classnames'

// TYPES
import { type Point, type Vector, type MenuItemType } from '../../types/index'

// UTILS

// HOOKS
import { useMousePosition } from '../../hooks/useMousePosition'
import { useSyntheticCursorPosition } from '../../hooks/useSyntheticCursorPosition'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'

// CONSTANTS
import { menuItems } from '../../constants/menuItems'

// COMPONENTS
import MenuItemCard from './MenuItemCard'
import ClickConfetti from '../Animations/ClickConfetti'
import { StephenKingOeuvre } from '../Modals/StephenKingOeuvre/StephenKingOeuvre'

type CircularMenuV2Props = {
    menuItems: MenuItemType[]
    diameter?: number
    total_segments?: number
    debug?: boolean
}
const version = `V2`
const CircularMenuV2 = ({ 
    menuItems,
    diameter = 400, 
    total_segments = 20,
    debug = false 
}: CircularMenuV2Props) => {
    // REFS
    const circleRef = useRef<SVGSVGElement>(null)

    // STATE
    // STATE > center points
    const [circleCenter, setCircleCenter] = useState<Point>({ x: 0, y: 0 })
    const [viewportCenter, setViewportCenter] = useState<Point>({ x: 0, y: 0 })

    // STATE > mouse
    const [mouseVectorToCircleCenter, setMouseVectorToCircleCenter] = useState<Vector>({ 
        start: { x: 0, y: 0 }, 
        end: null, 
        length_in_px: 0 
    })
    const [mouseInMenu, setMouseInMenu] = useState<boolean>(false)
    const [isHoveringMenuItem, setIsHoveringMenuItem] = useState<boolean>(false)
    const [isHoveringCornerElement, setIsHoveringCornerElement] = useState<boolean>(false)

    // STATE > confetti
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [lastClickTime, setLastClickTime] = useState<number>(0)
    const [clickPosition, setClickPosition] = useState<Point>({ x: 0, y: 0 })

    // STATE > widgets
    const [activeWidget, setActiveWidget] = useState<MenuItemType | null>(null)

    // HOOKS
    const { 
        isTouchOnly, 
        isMouseOnly, 
        hasTouch,
        isMobile,
        isTablet 
    } = useDeviceDetection()
    // HOOKS > custom
    const { mousePosition, mouseInViewport } = useMousePosition()
    const syntheticCursorPosition = useSyntheticCursorPosition({
        mousePosition,
        circleCenter,
        radius: diameter / 2,
        mouseInViewport
    })

    // MODELS

    // USE EFFECTS
    // USE EFFECTS > points
    useEffect(() => {
        const updateCenters = () => {
            // Update circle center
            if (circleRef.current) {
                const rect = circleRef.current.getBoundingClientRect()
                setCircleCenter({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                })
            }
            
            // Update viewport center
            setViewportCenter({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            })
        }

        updateCenters()
        window.addEventListener('resize', updateCenters)
        return () => window.removeEventListener('resize', updateCenters)
    }, [])

    // Update mouseVectorToCircleCenter when mouse position changes
    useEffect(() => {
        if (!mouseInViewport || !mousePosition) {
            setMouseVectorToCircleCenter({ 
                start: circleCenter, 
                end: null, 
                length_in_px: 0 
            })
            setMouseInMenu(false)
            return
        }

        const length = Math.sqrt(
            Math.pow(mousePosition.x - circleCenter.x, 2) + 
            Math.pow(mousePosition.y - circleCenter.y, 2)
        )

        setMouseVectorToCircleCenter({
            start: circleCenter,
            end: mousePosition,
            length_in_px: length
        })

        setMouseInMenu(length <= diameter / 2)
    }, [mousePosition, circleCenter, mouseInViewport, diameter])

    // METHODS
    // METHODS > points
    const getAbsolutePosition = (svgX: number, svgY: number): Point => {
        if (!circleRef.current) return { x: 0, y: 0 }
        
        const svgRect = circleRef.current.getBoundingClientRect()
        return {
            x: svgRect.left + svgX,
            y: svgRect.top + svgY
        }
    }

    // METHODS > segments
    const generateSegmentPath = (
        index: number
    ): string => {
        const radius = diameter / 2
        const anglePerSegment = (2 * Math.PI) / total_segments
        const startAngle = index * anglePerSegment
        const endAngle = (index + 1) * anglePerSegment

        const startX = radius + radius * Math.cos(startAngle)
        const startY = radius + radius * Math.sin(startAngle)
        const endX = radius + radius * Math.cos(endAngle)
        const endY = radius + radius * Math.sin(endAngle)

        const largeArcFlag = 0 // Use 0 for segments less than 180 degrees
        
        return `M ${radius},${radius} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`
    }

    const getSegmentCenter = (index: number): Point => {
        const radius = diameter / 2
        const anglePerSegment = (2 * Math.PI) / total_segments
        const angle = (index + 0.5) * anglePerSegment
        
        return {
            x: radius + (radius * 0.6) * Math.cos(angle),
            y: radius + (radius * 0.6) * Math.sin(angle)
        }
    }

    const getSegmentEdgePosition = (index: number): Point => {
        const radius = diameter / 2
        const anglePerSegment = (2 * Math.PI) / total_segments
        const angle = (index + 0.5) * anglePerSegment
        
        return {
            x: radius + radius * Math.cos(angle),
            y: radius + radius * Math.sin(angle)
        }
    }

    const getMultiSegmentEdgePosition = (segments: number[]): Point => {
        const radius = diameter / 2
        const anglePerSegment = (2 * Math.PI) / total_segments
        
        // Get the middle angle between first and last segment
        const startAngle = segments[0] * anglePerSegment
        const endAngle = (segments[segments.length - 1] + 1) * anglePerSegment
        const middleAngle = startAngle + (endAngle - startAngle) / 2
        
        return {
            x: radius + radius * Math.cos(middleAngle),
            y: radius + radius * Math.sin(middleAngle)
        }
    }

    // METHODS > Vectors
    const calculateVectorDegree = (start: Point, end: Point | null): number => {
        if (!end) return 0

        const radians = Math.atan2(end.y - start.y, end.x - start.x)
        // Convert radians to degrees and normalize to 0-360 range
        let degrees = (radians * 180) / Math.PI
        degrees = degrees < 0 ? degrees + 360 : degrees
        return Number(degrees.toFixed(2))
    }

    // METHODS > collisions
    const calculateCircleIntersection = (center: Point, mouse: Point, radius: number): Point => {
        // Calculate angle between center and mouse
        const angle = Math.atan2(mouse.y - center.y, mouse.x - center.x)
        
        // Calculate point on circle's circumference
        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        }
    }

    // METHODS > animations
    const handleClick = useCallback((e: MouseEvent) => {
        if (mouseInMenu || !mouseInViewport) return
        if (activeWidget !== null) return
        
        const now = Date.now()
        if (now - lastClickTime < 1000) return // 3 second debounce
        
        setLastClickTime(now)
        setClickPosition({ x: e.clientX, y: e.clientY })
        setShowConfetti(true)
    }, [mouseInMenu, mouseInViewport, lastClickTime, activeWidget])

    const handleMenuItemHover = useCallback((isHovering: boolean) => {
        setIsHoveringMenuItem(isHovering)
    }, [])

    const normalizeLabel = (label: string): string => {
        return label
            .replace(/[📚🧠🚧⏳💰🛒📔💬]/g, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
    }

    const widgetComponents: Record<string, React.ComponentType<{ isOpen: boolean; onClose: () => void }>> = {
        'stephen-king-oeuvre': StephenKingOeuvre
    }

    const handleWidgetClick = useCallback((item: MenuItemType) => {
        setActiveWidget(item)
    }, [])

    const handleWidgetClose = useCallback(() => {
        setActiveWidget(null)
    }, [])

    useEffect(() => {
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [handleClick])

    // Check if hovering over any corner UI elements
    useEffect(() => {
        if (!mouseInViewport || !mousePosition) {
            setIsHoveringCornerElement(false)
            return
        }

        // Check if mouse is over any corner element
        const elementsAtPoint = document.elementsFromPoint(mousePosition.x, mousePosition.y)
        const isOverCornerElement = elementsAtPoint.some(element => {
            // Game of Life controls (bottom left)
            if (element.closest('.fixed.bottom-4.left-4')) return true
            
            // "Under Construction" banner (top left)
            if (element.closest('.fixed.top-2.left-2')) return true
            
            // Debug/breakpoints info (top right)
            if (element.closest('#breakpointsInfo') || element.closest('#toggleBreakpoints')) return true
            
            // WDYDTW element (bottom right)
            if (element.closest('.WDYDTW')) return true
            
            return false
        })
        
        setIsHoveringCornerElement(isOverCornerElement)
    }, [mousePosition, mouseInViewport])

    // ====== //
    // RETURN //
    // ====== //
    return (
        <div className={cx(
            'z-70',
            "fixed inset-0 flex items-center justify-center pointer-events-none"
        )}>
            {debug && (
                <div>
                    <div className="absolute top-0 right-0">
                        <div> 
                            {`Circle Center: ${circleCenter.x}, ${circleCenter.y}`}
                        </div>
                        <div>
                            {`Viewport Center: ${viewportCenter.x}, ${viewportCenter.y}`}
                        </div>

                        <br />
                        
                        <div>
                            {`Mouse Position: ${mouseInViewport ? `${mousePosition?.x}, ${mousePosition?.y}` : 'Outside viewport'}`}
                        </div>
                        <div>
                            {`Mouse in viewport: ${mouseInViewport}`}
                        </div>
                        <div>
                            {`Mouse in menu: ${mouseInMenu}`}
                        </div>

                        {mouseInViewport && (
                            <>
                                <br />
                                <div>
                                    {`Vector Degree: ${calculateVectorDegree(circleCenter, mousePosition)}°`}
                                </div>
                                <div>
                                    {`Vector Start: ${circleCenter.x}, ${circleCenter.y}`}
                                </div>
                                <div>
                                    {`Vector End: ${mousePosition?.x}, ${mousePosition?.y}`}
                                </div>
                                <div>
                                    {`Vector Length: ${mousePosition ? Math.sqrt(
                                        Math.pow(mousePosition.x - circleCenter.x, 2) + 
                                        Math.pow(mousePosition.y - circleCenter.y, 2)
                                    ).toFixed(2) : '0'}px`}
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div 
                        className="absolute w-[5px] h-[5px] bg-teal-500 rounded-full"
                        style={{ 
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                    <div 
                        className="fixed w-[5px] h-[5px] bg-blue-500 rounded-full"
                        style={{ 
                            left: viewportCenter.x,
                            top: viewportCenter.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                    {/* <div 
                        className={cx(!mouseInMenu && 'hidden', "fixed w-[10px] h-[10px] bg-black rounded-full")}
                        style={{ 
                            left: syntheticCursorPosition.x,
                            top: syntheticCursorPosition.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    /> */}
                </div>
            )}

            {!mouseInMenu && mouseInViewport && mousePosition && syntheticCursorPosition && !isHoveringMenuItem && !isHoveringCornerElement && (
                <div 
                    className="fixed bg-teal-500"
                    style={{
                        width: '2px',
                        position: 'fixed',
                        left: syntheticCursorPosition.x,
                        top: syntheticCursorPosition.y,
                        height: Math.sqrt(
                            Math.pow(mousePosition.x - syntheticCursorPosition.x, 2) + 
                            Math.pow(mousePosition.y - syntheticCursorPosition.y, 2)
                        ),
                        transform: `rotate(${Math.atan2(
                            mousePosition.y - syntheticCursorPosition.y,
                            mousePosition.x - syntheticCursorPosition.x
                        ) - Math.PI/2}rad)`,
                        transformOrigin: '0 0'
                    }}
                />
            )}
            {mouseInViewport && mousePosition && !isHoveringMenuItem && !isHoveringCornerElement && (
                <div 
                    className={cx(
                        mouseInMenu && "hidden",
                        "fixed w-[10px] h-[10px] rounded-full",
                        mouseInMenu ? "bg-teal-500" : "bg-teal-500"
                    )}
                    style={{ 
                        left: mousePosition.x,
                        top: mousePosition.y,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            )}

            <svg 
                ref={circleRef}
                width={diameter}
                height={diameter}
                className="relative"
                style={{ overflow: 'visible' }}
            >
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={diameter / 2}
                    className="stroke-black fill-teal-500"
                    // strokeWidth="2"
                    // strokeDasharray="4 4"
                />
                
                {/* Center content */}
                <foreignObject
                    x={(diameter / 2) - 120}
                    y={(diameter / 2) - 30}
                    width="240"
                    height="60"
                >
                    <div className="flex flex-col justify-center items-center gap-2 pointer-events-auto">
                      <div className="flex flex-col items-center justify-center text-center gap-3"> 
                        <span>I have a lot of projects.</span>
                        <span className="italic">I need a place to put them.</span>
                      </div>
                    </div>
                </foreignObject>

                {Array.from({ length: total_segments }, (_, index) => (
                    <g key={index}>
                        {debug && (
                            <path
                                d={`M ${diameter/2},${diameter/2} L ${getSegmentEdgePosition(index).x},${getSegmentEdgePosition(index).y}`}
                                className="stroke-black fill-transparent"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />
                        )}
                        
                        {menuItems.map((item) => {
                            const svgX = item.segments.length > 1 
                                ? getMultiSegmentEdgePosition(item.segments).x - 75
                                : getSegmentEdgePosition(index).x - 75;
                            const svgY = item.segments.length > 1
                                ? getMultiSegmentEdgePosition(item.segments).y - 25
                                : getSegmentEdgePosition(index).y - 25;
                                
                            const absolutePosition = getAbsolutePosition(svgX + 75, svgY + 25)

                            return item.segments?.includes(index) && 
                                item.segments[0] === index && (
                                    <foreignObject
                                        key={`item-${item.label}-${index}`}
                                        x={svgX}
                                        y={svgY}
                                        width="150"
                                        height="50"
                                        style={{ overflow: 'visible' }}
                                    >
                                        <div className="flex items-center justify-center w-full h-full">
                                            <MenuItemCard
                                                item={item}
                                                position={absolutePosition}
                                                mousePosition={mousePosition}
                                                mouseInViewport={mouseInViewport}
                                                mouseInMenu={mouseInMenu}
                                                syntheticPosition={syntheticCursorPosition}
                                                debug={debug}
                                                interactionModality={isTouchOnly ? 'touch' : 'mouse'}
                                                onHover={handleMenuItemHover}
                                                onWidgetClick={handleWidgetClick}
                                            />
                                        </div>
                                    </foreignObject>
                                )
                        })}
                        {debug && (
                            <text
                                x={getSegmentCenter(index).x}
                                y={getSegmentCenter(index).y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-sm fill-black pointer-events-none"
                            >
                                {index}
                            </text>
                        )}
                    </g>
                ))}
            </svg>

            {showConfetti && activeWidget === null && (
                <ClickConfetti
                    position={clickPosition}
                    onAnimationComplete={() => setShowConfetti(false)}
                />
            )}

            {activeWidget && (() => {
                const normalizedLabel = normalizeLabel(activeWidget.label)
                const WidgetComponent = widgetComponents[normalizedLabel]
                
                if (!WidgetComponent) return null
                
                return (
                    <WidgetComponent
                        isOpen={activeWidget !== null}
                        onClose={handleWidgetClose}
                    />
                )
            })()}
        </div>
    )
}

export default CircularMenuV2