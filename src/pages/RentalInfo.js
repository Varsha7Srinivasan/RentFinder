import { useEffect, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { DataGrid } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, Popup } from 'react-leaflet';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { LatLng } from 'leaflet';

const theme = createTheme();
const AddSourceMarker = ({ setParent, initialposition, average, markerRadius }) => {
  const [position, setPosition] = useState(initialposition);


  useMapEvents({
    click: (e) => {
      setPosition(e.latlng);
      setParent(e.latlng);
    },
  });

  return position === null ? null : (
    <>
      <Marker position={position}>
        <Popup >
          {average}
        </Popup>
      </Marker>

      <Circle center={position} radius={markerRadius}></Circle>
    </>
  );
};

export default function RentalInfo() {

  const [ParentPosition, setParentPosition] = useState(new LatLng(32.92495, -97.03985));
  const [RentalData, setRentalData] = useState([]);
  const [Average, setAverage] = useState("");
  const [range, setRange] = useState(0.5);

  const columns = [
    { field: 'mls', headerName: 'Property Id', width: 250 },
    { field: 'rent', headerName: 'Rent (USD)', width: 250 }
  ];

  const handleRangeChange = (event, value) => {
    setRange(value);
  };
  useEffect(() => {
    console.log(typeof (ParentPosition))
    fetch(`http://localhost:8081/api/props/${ParentPosition.lat}/${ParentPosition.lng}/${range * 1000}`).then(data => {
      return data.json();
    }).then(data => {
      let rows = [];
      data.data.map((i, index) => {
        rows.push({
          mls: i.mls,
          id: index,
          rent: i.rent
        });
        return null;
      });
      let sum = 0;

      if (rows != null && rows.length == 0) { setAverage(" No properties"); }
      else {
        for (let i = 0; i < rows.length; i++) {
          sum += rows[i].rent;
        }
        setAverage(String(parseInt(sum / rows.length)) + " USD");
      }
      console.log(rows);
      setRentalData(rows);

    }).catch(e => {
      setRentalData([]);
      setAverage("No properties");
    });
  }, [ParentPosition, range]);

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Stack spacing={8} direction="column" sx={{ mb: 1 }} alignItems="center">
              <Typography component="h1" variant="h5">
                Rent Finder Full Stack Challenge
              </Typography>
              <Typography component="h1" variant="h5">
                Rent Finder Full Stack Challenge
              </Typography>
              <div style={{ height: 300, width: '100%' }}>
                <DataGrid  rows={RentalData} columns={columns} hideFooter={true} />
              </div>
              <Box sx={{ width: 500 }}>
                <Stack spacing={3} direction="column" sx={{ mb: 1 }} alignItems="center">
                  <Box sx={{ width: 500 }}>
                    <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                      <Typography>0.5 KM</Typography>
                      <Slider aria-label="Range" value={range} onChange={handleRangeChange}
                        defaultValue={0.5}
                        min={0.5}
                        max={20}
                        step={0.5}
                        marks={true}
                      />
                      <Typography>20 KM</Typography>
                    </Stack>
                  </Box>
                  <Typography>Current Range: {range} KM</Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          component={Paper}
        >
          <MapContainer center={ParentPosition} zoom={12} scrollWheelZoom={true}>
            <AddSourceMarker setParent={setParentPosition} initialposition={ParentPosition} average={Average} markerRadius={range * 1000} />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer >
        </Grid>

      </Grid>
    </ThemeProvider>
  );
}