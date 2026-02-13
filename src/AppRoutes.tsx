import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';

import StationWrapper from './components/StationWrapper';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Demographics from './pages/Demographics';
import DemographicsGender from './pages/DemographicsGender';
import DemographicsAge from './pages/DemographicsAge';
import DemographicsResident from './pages/DemographicsResident';
import Question from './pages/Question';
import ThankYou from './pages/ThankYou';
import Stats from './pages/Stats';
import { useSurvey } from './context/SurveyContext';

const QRoute = () => {
  const { id } = useParams();
  const { questions, loading } = useSurvey();
  const num = Number(id);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (questions.length === 0) {
    return <div>No questions are available at the moment.</div>;
  }

  if (isNaN(num) || num < 1 || num > questions.length) {
    return <Navigate to="/q/1" replace />;
  }

  return <Question questionNumber={num} />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StationWrapper stationId="WEB"><Index /></StationWrapper>} />
      <Route path="/totem-1" element={<StationWrapper stationId="TOTEM-1"><Index /></StationWrapper>} />
      <Route path="/totem-2" element={<StationWrapper stationId="TOTEM-2"><Index /></StationWrapper>} />
      <Route path="/totem-3" element={<StationWrapper stationId="TOTEM-3"><Index /></StationWrapper>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/demographics" element={<Demographics />} />
      <Route path="/demographics/genero" element={<DemographicsGender />} />
      <Route path="/demographics/idade" element={<DemographicsAge />} />
      <Route path="/demographics/residente" element={<DemographicsResident />} />
      <Route path="/q/:id" element={<QRoute />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/stats" element={<Stats />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
