"use client"
import React from 'react';
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className='container'>
        <h1>Quack! 403</h1>
        <Image className='not-found-img' src="/duck2.png" alt="403 image" width={500} height={500} />
        <p style={{fontSize: '1.2rem'}}>Not Permitted!!</p>
        <button className='go-back' onClick={() => {window.location = '/home'}}>Go back</button>
      </div>
    </div>
  );
};