import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, BottomNavigation, BottomNavigationAction, CardMedia, Typography, Grid, CircularProgress, Box, Divider } from '@mui/material';
import main_icon from '../assets/icon_beercheers.png';
import { ChevronLeft } from '@mui/icons-material';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchyellow.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';

const BeersDetail = () => {
  const { id } = useParams();
  const [beer, setBeer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/api/api/v1/beers/${id}`)
      .then(response => {
        const beerData = response.data;
        setBeer(beerData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching beer details:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!beer) {
    return <Typography variant="h6">Beer not found</Typography>;
  }

  return (
    <Container component="main" maxWidth="md"> 
      <Box
        onClick={() => navigate('/beers')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          mb: 1,
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

      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ padding: 4 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={8}>
                <Typography variant="h4" component="div" align="center" gutterBottom>
                  {beer.name}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                {beer.image_url && (
                  <CardMedia
                    component="img"
                    height="150"
                    image={beer.image_url}
                    alt={beer.name}
                  />
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Type:</strong> {beer.beer_type}
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {beer.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Hop:</strong> {beer.hop}
                </Typography>
                <Typography variant="body1">
                  <strong>Malts:</strong> {beer.malts}
                </Typography>
                <Typography variant="body1">
                  <strong>Alcohol:</strong> {beer.alcohol}
                </Typography>
              </Grid>

            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Brand:</strong> {beer.brand ? beer.brand.name : 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Brewery:</strong> {beer.brand && beer.brand.brewery ? beer.brand.brewery.name : 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Style:</strong> {beer.style}
              </Typography>
              <Typography variant="body1">
                <strong>Yeast:</strong> {beer.yeast}
              </Typography>
              <Typography variant="body1">
                <strong>IBU:</strong> {beer.ibu}
              </Typography>
              <Typography variant="body1">
                <strong>BLG:</strong> {beer.blg}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box mt={3}>
            <Typography variant="h6" component="div">
              <strong>Bars Serving This Beer:</strong>
            </Typography>
            {beer.bars && beer.bars.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {beer.bars.map((bar, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ padding: 2 }}>
                      <Typography variant="body1">
                        <strong>Bar Name:</strong> {bar.name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Address:</strong> {bar.address ? `${bar.address.street}, ${bar.address.city}, ${bar.address.country.name}` : 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1">No bars serving this beer.</Typography>
            )}
          </Box>

            <Divider sx={{ my: 2 }} />

            <Box mt={3} textAlign="center">
              <Typography variant="h6" component="div">
                <strong>Average Rating:</strong>
              </Typography>
              <Typography variant="h4" color="primary">
                {beer.avg_rating ? beer.avg_rating.toFixed(2) : 'N/A'}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

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
        <BottomNavigationAction onClick={() => navigate('/bars')} label="Map" icon={<MapIcon />} sx={{ color: '#E3E5AF' }} />
        <BottomNavigationAction onClick={() => navigate('/search-users')} label="User" icon={<PersonIcon />} sx={{ color: '#E3E5AF' }} />
      </BottomNavigation>
      </Box>
    </Container>
  );
};

export default BeersDetail;
