import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';

// ICONS
import { IoClose } from 'react-icons/io5';

// COMPONENTS
import { LayoutCorner } from './LayoutCorner';
import InteractionModality from '../InteractionModality';
import { WDYDTW } from '../WDYDTW';
import { wdydtwData } from '../WDYDTW/mock';
import { GameOfLife } from '../GameOfLife';
import { CircularMenu } from '../CircularMenu';
import { menuItems } from '../../constants/menuItems';

interface LayoutProps {
  debug?: boolean;
  children: React.ReactNode;
}

// CONSTS
const today = new Date()

export const Layout: React.FC<LayoutProps> = ({ debug = true, children }) => {
  const [isBreakpointsVisible, setBreakpointsVisible] = useState(false);
  
  const viewportInfoRef = useRef<HTMLDivElement>(null);
  const optimalExperienceInfoRef = useRef<HTMLDivElement>(null);
  const optimalDescriptionRef = useRef<HTMLSpanElement>(null);
  const optimalIconRef = useRef<HTMLSpanElement>(null);
  const breakpointsLayoutRef = useRef<HTMLDivElement>(null);

  const getBreakpointInfo = (width: number, orientation: string) => {
    if (orientation === 'portrait') {
        if (width < 480) return { name: 'Base', color: 'rgb(156, 163, 175)' }; // gray-400
        if (width < 834) return { name: 'Mobile', color: 'rgb(96, 165, 250)' }; // blue-400
        if (width < 1440) return { name: 'Tablet', color: 'rgb(74, 222, 128)' }; // green-400
        return { name: 'Laptop', color: 'rgb(192, 132, 252)' }; // purple-400
    } else {
        if (width < 768) return { name: 'Base', color: 'rgb(156, 163, 175)' }; // gray-400
        if (width < 1024) return { name: 'Mobile', color: 'rgb(250, 204, 21)' }; // yellow-400
        if (width < 1440) return { name: 'Tablet', color: 'rgb(248, 113, 113)' }; // red-400
        return { name: 'Desktop', color: 'rgb(244, 114, 182)' }; // pink-400
    }
  }

  const updateViewportInfo = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width > height ? 'Landscape' : 'Portrait';
    const { name, color } = getBreakpointInfo(width, orientation.toLowerCase());

    if (viewportInfoRef.current) {
      viewportInfoRef.current.textContent = `${name} : ${orientation} (${width}px × ${height}px)`;
      viewportInfoRef.current.style.backgroundColor = color;
    }

    const optimalExperienceInfo = optimalExperienceInfoRef.current;
    const optimalDescription = optimalDescriptionRef.current;
    const optimalIcon = optimalIconRef.current;
    const breakpointsLayout = breakpointsLayoutRef.current;
    const interactionModality = document.body.getAttribute('data-interaction-modality') || 'mouse';

    if (!optimalExperienceInfo || !optimalDescription || !optimalIcon || !breakpointsLayout) return;
    
    const touchMessage = 'UI is built for 🖱️ Mouse interactions';

    if (width < 400) {
        optimalDescription.textContent = 'Width incompatible w/ Circular Menu (V2)';
        if (interactionModality === 'touch') {
            optimalDescription.textContent += ` • ${touchMessage}`;
        }
        optimalDescription.classList.remove('hidden');
        optimalIcon.textContent = '🔴';
        optimalExperienceInfo.style.backgroundColor = 'rgb(239 68 68)';
        breakpointsLayout.classList.remove('flex-row');
        breakpointsLayout.classList.add('flex-col');
        return;
    } else if (width < 525) {
        if (interactionModality === 'mouse') {
            optimalDescription.textContent = '';
            optimalDescription.classList.add('hidden');
            optimalIcon.textContent = '🟡';
            optimalExperienceInfo.style.backgroundColor = 'rgb(234 179 8)';
            breakpointsLayout.classList.remove('flex-col');
            breakpointsLayout.classList.add('flex-row');
        } else {
            optimalDescription.textContent = `${touchMessage}`;
            optimalDescription.classList.remove('hidden');
            optimalIcon.textContent = '🔴';
            optimalExperienceInfo.style.backgroundColor = 'rgb(239 68 68)';
            breakpointsLayout.classList.remove('flex-row');
            breakpointsLayout.classList.add('flex-col');
        }
        return;
    }

    if (interactionModality !== 'mouse') {
        optimalDescription.textContent = touchMessage;
        optimalDescription.classList.remove('hidden');
        optimalIcon.textContent = '🟡';
        optimalExperienceInfo.style.backgroundColor = 'rgb(234 179 8)';
        breakpointsLayout.classList.remove('flex-row');
        breakpointsLayout.classList.add('flex-col');
        return;
    }

    optimalDescription.textContent = '';
    optimalDescription.classList.add('hidden');
    optimalIcon.textContent = '🟢';
    optimalExperienceInfo.style.backgroundColor = 'rgb(34 197 94)';
    breakpointsLayout.classList.remove('flex-col');
    breakpointsLayout.classList.add('flex-row');
  }

  useEffect(() => {
    updateViewportInfo();
    window.addEventListener('resize', updateViewportInfo);
    
    // Also listen for custom event from InteractionModality
    document.body.addEventListener('interaction-modality-changed', updateViewportInfo);


    return () => {
      window.removeEventListener('resize', updateViewportInfo);
      document.body.removeEventListener('interaction-modality-changed', updateViewportInfo);
    };
  }, []);

  return (
    <div className={cx(
        'bg-black',
        "relative min-h-screen flex flex-col items-center justify-center m-0 p-0 font-sans",
        debug && [
            "border-4 border-gray-400",
            "portrait-mobile:border-blue-400",
            "portrait-tablet:border-green-400",
            "portrait-laptop:border-purple-400",
            "landscape-mobile:border-yellow-400",
            "landscape-tablet:border-red-400",
            "landscape-desktop:border-pink-400",
        ],
    )}>
        <GameOfLife zIndex="z-0" />

        <CircularMenu menuItems={menuItems} />

        {!isBreakpointsVisible ? (
            <LayoutCorner {...{ 
                corner: 'top-right',
                background: {
                    default: 'bg-teal-500/70',
                    hover: 'hover:bg-teal-500/90'
                }
            }}>
                <button
                    onClick={() => setBreakpointsVisible(true)}
                    className="flex px-3 py-1 text-sm hover:cursor-pointer"
                >
                    ?
                </button>
            </LayoutCorner>
        ) : (
            <LayoutCorner {...{ corner: 'top-right' }}>
                <div 
                    onClick={() => setBreakpointsVisible(false)}
                    className="relative text-xs p-4 cursor-pointer min-w-fit ml-2 z-40"
                >
                    <div className="absolute top-2 left-2">
                        <IoClose />
                    </div>
                    <div id="breakpointsLayout" ref={breakpointsLayoutRef} className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col items-end justify-center">
                                <h3 className="font-bold mb-2">Viewport</h3>
                                <div ref={viewportInfoRef} className="px-2 py-1 rounded"></div>
                            </div>
                            <div className="flex flex-col items-end justify-center">
                                <InteractionModality />
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-center">
                            <h3 className="flex font-bold mb-2">Optimal?</h3>
                            <div ref={optimalExperienceInfoRef} className="flex items-center justify-center gap-2 px-2 py-1 rounded">
                                <span ref={optimalDescriptionRef} className="flex text-right hidden"></span>
                                <span ref={optimalIconRef} className="flex items-center justify-center"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </LayoutCorner>
        )}

        <LayoutCorner {...{ 
            corner: 'top-left'
        }}>
            <div
                className="text-center p-2"
            >
                <h2 className="text-4xl">🚧 Under Construction</h2>
            </div> 
        </LayoutCorner>

        {/* <WDYDTW data={wdydtwData} today={today} /> */}
      
      {children}
    </div>
  );
}; 