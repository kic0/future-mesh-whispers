import React, { useEffect } from 'react';

type StationWrapperProps = {
  stationId: string;
  children: React.ReactNode;
};

const StationWrapper: React.FC<StationWrapperProps> = ({ stationId, children }) => {
  useEffect(() => {
    localStorage.setItem('station_id', stationId);
  }, [stationId]);

  return <>{children}</>;
};

export default StationWrapper;
