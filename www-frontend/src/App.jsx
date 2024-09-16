import React from 'react';
import { Container, Box, Typography, Button, AppBar, Toolbar, IconButton } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import SignUp from './components/SignUp';
import './App.css';
import BarsIndex from './components/BarsIndex';
import BeersIndex from './components/BeersIndex';
import SearchUsers from "./components/SearchUsers";
import BarsEventsIndex from './components/BarsEventsIndex';
import BeersDetail from './components/BeersDetail';
import Header from './components/Header';
import BeersReview from './components/BeersReview';
import BeersReviewIndex from './components/BeersReviewIndex'
import BarsEvents from './components/BarsEvent';
import BarsIndexMap from './components/BarsIndexMap';

function App() {

  return (
    <Router>
      <Container>
      <Header/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/beers" element={<BeersIndex />} />
          <Route path="/beers/:id" element={<BeersDetail />} />
          <Route path="/bars" element={<BarsIndex />} />
          <Route path="/bars-index-map" element={<BarsIndexMap />} />
          <Route path="/search-users" element={<SearchUsers />} />
          <Route path="/bars/:id/events" element={<BarsEventsIndex />} />
          <Route path="/bars/:bar_id/events/:id" element={<BarsEvents />} />
          <Route path="/beers/:id/review" element={<BeersReview />} />
          <Route path="/beers/:id/review-index" element={<BeersReviewIndex />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;