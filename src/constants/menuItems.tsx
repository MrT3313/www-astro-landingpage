import React from "react"

// ICONS
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { type MenuItemType } from "../types"
import { MdAlternateEmail } from "react-icons/md"
import { BsSubstack } from "react-icons/bs";

export const menuItems: MenuItemType[] = [
    // { 
    //   type: "Project",
    //   isLive: true,
    //   label: "🧠 Substack",
    //   Icon: <BsSubstack size={24} />,
    //   backgroundColor: 'white',
    //   iconColor: 'orange',
    //   href: "https://reedturgeon.substack.com/",
    //   segments: [13],
    // },
    // { 
    //   type: "Project",
    //   isLive: false,
    //   label: "🚧⏳ Hourglass",
    //   href: "https://github.com/Hourglass-Attention-Tracker",
    //   segments: [16],
    // },
    // { 
    //   type: "Personal",
    //   isLive: false,
    //   label: "🚧💰 FOLLYo",
    //   segments: [17],
    // },
    // { 
    //   type: "Project",
    //   isLive: false,
    //   label: "🚧🛒 CrowdPI",
    //   segments: [15,16],
    // },
    // { 
    //   type: "Project",
    //   isLive: false,
    //   label: "🚧📔 Story Generator",
    //   segments: [17],
    // },
    // { 
    //   type: "Project",
    //   isLive: false,
    //   label: "🚧💬 AsyncDebate",
    //   segments: [18],
    // },
    // { 
    //   type: "Project",
    //   isLive: false,
    //   label: "🚧 Raspberry Pi",
    //   segments: [18],
    // },
    { 
      type: "Social",
      isLive: true,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/reedturgeon",
      Icon: <FaLinkedin size={24} />,
      segments: [2],
      backgroundColor: 'white',
      iconColor: '#0A66C2'
    },
    { 
      type: "Social",
      isLive: true,
      label: "GitHub", 
      href: "https://github.com/MrT3313",
      Icon: <FaGithub size={24} />,
      segments: [3],
      backgroundColor: 'white',
      iconColor: 'black'
    },
    { 
      type: "Personal",
      isLive: true,
      label: "Reach Out",
      href: "mailto:turgeon.dev+reedturgeon.com@gmail.com",
      Icon: <MdAlternateEmail size={24} />,
      segments: [8],
    },
]



