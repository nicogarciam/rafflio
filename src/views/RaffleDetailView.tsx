import { RaffleDetail } from '../components/raffles/RaffleDetail';
import React from 'react';

// Permite recibir props y reenviarlas a RaffleDetail
const RaffleDetailView = (props: any) => <RaffleDetail {...props} />;

export default RaffleDetailView;
