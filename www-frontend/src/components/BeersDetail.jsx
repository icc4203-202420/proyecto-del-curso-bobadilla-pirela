import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Divider
} from '@mui/material';

const BeersDetail = () => {
  const { id } = useParams();
  const [beer, setBeer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/api/v1/beers/${id}`)
      .then(response => {
        setBeer(response.data.beer);
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
                <strong>Brand:</strong> {beer.brand_id ? beer.brand_id.name : 'N/A'}
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
  );
};

export default BeersDetail;
