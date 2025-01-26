import React from 'react';
import {MapGeoJSONFeature} from 'maplibre-gl';

import {bicycleParkingDescriptions as bpDesc} from './bicycle_parkingDescriptions';

export interface ParkingFeatureDescriptionProps {
  feature: MapGeoJSONFeature;
}

export function ParkingFeatureDescription({
  feature,
}: ParkingFeatureDescriptionProps) {
  if (!feature.properties) {
    return <p>Feature has no properties</p>;
  }

  const {bicycle_parking, capacity, operator, covered, fee, image} =
    feature.properties;

  const parkingTypeDescription = bicycle_parking
    ? bpDesc?.[bicycle_parking] ?? bicycle_parking
    : 'Unknown Type';
  const capacityDescription = capacity
    ? `🚲 x ${capacity}`
    : 'Unknown Capacity';

  const indicators = [];
  if (covered === 'yes') indicators.push('☂️');
  if (fee === 'yes') indicators.push('💲');
  const indicatorList =
    indicators.length > 0 ? ' ' + indicators.join(' ') : null;

  return (
    <div>
      <h3>
        {parkingTypeDescription} ({capacityDescription}){indicatorList}
      </h3>
      {operator ? <p>Operator: {operator}</p> : null}
      {covered === 'yes' ? <p>☂️ covered</p> : null}
      {fee === 'yes' ? <p>💲 requires payment</p> : null}
      {image ? (
        <p>
          📷{' '}
          <a href={image} target="_blank">
            {image}
          </a>
        </p>
      ) : null}
    </div>
  );
}
