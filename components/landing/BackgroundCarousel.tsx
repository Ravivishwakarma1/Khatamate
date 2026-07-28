'use client';

import React from 'react';
import styles from './BackgroundCarousel.module.css';

// High-resolution photography of shops, merchants, products, payments & local commerce
const ROW_1_IMAGES = [
  {
    id: 'r1-1',
    src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    alt: 'Local Kirana Shop',
  },
  {
    id: 'r1-2',
    src: 'https://images.unsplash.com/photo-1556742049-0a67daf40955?w=600&auto=format&fit=crop&q=80',
    alt: 'Digital Payment Counter',
  },
  {
    id: 'r1-3',
    src: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80',
    alt: 'Market Stall Vendor',
  },
  {
    id: 'r1-4',
    src: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&auto=format&fit=crop&q=80',
    alt: 'Store Inventory',
  },
  {
    id: 'r1-5',
    src: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&auto=format&fit=crop&q=80',
    alt: 'Business Transaction',
  },
  {
    id: 'r1-6',
    src: 'https://images.unsplash.com/photo-1580974928064-27ae1708899e?w=600&auto=format&fit=crop&q=80',
    alt: 'Retail Counter',
  },
  {
    id: 'r1-7',
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    alt: 'Smiling Merchant',
  },
  {
    id: 'r1-8',
    src: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80',
    alt: 'UPI Payment Mobile',
  },
];

const ROW_2_IMAGES = [
  {
    id: 'r2-1',
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
    alt: 'Shop Collaboration',
  },
  {
    id: 'r2-2',
    src: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    alt: 'Business Owner',
  },
  {
    id: 'r2-3',
    src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80',
    alt: 'Shop Owner Portrait',
  },
  {
    id: 'r2-4',
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    alt: 'Entrepreneur Merchant',
  },
  {
    id: 'r2-5',
    src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
    alt: 'Store Manager',
  },
  {
    id: 'r2-6',
    src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
    alt: 'Ledger App on Tablet',
  },
  {
    id: 'r2-7',
    src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    alt: 'Customer Billing',
  },
  {
    id: 'r2-8',
    src: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    alt: 'Storefront Display',
  },
];

const ROW_3_IMAGES = [
  {
    id: 'r3-1',
    src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    alt: 'Fresh Goods Store',
  },
  {
    id: 'r3-2',
    src: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=80',
    alt: 'Supermarket Aisle',
  },
  {
    id: 'r3-3',
    src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    alt: 'Fintech Payments',
  },
  {
    id: 'r3-4',
    src: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=600&auto=format&fit=crop&q=80',
    alt: 'Successful Transaction',
  },
  {
    id: 'r3-5',
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    alt: 'Modern Boutique Store',
  },
  {
    id: 'r3-6',
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    alt: 'Business Growth',
  },
  {
    id: 'r3-7',
    src: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&auto=format&fit=crop&q=80',
    alt: 'Fast Checkout',
  },
  {
    id: 'r3-8',
    src: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    alt: 'Happy Shopping',
  },
];

export function BackgroundCarousel() {
  // Duplicate arrays to guarantee 100% infinite marquee loop without seams
  const row1List = [...ROW_1_IMAGES, ...ROW_1_IMAGES];
  const row2List = [...ROW_2_IMAGES, ...ROW_2_IMAGES];
  const row3List = [...ROW_3_IMAGES, ...ROW_3_IMAGES];

  return (
    <div className={styles.container} aria-hidden="true">
      {/* Dark gradient & edge vignette overlays */}
      <div className={styles.overlay} />
      <div className={styles.fadeEdges} />

      {/* Multi-row Marquee Wrapper */}
      <div className={styles.carouselWrapper}>
        {/* Row 1 - Left to Right */}
        <div className={styles.row}>
          <div className={styles.trackLeft}>
            {row1List.map((item, index) => (
              <div key={`r1-${item.id}-${index}`} className={styles.card}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <div className={styles.cardOverlay} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Right to Left */}
        <div className={styles.row}>
          <div className={styles.trackRight}>
            {row2List.map((item, index) => (
              <div key={`r2-${item.id}-${index}`} className={styles.card}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <div className={styles.cardOverlay} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 - Left to Right (Slow) */}
        <div className={styles.row}>
          <div className={styles.trackLeftSlow}>
            {row3List.map((item, index) => (
              <div key={`r3-${item.id}-${index}`} className={styles.card}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className={styles.cardImage}
                  loading="lazy"
                />
                <div className={styles.cardOverlay} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
