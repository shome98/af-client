import { APP } from '@/constants/landing.constant';
import Image from 'next/image';
import React from 'react';
import icon from '@/app/icon.png';

const Logo = () => {
  return (
    <div className='flex gap-2'>
      <Image src={icon} alt="site logo image" width={20} height={20} />
      <span>{APP.name}</span>
    </div>
  );
};

export default Logo;
