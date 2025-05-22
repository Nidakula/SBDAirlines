import React from 'react';
import GeneralSection from '../comps/generalsection';
import ImageCarousel from '../comps/imageCarousel';
import FeaturesSection from '../comps/featuresSection';
import TestimonialsSection from '../comps/testimonials';

export default function Home() {
  return (
    <div className="relative">
      <div className="relative z-10">
        <GeneralSection 
          showLoginButton={true}
        />
      </div>
      
      <ImageCarousel />
      
      <FeaturesSection />
      
      <TestimonialsSection />
    </div>
  );
}