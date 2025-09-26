export enum propertyTypeOptions {
  String = 'string',
  Integer = 'integer',
}

export interface FilterPropertyAttributes {
  key: string;
  description: string;
  type: propertyTypeOptions;
}

export const defaultEnabledFilterProperties: FilterPropertyAttributes[] = [
  {
    key: 'access',
    description: 'Allowed Access',
    type: propertyTypeOptions.String,
  },
  {
    key: 'bicycle_parking',
    description: 'Bicycle Parking Type',
    type: propertyTypeOptions.String,
  },
  {
    key: 'capacity',
    description: 'Capacity',
    type: propertyTypeOptions.Integer,
  },
  {
    key: 'capacity:cargo_bike',
    description: 'Cargo Bike Capacity',
    type: propertyTypeOptions.Integer,
  },
  {
    key: 'cargo_bike',
    description: 'Cargo Bike Suitable',
    type: propertyTypeOptions.String,
  },
  {
    key: 'covered',
    description: 'Covered',
    type: propertyTypeOptions.String,
  },
  {
    key: 'fee',
    description: 'Payment Required',
    type: propertyTypeOptions.String,
  },
  {
    key: 'lit',
    description: 'Lit at Night',
    type: propertyTypeOptions.String,
  },
  {
    key: 'meta_source',
    description: 'Data Source',
    type: propertyTypeOptions.String,
  },
];
