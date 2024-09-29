import { useState, useEffect, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useLoadGMapsLibraries } from '../hooks/useLoadGMapsLibraries';
import { ControlPosition, MAPS_LIBRARY, MARKER_LIBRARY } from '../hooks/constants';
import { Box, Container, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '../assets/baricon_gray.png';
import SearchIcon from '../assets/searchgray.png';
import MapIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import main_icon from '../assets/icon_beercheers.png';

const MAP_CENTER = { lat: -31.56391, lng: 147.154312 };
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const BarsIndexMap = () => {
  const libraries = useLoadGMapsLibraries();
  const markerCluster = useRef();
  const mapNodeRef = useRef();
  const mapRef = useRef();
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const infoWindowRef = useRef();
  const inputRef = useRef();
  const navigate = useNavigate();

  // Petición bars
  useEffect(() => {
    const fetchBars = async () => {
      const url = `${BASE_URL}/api/v1/bars`;
      const response = await fetch(url);
      const dataParsed = await response.json();
      setBars(dataParsed.bars || []);
      setFilteredBars(dataParsed.bars || []);
    };

    fetchBars();
  }, []);

  useEffect(() => {
    if (!libraries) {
      return;
    }

    const { Map, InfoWindow } = libraries[MAPS_LIBRARY];
    const { AdvancedMarkerElement: Marker, PinElement } = libraries[MARKER_LIBRARY];

    if (!Map || !InfoWindow || !Marker || !PinElement) {
      console.error('Google Maps libraries not loaded correctly');
      return;
    }

    mapRef.current = new Map(mapNodeRef.current, {
      center: MAP_CENTER,
      zoom: 7,
      mapId: import.meta.env.VITE_PUBLIC_MAP_ID
    });

    mapRef.current.controls[ControlPosition.TOP_LEFT].push(inputRef.current);

    // Obtener mi posición
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const useCords = { lat: latitude, lng: longitude };

      const marker = new Marker({
        position: useCords,
        map: mapRef.current,
        title: 'Mi Ubicación',
      });
      marker.setMap(mapRef.current);
    });

    const createMarkers = (barsToDisplay) => {
      // Limpiar marcadores antiguos
      if (markerCluster.current) {
        markerCluster.current.clearMarkers();
      }

      // Crear los marcadores para los bares filtrados
      const markers = barsToDisplay.map(({ name, latitude, longitude }) => {
        const position = { lat: latitude, lng: longitude };
        const pin = new PinElement();
        pin.glyph = name;
        pin.background = "00ff00";

        const marker = new Marker({
          position,
          map: mapRef.current,
          content: pin.element,
        });

        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          const infoWindow = new InfoWindow({
            content: `<div>${name}</div>`,
            position,
          });

          infoWindow.open(mapRef.current, marker);
          infoWindowRef.current = infoWindow;
        });

        return marker;
      });

      markerCluster.current = new MarkerClusterer({
        map: mapRef.current,
        markers,
      });

      if (barsToDisplay.length > 0) {
        const firstBarPosition = { lat: barsToDisplay[0].latitude, lng: barsToDisplay[0].longitude };
        mapRef.current.panTo(firstBarPosition);
      }
    };

    createMarkers(filteredBars);
  }, [libraries, filteredBars]);

  const handleInputChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = bars.filter(bar => 
      bar.name.toLowerCase().includes(searchTerm) ||
      bar.address.line1?.toLowerCase().includes(searchTerm) ||
      bar.address.line2?.toLowerCase().includes(searchTerm) ||
      bar.address.city.toLowerCase().includes(searchTerm) ||
      (bar.address.country && bar.address.country.name.toLowerCase().includes(searchTerm))
    );
    setFilteredBars(filtered);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleInputChange(event);
    }
  };

  if (!libraries) {
    return <h1>Cargando. . .</h1>;
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 0, pb: 12 }}>
      <Box
        component="img"
        src={main_icon}
        alt="Icon"
        sx={{ width: 100, height: 'auto', marginBottom: 2, marginTop: 2 }}
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
        Find your<br />
        favorite bar
      </Typography>

      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar..."
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '10px',
          fontSize: '16px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      <div
        ref={mapNodeRef}
        style={{
          width: '110%', // Cambiado de '1000%' a '100%'
          height: '500px', // Altura ocupando todo menos el navbar
          marginBottom: '64px',
          display: 'flex-center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
      
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation sx={{ backgroundColor: '#303030', color: '#E3E5AF', borderTop: '2px solid #CFB523' }}>
          <BottomNavigationAction 
            onClick={() => navigate('/bars')} 
            label="Home" 
            icon={<Box component="img" src={HomeIcon} alt="Bars" sx={{ width: 72, height: 70 }} />} 
          />
          <BottomNavigationAction 
            onClick={() => navigate('/beers')} 
            label="Search" 
            icon={<Box component="img" src={SearchIcon} alt="Search" sx={{ width: 32, height: 26 }} />} 
          />
          <BottomNavigationAction 
            onClick={() => navigate('/bars-index-map')} 
            label="Map" 
            icon={<MapIcon />} 
            sx={{ color: '#CFB523' }} 
          />
          <BottomNavigationAction 
            onClick={() => navigate('/search-users')} 
            label="User" 
            icon={<PersonIcon />} 
            sx={{ color: '#E3E5AF' }} 
          />
        </BottomNavigation>
      </Box>
    </Container>
  );
};

export default BarsIndexMap;
