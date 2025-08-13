import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import FeedbackForm from './components/FeedbackForm';
import ThankYou from './components/ThankYou';

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/feedback" element={<FeedbackForm />} />
    <Route path='/thanks' element={<ThankYou/>}/>
  </Routes>
);

export default App;
