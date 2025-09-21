export interface FilterPropertyAttributes {
  key: string;
  description: string;
  type: 'string' | 'integer';
}

export const defaultEnabledFilterProperties: FilterPropertyAttributes[] = [
  {
    key: 'access',
    description: 'Allowed Access',
    type: 'string',
  },
  {
    key: 'bicycle_parking',
    description: 'Bicycle Parking Type',
    type: 'string',
  },
  {
    key: 'capacity',
    description: 'Capacity',
    type: 'integer',
  },
  {
    key: 'capacity:cargo_bike',
    description: 'Cargo Bike Capacity',
    type: 'integer',
  },
  {
    key: 'cargo_bike',
    description: 'Cargo Bike Suitable',
    type: 'string',
  },
  {
    key: 'covered',
    description: 'Covered',
    type: 'string',
  },
  {
    key: 'fee',
    description: 'Payment Required',
    type: 'string',
  },
  {
    key: 'lit',
    description: 'Lit at Night',
    type: 'string',
  },
  {
    key: 'meta_source',
    description: 'Data Source',
    type: 'string',
  },
];
