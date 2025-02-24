"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

function AddressCarousel({ addresses, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!addresses?.length) return null;

  const nextAddress = () => {
    setCurrentIndex((prev) => (prev + 1) % addresses.length);
  };

  const prevAddress = () => {
    setCurrentIndex((prev) => (prev - 1 + addresses.length) % addresses.length);
  };

  return (
    <div className="bg-[#373A40] rounded-lg p-4">
      <div className="text-[#909296] text-sm font-[Inter] mb-2">{title}</div>
      <div className="flex items-center justify-between">
        <button 
          onClick={prevAddress}
          disabled={addresses.length <= 1}
          className="text-[#C1C2C5] px-2 disabled:opacity-50"
        >
          ←
        </button>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#C1C2C5] text-sm font-mono overflow-hidden text-ellipsis"
        >
          {addresses[currentIndex]}
        </motion.div>
        <button 
          onClick={nextAddress}
          disabled={addresses.length <= 1}
          className="text-[#C1C2C5] px-2 disabled:opacity-50"
        >
          →
        </button>
      </div>
      <div className="text-[#909296] text-xs text-center mt-1">
        {currentIndex + 1} of {addresses.length}
      </div>
    </div>
  );
}

export default function VerifiedAddresses({ addresses, ensNames, solanaAddresses }) {
  if (!addresses?.length && !ensNames?.length && !solanaAddresses?.length) return null;

  return (
    <div className="space-y-4 mt-4">
      {addresses?.length > 0 && (
        <AddressCarousel 
          addresses={addresses} 
          title="Ethereum Addresses" 
        />
      )}
      {ensNames?.length > 0 && (
        <AddressCarousel 
          addresses={ensNames} 
          title="ENS Names" 
        />
      )}
      {solanaAddresses?.length > 0 && (
        <AddressCarousel 
          addresses={solanaAddresses} 
          title="Solana Addresses" 
        />
      )}
    </div>
  );
} 