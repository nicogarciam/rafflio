import React from 'react';
import { RaffleDetail } from '../components/raffles/RaffleDetail';

// Permite recibir props y reenviarlas a RaffleDetail
const RaffleDetailView = (props: any) => <RaffleDetail {...props} />;

export default RaffleDetailView;
