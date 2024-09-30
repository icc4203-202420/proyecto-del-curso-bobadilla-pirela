import React, { useReducer, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Typography, Box, BottomNavigation, BottomNavigationAction, CircularProgress, Grid, Pagination } from '@mui/material';
import { Rating } from '@mui/material';
import main_icon from '../assets/icon_beercheers.png';
import { ChevronLeft } from '@mui/icons-material';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchyellow.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';

const initialState = {
  reviews: [],
  loading: true,
  error: null,
  page: 1,
  totalPages: 1,
  beerName: '',
  needsLogin: false,
};

const actions = {
  SET_REVIEWS: 'SET_REVIEWS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PAGE: 'SET_PAGE',
  SET_TOTAL_PAGES: 'SET_TOTAL_PAGES',
  SET_BEER_NAME: 'SET_BEER_NAME',
  SET_NEEDS_LOGIN: 'SET_NEEDS_LOGIN',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_REVIEWS:
      return { ...state, reviews: action.payload, loading: false };
    case actions.SET_LOADING:
      return { ...state, loading: true };
    case actions.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actions.SET_PAGE:
      return { ...state, page: action.payload };
    case actions.SET_TOTAL_PAGES:
      return { ...state, totalPages: action.payload };
    case actions.SET_BEER_NAME:
      return { ...state, beerName: action.payload };
    case actions.SET_NEEDS_LOGIN:
      return { ...state, needsLogin: true, loading: false };
    default:
      return state;
  }
};

const BeersReviewIndex = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchReviews = async () => {
      dispatch({ type: actions.SET_LOADING });

      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: actions.SET_NEEDS_LOGIN });
        return;
      }

      try {
        const beerResponse = await axios.get(`http://localhost:3000/api/api/v1/beers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        dispatch({ type: actions.SET_BEER_NAME, payload: beerResponse.data.name });

        const reviewsResponse = await axios.get(`http://localhost:3000/api/api/v1/beers/${id}/reviews`, {
          params: { page: state.page },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const { reviews, total_pages } = reviewsResponse.data;

        dispatch({ type: actions.SET_REVIEWS, payload: reviews });
        dispatch({ type: actions.SET_TOTAL_PAGES, payload: total_pages });
      } catch (error) {
        dispatch({ type: actions.SET_ERROR, payload: error.message });
      }
    };

    fetchReviews();
  }, [id, state.page]);

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (state.needsLogin) {
    return (
      <Container component="main" maxWidth="md" sx={{ paddingBottom: 10 }}>
        <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
          You need to log in to see all reviews. 
        </Typography>
      </Container>
    );
  }

  if (state.error) {
    return <Typography variant="h6">Error: {state.error}</Typography>;
  }

  return (
    <Container component="main" maxWidth="md" sx={{ paddingBottom: 10 }}>
      <Box
        onClick={() => navigate(`/beers/${id}`)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          mb: 1,
          cursor: 'pointer'
        }}
      >
        <ChevronLeft sx={{ color: 'white' }} />
      </Box>

      <Box
        component="img"
        src={main_icon}
        alt="Icon"
        sx={{ width: 100, height: 'auto', marginBottom: 1 }}
      />

      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: 'white',
          textAlign: 'center',
          mt: 2,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 900,
          fontSize: '50px',
          textShadow: '1px 3px 3px black',
          WebkitTextStroke: '1px black',
          MozTextStroke: '1px black',
        }}
      >
        Reviews for {state.beerName}
      </Typography>

      {state.reviews.length > 0 ? (
        <Grid container spacing={2}>
          {state.reviews.map((review, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ padding: 2, mb: 2, background: '#606060', color: 'white', fontFamily: 'Roboto, sans-serif'}}>
                <Typography variant="h6">
                  <Rating value={review.rating} readOnly />
                </Typography>
                <Typography variant="body1">
                  {review.text}
                </Typography>
                <Typography variant="body2" sx={{color:'#CFB523'}}>
                  <strong>By:</strong> {review.user.handle} on {new Date(review.created_at).toLocaleDateString()}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{color:'#CFB523'}}>No reviews found.</Typography>
      )}

      <Box mt={3} display="flex" justifyContent="center" sx={{ color: '#CFB523' }}>
        <Pagination
          count={state.totalPages}
          page={state.page}
          onChange={(event, value) => dispatch({ type: actions.SET_PAGE, payload: value })}
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#CFB523',
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#CFB523',
              color: '#000',
            },
            '& .MuiPaginationItem-ellipsis': {
              color: '#CFB523',
            },
          }}
        />
      </Box>

      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation sx={{ backgroundColor: '#303030', color: '#CFB523', borderTop: '2px solid #CFB523' }}>
          <BottomNavigationAction onClick={() => navigate('/bars')} label="Home" icon={
            <Box
              component="img"
              src={HomeIcon}
              alt="Bars"
              sx={{ width: 72, height: 70 }}
            />
          } />
          <BottomNavigationAction onClick={() => navigate('/beers')} label="Search" icon={
            <Box
              component="img"
              src={SearchIcon}
              alt="Search"
              sx={{ width: 32, height: 26 }}
            />
          }/>
          <BottomNavigationAction onClick={() => navigate('/bars-index-map')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
          <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
        </BottomNavigation>
      </Box>
    </Container>
  );
};

export default BeersReviewIndex;
