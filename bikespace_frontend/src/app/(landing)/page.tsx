import React from 'react';

import {
  HeroBlock,
  FeatureBoxWrapper,
  FeatureBox,
} from '@/components/content-pages/content-blocks';

import bikespaceIntro from '@/assets/images/Hero_Concept_v2_web.jpg';
import featureBoxParkingMap from '@/assets/images/parking-map-mobile.png';
import featureBoxApp from '@/assets/images/mobile_reporting_app.png';
import featureBoxDashboard from '@/assets/images/desktop_dashboard_2024-02.png';
import featureBoxLTSMap from '@/assets/images/lts_map_mobile.png';

export const metadata = {
  title: "BikeSpace - Toronto's Bike Parking App",
};

export default function Page() {
  return (
    <>
      <HeroBlock
        tagline="Digital tools to improve bicycle parking in Toronto"
        imageSrc={bikespaceIntro.src}
        imageAlt="An illustration of different types of bicycle parking, ranging from sidewalk bike stands to a secure bike shed"
      ></HeroBlock>

      <h2>Tools and Resources</h2>
      <FeatureBoxWrapper>
        <FeatureBox
          title="Bike Parking Map"
          description="Find bike parking in Toronto using data from the City and OpenStreetMap"
          imageSrc={featureBoxParkingMap.src}
          imageAlt="Image of a phone showing the bicycle parking map. There are markers showing different bicycle parking locations."
          linksTo="/parking-map"
          umamiEvent="parking-map-from-front-page-feature-box"
        />
        <FeatureBox
          title="Level of Traffic Stress"
          description="Map showing ratings of how safe or unsafe a road or trail feels to bike on"
          imageSrc={featureBoxLTSMap.src}
          imageAlt="Image of a phone showing the level of traffic stress map. Roads and trails are colour-coded according to the LTS ratings."
          linksTo="/lts-map"
          umamiEvent="lts-map-from-front-page-feature-box"
        />
        <FeatureBox
          title="Report an Issue"
          description="Report issues such as areas without bike parking or bike parking that is full or damaged"
          imageSrc={featureBoxApp.src}
          imageAlt="Image of a phone showing the issue submission form. The form is showing a question about the kind of issue the user encountered."
          linksTo="/submission"
          umamiEvent="submission-from-front-page-feature-box"
        />
        <FeatureBox
          title="Issue Dashboard"
          description="Explore bike parking issues reported by BikeSpace users"
          imageSrc={featureBoxDashboard.src}
          imageAlt="Image of a computer showing the issue dashboard page. The page includes a map of issue locations and some charts with summary information."
          linksTo="/dashboard"
          umamiEvent="dashboard-from-front-page-feature-box"
        />
      </FeatureBoxWrapper>
    </>
  );
}
