import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type StationWrapperProps = {
  stationId: string;
  children: React.ReactNode;
};

const StationWrapper: React.FC<StationWrapperProps> = ({ stationId, children }) => {
  const location = useLocation();

  useEffect(() => {
    console.log(`[StationWrapper] Setting station_id to: ${stationId}`);
    localStorage.setItem('station_id', stationId);
    sessionStorage.setItem('station_start_path', location.pathname);
  }, [stationId, location.pathname]);

  return <>{children}</>;
};

export default StationWrapper;
