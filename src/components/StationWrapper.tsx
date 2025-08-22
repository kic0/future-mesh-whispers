import React, { useEffect } from 'react';

type StationWrapperProps = {
  stationId: string;
  children: React.ReactNode;
};

const StationWrapper: React.FC<StationWrapperProps> = ({ stationId, children }) => {
  useEffect(() => {
    console.log(`[StationWrapper] Setting station_id to: ${stationId}`);
    localStorage.setItem('station_id', stationId);
  }, [stationId]);

  return <>{children}</>;
};

export default StationWrapper;
