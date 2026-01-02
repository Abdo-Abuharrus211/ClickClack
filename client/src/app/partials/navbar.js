'use client'
import Link from 'next/link';
import { useState, useEffect } from "react";



export default function Navbar () {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    return (
        <nav className='navbar'>
            <div className='nav-logo'>
                {/* TODO: Add the logo here*/}
                <Link href="/home">ClickClack</Link> 
            </div>
            <div className='nav-btns'>
                <Link href="/profile">Profile</Link>
                <button onClick={toggleTheme}>{theme === 'light' ? 'Dark' : 'Light'}</button>
            </div>
        </nav>
    );
};